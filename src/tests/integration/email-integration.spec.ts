import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

import { sendReminders } from '@/actions/email';

import supabase from '../../../jest.setup';

// Mock the entire nodemailer module
jest.mock('nodemailer', () => {
  // Create a mock transporter object
  const mockSendMail = jest
    .fn()
    .mockResolvedValue({ messageId: 'test-message-id' });
  const mockTransporter = {
    sendMail: mockSendMail,
    verify: jest.fn().mockResolvedValue(true),
    close: jest.fn(),
  };

  // Return mock implementation of createTransport
  return {
    createTransport: jest.fn().mockReturnValue(mockTransporter),
  };
});

// Access the mocked transporter's sendMail function directly
const mockSendMail = nodemailer.createTransport().sendMail as jest.Mock;

dotenv.config();

describe('sendReminders Integration Test', () => {
  let testUserId: string;
  const email: string = 'testuser123@example.com';
  let originalRpc: any;

  beforeAll(async () => {
    const formData = {
      email: email,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        },
      },
    };

    const { data, error } = await supabase.auth.signUp(formData);

    if (error || !data.user) {
      throw new Error('Failed to create test user');
    }

    if (data) {
      testUserId = data.user?.id;
    }

    // Store the original rpc method
    originalRpc = supabase.rpc;
  });

  beforeEach(() => {
    // Clear any previous mock calls
    mockSendMail.mockClear();
  });

  afterEach(() => {
    // Restore the original rpc method after each test
    if (originalRpc) {
      supabase.rpc = originalRpc;
    }
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await supabase.auth.admin.deleteUser(testUserId);
  });

  it('should exit early when no reminders are found', async () => {
    // Mock the rpc method to return a function that returns a promise
    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: [], error: null })),
      };
    }) as any;

    await sendReminders('09:15:00');

    // Ensure no email was sent
    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
