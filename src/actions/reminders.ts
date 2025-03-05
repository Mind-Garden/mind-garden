'use server';

import {getSupabaseClient} from "@/supabase/client";
import {selectData, updateData} from "@/supabase/dbfunctions";
import {IReminders} from "@/supabase/schema";

// Helper function to get the last entry date
async function getLastEntryDate(
  userId: string, tableName: 'journal_entries' | 'responses' | 'sleep_entries'
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const {data, error} = await supabase
    .from(tableName)
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', {ascending: false})
    .limit(1);

  if (error) {
    console.error(`Error fetching ${tableName} for user ${userId}:`, error);
    return null;
  }

  return data?.[0]?.entry_date ?? null;
}

export async function getReminders(userId: string): Promise<IReminders | null> {
  const {data, error} = await selectData<IReminders>('reminders', {
    user_id: userId,
  });

  if (error) {
    console.error(`Error fetching reminders:`, error.message);
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
    {user_id: userId},
    {
      reminder_time: reminderTime,
      journal_reminders: journalReminders,
      data_intake_reminders: dataIntakeReminders,
      activity_reminders: activityReminders
    },
  );
}
