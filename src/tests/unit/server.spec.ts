import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createClient } from '@/supabase/server';

// Mock the required dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => 'test-supabase-client'),
}));

describe('Supabase Client Creation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-url.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NODE_ENV: 'development',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('in non-test environment', () => {
    it('should create a server client with cookie handling', async () => {
      // Mock cookie methods
      const mockGetAll = jest.fn().mockReturnValue([
        { name: 'cookie1', value: 'value1' },
        { name: 'cookie2', value: 'value2' },
      ]);

      const mockSet = jest.fn();

      const mockCookieStore = {
        getAll: mockGetAll,
        set: mockSet,
      };

      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      (createServerClient as jest.Mock).mockReturnValue(
        'server-supabase-client',
      );

      // Call the function
      const supabaseClient = await createClient();

      // Assertions
      expect(supabaseClient).toBe('server-supabase-client');
      expect(createServerClient).toHaveBeenCalledWith(
        'https://test-url.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        }),
      );
    });

    it('should properly implement getAll to return cookie store values', async () => {
      // Mock cookie methods
      const mockGetAll = jest.fn().mockReturnValue(['cookie1', 'cookie2']);

      const mockCookieStore = {
        getAll: mockGetAll,
        set: jest.fn(),
      };

      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Create a mock to capture the cookies config
      let capturedConfig: any;
      (createServerClient as jest.Mock).mockImplementation(
        (url, key, config) => {
          capturedConfig = config;
          return 'server-supabase-client';
        },
      );

      // Call the function
      await createClient();

      // Call the getAll method that was passed to createServerClient
      const result = capturedConfig.cookies.getAll();

      // Assertions
      expect(mockGetAll).toHaveBeenCalled();
      expect(result).toEqual(['cookie1', 'cookie2']);
    });

    it('should properly implement setAll to set cookies', async () => {
      // Mock cookie methods
      const mockSet = jest.fn();

      const mockCookieStore = {
        getAll: jest.fn(),
        set: mockSet,
      };

      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Create a mock to capture the cookies config
      let capturedConfig: any;
      (createServerClient as jest.Mock).mockImplementation(
        (url, key, config) => {
          capturedConfig = config;
          return 'server-supabase-client';
        },
      );

      // Call the function
      await createClient();

      // Call the setAll method that was passed to createServerClient
      const cookiesToSet = [
        { name: 'cookie1', value: 'value1', options: { maxAge: 3600 } },
        { name: 'cookie2', value: 'value2', options: { path: '/' } },
      ];

      capturedConfig.cookies.setAll(cookiesToSet);

      // Assertions
      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith('cookie1', 'value1', {
        maxAge: 3600,
      });
      expect(mockSet).toHaveBeenCalledWith('cookie2', 'value2', { path: '/' });
    });

    it('should handle errors in setAll gracefully', async () => {
      // Mock cookie methods with set throwing an error
      const mockSet = jest.fn().mockImplementation(() => {
        throw new Error('Cannot set cookie in Server Component');
      });

      const mockCookieStore = {
        getAll: jest.fn(),
        set: mockSet,
      };

      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Create a mock to capture the cookies config
      let capturedConfig: any;
      (createServerClient as jest.Mock).mockImplementation(
        (url, key, config) => {
          capturedConfig = config;
          return 'server-supabase-client';
        },
      );

      // Call the function
      await createClient();

      // Call the setAll method that was passed to createServerClient
      const cookiesToSet = [{ name: 'cookie1', value: 'value1', options: {} }];

      // This should not throw an error
      expect(() => capturedConfig.cookies.setAll(cookiesToSet)).not.toThrow();

      // The set method should have been called
      expect(mockSet).toHaveBeenCalledWith('cookie1', 'value1', {});
    });
  });
});
