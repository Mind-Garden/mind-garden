import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/cron/route';
import { sendReminders, getReminders, updateReminders } from '@/actions/reminders';
import { getSupabaseClient } from '@/supabase/client';
import { selectData, updateData } from '@/supabase/dbfunctions';
import sendReminderEmail from '@/lib/email-service';
import { daysAgo, getLatestDate } from '@/lib/time';
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
  NO_USAGE_TEXT
} from '@/lib/email-templates';

jest.mock('@/supabase/client');
jest.mock('@/supabase/dbfunctions');
jest.mock('@/lib/email-service');
jest.mock('@/lib/time');

describe('Reminders API and functionality', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
      rpc: jest.fn()
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('GET API handler', () => {
    it('should return 400 when hour parameter is missing', async () => {
      const request = new NextRequest(new URL('https://example.com/api/reminders'));
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
    });

    it('should return 400 when hour parameter is not a number', async () => {
      const request = new NextRequest(new URL('https://example.com/api/reminders?hour=abc'));
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
    });

    it('should return 400 when hour parameter is out of range (negative)', async () => {
      const request = new NextRequest(new URL('https://example.com/api/reminders?hour=-1'));
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
    });

    it('should return 400 when hour parameter is out of range (too high)', async () => {
      const request = new NextRequest(new URL('https://example.com/api/reminders?hour=24'));
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
    });

    it('should call sendReminders with formatted time and return success message', async () => {
      const mockSendReminders = jest.fn().mockResolvedValueOnce();
      (sendReminders as jest.Mock) = mockSendReminders;

      const request = new NextRequest(new URL('https://example.com/api/reminders?hour=14'));
      const response = await GET(request);

      expect(mockSendReminders).toHaveBeenCalledWith('14:00:00');
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual({ message: 'Reminder job executed for UTC hour 14:00:00' });
    });

    it('should pad single-digit hour values with a leading zero', async () => {
      const mockSendReminders = jest.fn().mockResolvedValueOnce();
      (sendReminders as jest.Mock) = mockSendReminders;

      const request = new NextRequest(new URL('https://example.com/api/reminders?hour=5'));
      const response = await GET(request);

      expect(mockSendReminders).toHaveBeenCalledWith('05:00:00');
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual({ message: 'Reminder job executed for UTC hour 05:00:00' });
    });
  });

  describe('getReminders function', () => {
    it('should return reminder data for a valid user ID', async () => {
      const mockReminderData = {
        user_id: 'user123',
        reminder_time: '08:00:00',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: false
      };

      const mockSelectData = jest.fn().mockResolvedValueOnce({
        data: [mockReminderData],
        error: null
      });
      (selectData as jest.Mock) = mockSelectData;

      const result = await getReminders('user123');

      expect(mockSelectData).toHaveBeenCalledWith('reminders', { user_id: 'user123' });
      expect(result).toEqual(mockReminderData);
    });

    it('should return null when there is an error fetching reminders', async () => {
      const mockSelectData = jest.fn().mockResolvedValueOnce({
        data: [],
        error: { message: 'Database error' }
      });
      (selectData as jest.Mock) = mockSelectData;

      const result = await getReminders('user123');

      expect(mockSelectData).toHaveBeenCalledWith('reminders', { user_id: 'user123' });
      expect(result).toBeNull();
    });
  });

  describe('updateReminders function', () => {
    it('should call updateData with correct parameters', async () => {
      const mockUpdateData = jest.fn().mockResolvedValueOnce({
        data: { user_id: 'user123' },
        error: null
      });
      (updateData as jest.Mock) = mockUpdateData;

      await updateReminders('user123', '09:00:00', true, false, true);

      expect(mockUpdateData).toHaveBeenCalledWith(
        'reminders',
        { user_id: 'user123' },
        {
          reminder_time: '09:00:00',
          journal_reminders: true,
          data_intake_reminders: false,
          activity_reminders: true
        }
      );
    });
  });

  describe('sendReminders function', () => {
    it('should exit early when no reminders are found', async () => {
      // Mocking the rpc call to return no data
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      await sendReminders('08:00:00');

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_reminders_with_latest_dates', {
        reminder_time_param: '08:00:00',
      });
      expect(sendReminderEmail).not.toHaveBeenCalled();
    });

    it('should skip sending reminders when forms were completed today', async () => {
      // Mocking the rpc call to return mock data
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: '2025-03-08',
        latest_data_intake_entry_date: '2025-03-08'
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (daysAgo as jest.Mock).mockReturnValue(0);
      (getLatestDate as jest.Mock).mockReturnValue('2025-03-08');

      await sendReminders('08:00:00');

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_reminders_with_latest_dates', {
        reminder_time_param: '08:00:00',
      });
      expect(sendReminderEmail).not.toHaveBeenCalled();
    });

    it('should send activity reminder when no activity for 2+ days', async () => {
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: '2025-03-05',
        latest_data_intake_entry_date: '2025-03-06'
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (getLatestDate as jest.Mock).mockReturnValue('2025-03-06');
      (daysAgo as jest.Mock).mockReturnValue(2);

      await sendReminders('08:00:00');

      expect(sendReminderEmail).toHaveBeenCalledWith(
        'user@example.com',
        NO_USAGE_SUBJECT,
        NO_USAGE_TEXT,
        NO_USAGE_HTML
      );
    });

    it('should send both forms reminder when both forms are incomplete', async () => {
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-07',
        latest_data_intake_entry_date: '2025-03-07'
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (getLatestDate as jest.Mock).mockReturnValue('2025-03-07');
      (daysAgo as jest.Mock).mockReturnValue(1);

      await sendReminders('08:00:00');

      expect(sendReminderEmail).toHaveBeenCalledWith(
        'user@example.com',
        BOTH_FORMS_INCOMPLETE_SUBJECT,
        BOTH_FORMS_INCOMPLETE_TEXT,
        BOTH_FORMS_INCOMPLETE_HTML
      );
    });

    it('should send journal reminder when only journal is incomplete', async () => {
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: false,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-07',
        latest_data_intake_entry_date: '2025-03-08'
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (daysAgo as jest.Mock)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(0);
      (getLatestDate as jest.Mock).mockReturnValue('2025-03-07');

      await sendReminders('08:00:00');

      expect(sendReminderEmail).toHaveBeenCalledWith(
        'user@example.com',
        JOURNAL_INCOMPLETE_SUBJECT,
        JOURNAL_INCOMPLETE_TEXT,
        JOURNAL_INCOMPLETE_HTML
      );
    });

    it('should send habit form reminder when only data intake is incomplete', async () => {
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: false,
        data_intake_reminders: true,
        activity_reminders: false,
        latest_journal_entry_date: '2025-03-08',
        latest_data_intake_entry_date: '2025-03-07'
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (daysAgo as jest.Mock)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1);
      (getLatestDate as jest.Mock).mockReturnValue('2025-03-08');

      await sendReminders('08:00:00');

      expect(sendReminderEmail).toHaveBeenCalledWith(
        'user@example.com',
        HABIT_FORM_INCOMPLETE_SUBJECT,
        HABIT_FORM_INCOMPLETE_TEXT,
        HABIT_FORM_INCOMPLETE_HTML
      );
    });

    it('should handle users with no entry dates', async () => {
      const mockReminders = [{
        user_id: 'user123',
        email: 'user@example.com',
        journal_reminders: true,
        data_intake_reminders: true,
        activity_reminders: true,
        latest_journal_entry_date: null,
        latest_data_intake_entry_date: null
      }];
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: mockReminders, error: null });
      (getLatestDate as jest.Mock).mockReturnValue(null);
      (daysAgo as jest.Mock).mockReturnValue(null);

      await sendReminders('08:00:00');

      expect(sendReminderEmail).toHaveBeenCalledWith(
        'user@example.com',
        NO_USAGE_SUBJECT,
        NO_USAGE_TEXT,
        NO_USAGE_HTML
      );
    });
  });
});
