import { sendReminders } from '@/actions/email';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
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

    await sendReminders('09:00:00');

    // Ensure no email was sent
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should send activity reminder when no activity for 2+ days', async () => {
    // Mock the rpc method with our test data
    const threedays = new Date();
    threedays.setDate(threedays.getDate() - 3);
    const olderDate = threedays.toISOString().split('T')[0];

    const mockRpcData = [
      {
        user_id: testUserId,
        email: email,
        latest_journal_entry_date: olderDate,
        latest_data_intake_entry_date: olderDate,
        last_notification_date: null,
        notification_time: '09:00:00',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
      },
    ];

    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: mockRpcData, error: null })),
      };
    }) as any;

    await sendReminders('09:00:00');

    // Verify email was sent
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Reminder: No Activity'),
      }),
    );
  });

  it('should send both forms reminder when both forms are incomplete', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const oneDayAgo = yesterday.toISOString().split('T')[0];

    const mockRpcData = [
      {
        user_id: testUserId,
        email: email,
        latest_journal_entry_date: oneDayAgo,
        latest_data_intake_entry_date: oneDayAgo,
        last_notification_date: null,
        notification_time: '09:00:00',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: false,
      },
    ];

    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: mockRpcData, error: null })),
      };
    }) as any;

    await sendReminders('09:00:00');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Complete Your Forms'),
      }),
    );
  });

  it('should send journal reminder when only journal is incomplete', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const oneDayAgo = yesterday.toISOString().split('T')[0];

    const mockRpcData = [
      {
        user_id: testUserId,
        email: email,
        latest_journal_entry_date: oneDayAgo,
        latest_data_intake_entry_date: today,
        last_notification_date: null,
        notification_time: '09:00:00',
        journal_reminders: true,
        data_intake_reminders: false,
        activity_reminders: false,
      },
    ];

    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: mockRpcData, error: null })),
      };
    }) as any;

    await sendReminders('09:00:00');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Journal Reminder'),
      }),
    );
  });

  it('should send habit form reminder when only data intake is incomplete', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const oneDayAgo = yesterday.toISOString().split('T')[0];

    const mockRpcData = [
      {
        user_id: testUserId,
        email: email,
        latest_journal_entry_date: today,
        latest_data_intake_entry_date: oneDayAgo,
        last_notification_date: null,
        notification_time: '09:00:00',
        journal_reminders: false,
        data_intake_reminders: true,
        activity_reminders: false,
      },
    ];

    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: mockRpcData, error: null })),
      };
    }) as any;

    await sendReminders('09:00:00');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Habit Form Reminder'),
      }),
    );
  });

  it('should handle users with no entry dates', async () => {
    const mockRpcData = [
      {
        user_id: testUserId,
        email: email,
        latest_journal_entry_date: null,
        latest_data_intake_entry_date: null,
        last_notification_date: null,
        notification_time: '09:00:00',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
      },
    ];

    supabase.rpc = jest.fn().mockImplementation(() => {
      return {
        then: (callback: any) =>
          Promise.resolve(callback({ data: mockRpcData, error: null })),
      };
    }) as any;

    await sendReminders('09:00:00');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Reminder: No Activity'),
      }),
    );
  });
});
