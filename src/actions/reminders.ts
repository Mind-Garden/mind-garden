'use server';

import { getSupabaseClient } from '@/supabase/client';
import { selectData, updateData } from '@/supabase/dbfunctions';
import { IReminders, IReminderWithLatestDates } from '@/supabase/schema';
import { daysAgo, getLatestDate } from '@/lib/time';
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

export async function getReminders(userId: string): Promise<IReminders | null> {
  const { data, error } = await selectData<IReminders>('reminders', {
    user_id: userId,
  });

  if (error) {
    console.error('Error fetching reminders:', error.message);
    return null;
  }

  return data[0] as unknown as IReminders;
}

export async function updateReminders(
  userId: string,
  reminderTime: string,
  journalReminders: boolean,
  dataIntakeReminders: boolean,
  activityReminders: boolean,
) {
  return await updateData(
    'reminders',
    { user_id: userId },
    {
      reminder_time: reminderTime,
      journal_reminders: journalReminders,
      data_intake_reminders: dataIntakeReminders,
      activity_reminders: activityReminders,
    },
  );
}

export async function sendReminders(reminderTime: string): Promise<void> {
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data, error } = await supabase.rpc(
    'get_reminders_with_latest_dates',
    {
      reminder_time_param: reminderTime,
    },
  );

  console.log('data:', data);

  if (error) {
    console.error('Failed to fetch reminders:', error);
  } else {
    console.log('Reminders with emails:', data);
  }

  const reminders = data as IReminderWithLatestDates[];

  // No reminders to send
  if (reminders.length === 0) return;

  for (const reminder of reminders) {
    // Spread the reminder object into variables
    const {
      journal_reminders: journalReminders,
      data_intake_reminders: dataIntakeReminders,
      activity_reminders: activityReminders,
      email,
      latest_journal_entry_date: latestJournalEntryDate,
      latest_data_intake_entry_date: latestDataIntakeEntryDate,
    } = reminder;

    // Get the latest date, and how many days ago it was
    const latestDate = getLatestDate(
      latestJournalEntryDate,
      latestDataIntakeEntryDate,
    );
    const latestDaysAgo = latestDate ? daysAgo(latestDate) : null;

    // Get the number of days ago for each form
    const latestJournalDaysAgo = latestJournalEntryDate
      ? daysAgo(latestJournalEntryDate)
      : null;
    const latestDataIntakeDaysAgo = latestDataIntakeEntryDate
      ? daysAgo(latestDataIntakeEntryDate)
      : null;

    // They completed their forms today, so skip
    if (latestJournalDaysAgo === 0 && latestDataIntakeDaysAgo === 0) continue;

    // If it's been >= 2 days for all entry dates, send activity reminder
    if (activityReminders && (!latestDate || latestDaysAgo! >= 2)) {
      await sendReminderEmail(
        email,
        NO_USAGE_SUBJECT,
        NO_USAGE_TEXT,
        NO_USAGE_HTML,
      );
      continue;
    }

    // Send reminder for both forms
    if (
      journalReminders &&
      dataIntakeReminders &&
      (!latestDate || latestDaysAgo! >= 1)
    ) {
      await sendReminderEmail(
        email,
        BOTH_FORMS_INCOMPLETE_SUBJECT,
        BOTH_FORMS_INCOMPLETE_TEXT,
        BOTH_FORMS_INCOMPLETE_HTML,
      );
      continue;
    }

    // Send reminder for journal
    if (
      journalReminders &&
      (!latestJournalEntryDate || latestJournalDaysAgo! >= 1)
    ) {
      await sendReminderEmail(
        email,
        JOURNAL_INCOMPLETE_SUBJECT,
        JOURNAL_INCOMPLETE_TEXT,
        JOURNAL_INCOMPLETE_HTML,
      );
      continue;
    }

    // Send reminder for data intake
    if (
      dataIntakeReminders &&
      (!latestDataIntakeEntryDate || latestDataIntakeDaysAgo! >= 1)
    ) {
      await sendReminderEmail(
        email,
        HABIT_FORM_INCOMPLETE_SUBJECT,
        HABIT_FORM_INCOMPLETE_TEXT,
        HABIT_FORM_INCOMPLETE_HTML,
      );
    }
  }
}
