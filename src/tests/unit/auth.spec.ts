import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  authenticateResetCode,
  deleteAccount,
  forgotPassword,
  getAuthenticatedUserId,
  login,
  logout,
  modifyAccount,
  modifyPassword,
  signup,
} from '@/actions/auth';
import { createClient } from '@/supabase/server';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Auth Functions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const mockEq = jest.fn();
    const mockUpdate = jest.fn(() => ({
      eq: mockEq,
    }));

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        admin: {
          deleteUser: jest.fn(),
        },
        getUser: jest.fn(),
        resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
        exchangeCodeForSession: jest.fn(),
      },
      from: jest.fn(() => ({
        update: mockUpdate, // Properly mocked update function
      })),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('getAuthenticatedUserId', () => {
    it('should return the authenticated user ID when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user-123';
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      // Act
      const result = await getAuthenticatedUserId();

      // Assert
      expect(createClient).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result).toBe(mockUserId);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should redirect to error page when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act & Assert
      await expect(getAuthenticatedUserId()).rejects.toThrow();
      expect(createClient).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/error');
    });

    it('should redirect to error page when there is an authentication error', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: undefined },
        error: { message: 'Authentication error' },
      });

      // Act & Assert
      await expect(getAuthenticatedUserId()).rejects.toThrow();
      expect(createClient).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/error');
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      // Act
      await login(formData);

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/home');
    });

    it('should return error message on login failure', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrong');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      // Act
      const result = await login(formData);

      // Assert
      expect(result).toEqual({ error: 'Invalid credentials' });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');

      mockSupabaseClient.auth.signUp.mockResolvedValue({ error: null });

      // Act
      await signup(formData);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/home');
    });

    it('should return error message on signup failure (Email already in use)', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        error: { message: 'Email already in use' },
      });

      // Act
      const result = await signup(formData);

      // Assert
      expect(result).toEqual({ error: 'Email already in use' });
      expect(redirect).not.toHaveBeenCalled();
    });

    // Name validation tests within signup context
    describe('name validation', () => {
      it('should return error when firstName is missing', async () => {
        const formData = new FormData();
        formData.append('lastName', 'Doe');

        const result = await signup(formData);
        expect(result).toEqual({ error: 'First name is required' });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when lastName is missing', async () => {
        const formData = new FormData();
        formData.append('firstName', 'John');

        const result = await signup(formData);
        expect(result).toEqual({ error: 'Last name is required' });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when firstName is too short', async () => {
        const formData = new FormData();
        formData.append('firstName', 'J');
        formData.append('lastName', 'Doe');

        const result = await signup(formData);
        expect(result).toEqual({
          error: 'First name must be at least 2 characters long',
        });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when lastName is too short', async () => {
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'D');

        const result = await signup(formData);
        expect(result).toEqual({
          error: 'Last name must be at least 2 characters long',
        });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
      });

      // Act
      await logout();

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete a user account', async () => {
      // Arrange
      const userId = 'user123';
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: null,
      });

      // Act
      await deleteAccount(userId);

      // Assert
      expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        userId,
      );
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to error page on deletion failure', async () => {
      // Arrange
      const userId = 'user123';
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: { message: 'Deletion failed' },
      });

      // Act
      await deleteAccount(userId);

      // Assert
      expect(redirect).toHaveBeenCalledWith('/error');
    });
  });

  describe('modifyAccount', () => {
    it('should successfully modify account details', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        userId: 'user123',
      };

      mockSupabaseClient.from().update().eq.mockResolvedValue({ error: null });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId,
      );

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
      });
      expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith(
        'id',
        userData.userId,
      );
      expect(result).toBeUndefined();
    });

    it('should return error when email is already in use', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'existing@example.com',
        userId: 'user123',
      };

      mockSupabaseClient
        .from()
        .update()
        .eq.mockResolvedValue({
          error: {
            code: '23505',
            message: 'duplicate key value violates unique constraint',
          },
        });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId,
      );

      // Assert
      expect(result).toEqual({ error: 'Email already in use' });
    });

    it('should return generic error for unexpected errors', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        userId: 'user123',
      };

      mockSupabaseClient
        .from()
        .update()
        .eq.mockReturnValue({
          error: { code: 'unknown', message: 'Database error' },
        });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId,
      );

      // Assert
      expect(result).toEqual({
        error: 'An unexpected error occurred. Please try again later.',
      });
    });

    // Name validation tests
    it('should return error when firstName is too short', async () => {
      const result = await modifyAccount(
        'J',
        'Smith',
        'john.smith@example.com',
        'user123',
      );

      expect(result).toEqual({
        error: 'First name must be at least 2 characters long',
      });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return error when lastName is too short', async () => {
      const result = await modifyAccount(
        'John',
        'S',
        'john.smith@example.com',
        'user123',
      );

      expect(result).toEqual({
        error: 'Last name must be at least 2 characters long',
      });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return email error when invalid email is provided', async () => {
      const result = await modifyAccount(
        'John',
        'Smith',
        'invalid-email',
        'user123',
      );

      expect(result).toEqual({
        error: 'Invalid email format',
      });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return email is required error when email is not provided', async () => {
      const result = await modifyAccount('John', 'Smith', '', 'user123');

      expect(result).toEqual({
        error: 'Email is required',
      });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('modifyPassword', () => {
    it('should successfully update password', async () => {
      // Arrange
      mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });
      const newPassword = 'newPassword123';

      // Act
      const result = await modifyPassword(newPassword);

      // Assert
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });
      expect(result).toBeUndefined();
    });

    it('should return error message when password update fails', async () => {
      // Arrange
      const errorMessage = 'Password must be at least 6 characters';
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: { message: errorMessage },
      });
      const newPassword = 'short';

      // Act
      const result = await modifyPassword(newPassword);

      // Assert
      expect(result).toEqual({ error: errorMessage });
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send password reset email', async () => {
      // Arrange
      const email = 'test@example.com';
      const siteUrl = 'https://example.com';

      // Act
      const result = await forgotPassword(email, siteUrl);

      // Assert
      expect(
        mockSupabaseClient.auth.resetPasswordForEmail,
      ).toHaveBeenCalledWith(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      expect(result).toEqual({
        success: 'Password reset link set to your email.',
      });
    });

    it('should return error message when sending email fails', async () => {
      // Arrange
      const email = 'test@example.com';
      const siteUrl = 'https://example.com';
      const mockError = { message: 'Failed to send password reset email' };

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: mockError,
      });

      // Act
      const result = await forgotPassword(email, siteUrl);

      // Assert
      expect(
        mockSupabaseClient.auth.resetPasswordForEmail,
      ).toHaveBeenCalledWith(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      expect(result).toEqual({ error: mockError.message });
    });
  });

  describe('authenticateResetCode', () => {
    it('it should successfully authenticate code for a session', async () => {
      // Arrange
      const code = 'valid-code';
      const mockSessionData = {
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      };

      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValueOnce({
        data: mockSessionData,
        error: null,
      });

      // Act
      const result = await authenticateResetCode(code);

      // Assert
      expect(
        mockSupabaseClient.auth.exchangeCodeForSession,
      ).toHaveBeenCalledWith(code);
      expect(result).toEqual({ data: mockSessionData.session });
    });

    it('should return error message when code exchange fails', async () => {
      // Arrange
      const code = 'invalid-code';
      const mockError = { message: 'Invalid code' };

      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      // Act
      const result = await authenticateResetCode(code);

      // Assert
      expect(
        mockSupabaseClient.auth.exchangeCodeForSession,
      ).toHaveBeenCalledWith(code);
      expect(result).toEqual({ error: mockError.message });
    });
  });
});
