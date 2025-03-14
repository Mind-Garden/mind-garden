import { selectData, updateData } from '@/supabase/dbfunctions';
import { IReminders } from '@/supabase/schema';

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
