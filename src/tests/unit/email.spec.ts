import { sendReminders } from '@/actions/email';
import sendReminderEmail from '@/lib/email-service';
import {
  BOTH_FORMS_INCOMPLETE_HTML,
  BOTH_FORMS_INCOMPLETE_SUBJECT,
  BOTH_FORMS_INCOMPLETE_TEXT,
  HABIT_FORM_INCOMPLETE_HTML,
  HABIT_FORM_INCOMPLETE_SUBJECT,
  HABIT_FORM_INCOMPLETE_TEXT,
  JOURNAL_INCOMPLETE_HTML,
  JOURNAL_INCOMPLETE_SUBJECT,
  JOURNAL_INCOMPLETE_TEXT,
  NO_USAGE_HTML,
  NO_USAGE_SUBJECT,
  NO_USAGE_TEXT,
} from '@/lib/email-templates';
import { daysAgo, getLatestDate } from '@/lib/time';
import { createClient } from '@/supabase/server';

// Mock dependencies
jest.mock('@/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/time', () => ({
  daysAgo: jest.fn(),
  getLatestDate: jest.fn(),
}));

jest.mock('@/lib/email-service', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('sendReminders function', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      rpc: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  it('should exit early when no reminders are found', async () => {
    // Mocking the rpc call to return no data
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await sendReminders('08:00:00');

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'get_reminders_with_latest_dates',
      {
        reminder_time_param: '08:00:00',
      },
    );
    expect(sendReminderEmail).not.toHaveBeenCalled();
  });

  it('should log an error when Supabase RPC call fails', async () => {
    // Mock Supabase RPC to return an error
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: null,
      error: new Error('Supabase RPC failed'),
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await sendReminders('08:00:00');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch reminders:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should skip sending reminders when forms were completed today', async () => {
    // Mocking the rpc call to return mock data
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: '2025-03-08',
        latest_data_intake_entry_date: '2025-03-08',
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    // Mock daysAgo to always return 0 for this test
    (daysAgo as jest.Mock).mockImplementation(() => 0);
    (getLatestDate as jest.Mock).mockReturnValue('2025-03-08');

    await sendReminders('08:00:00');

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'get_reminders_with_latest_dates',
      {
        reminder_time_param: '08:00:00',
      },
    );
    expect(sendReminderEmail).not.toHaveBeenCalled();
  });

  it('should send activity reminder when no activity for 2+ days', async () => {
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: '2025-03-05',
        latest_data_intake_entry_date: '2025-03-06',
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    (getLatestDate as jest.Mock).mockReturnValue('2025-03-06');
    (daysAgo as jest.Mock).mockImplementation(() => 2);

    await sendReminders('08:00:00');

    expect(sendReminderEmail).toHaveBeenCalledWith(
      'user@example.com',
      NO_USAGE_SUBJECT,
      NO_USAGE_TEXT,
      NO_USAGE_HTML,
    );
  });

  it('should send both forms reminder when both forms are incomplete', async () => {
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-07',
        latest_data_intake_entry_date: '2025-03-07',
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    (getLatestDate as jest.Mock).mockReturnValue('2025-03-07');
    (daysAgo as jest.Mock).mockImplementation(() => 1);

    await sendReminders('08:00:00');

    expect(sendReminderEmail).toHaveBeenCalledWith(
      'user@example.com',
      BOTH_FORMS_INCOMPLETE_SUBJECT,
      BOTH_FORMS_INCOMPLETE_TEXT,
      BOTH_FORMS_INCOMPLETE_HTML,
    );
  });

  it('should send journal reminder when only journal is incomplete', async () => {
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: false,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-07',
        latest_data_intake_entry_date: '2025-03-08',
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    // First call is for getLatestDate's result
    // Second call is for latestDaysAgo
    // Third call is for latestJournalDaysAgo
    // Fourth call is for latestDataIntakeDaysAgo
    (daysAgo as jest.Mock)
      .mockReturnValueOnce(1) // For latestDaysAgo
      .mockReturnValueOnce(1) // For journal date
      .mockReturnValueOnce(0); // For data intake date

    (getLatestDate as jest.Mock).mockReturnValue('2025-03-08');

    await sendReminders('08:00:00');

    expect(sendReminderEmail).toHaveBeenCalledWith(
      'user@example.com',
      JOURNAL_INCOMPLETE_SUBJECT,
      JOURNAL_INCOMPLETE_TEXT,
      JOURNAL_INCOMPLETE_HTML,
    );
  });

  it('should send habit form reminder when only data intake is incomplete', async () => {
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: false,
        data_intake_reminders: true,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-08',
        latest_data_intake_entry_date: '2025-03-07',
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    (daysAgo as jest.Mock)
      .mockReturnValueOnce(0) // For latestDaysAgo
      .mockReturnValueOnce(0) // For journal date
      .mockReturnValueOnce(1); // For data intake date

    (getLatestDate as jest.Mock).mockReturnValue('2025-03-08');

    await sendReminders('08:00:00');

    expect(sendReminderEmail).toHaveBeenCalledWith(
      'user@example.com',
      HABIT_FORM_INCOMPLETE_SUBJECT,
      HABIT_FORM_INCOMPLETE_TEXT,
      HABIT_FORM_INCOMPLETE_HTML,
    );
  });

  it('should handle users with no entry dates', async () => {
    const mockReminders = [
      {
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: null,
        latest_data_intake_entry_date: null,
      },
    ];
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: mockReminders,
      error: null,
    });

    (getLatestDate as jest.Mock).mockReturnValue(null);
    (daysAgo as jest.Mock).mockReturnValue(null);

    await sendReminders('08:00:00');

    expect(sendReminderEmail).toHaveBeenCalledWith(
      'user@example.com',
      NO_USAGE_SUBJECT,
      NO_USAGE_TEXT,
      NO_USAGE_HTML,
    );
  });
});
