'use server';

import transporter from "@/lib/transporter";
import {getSupabaseClient} from "@/supabase/client";
import {insertData, selectData, updateData} from "@/supabase/dbfunctions";
import {IReminders} from "@/supabase/schema";

// Function to send the actual email
export async function sendReminderEmail(email: string, subject: string, message: string) {
  try {
    await transporter.sendMail({
      from: `"Mind Garden" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: subject,
      text: message,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

// Helper function to get the last entry date
async function getLastEntryDate(userId: string, tableName: 'journal_entries' | 'responses' | 'sleep_entries'): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(tableName)
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Error fetching ${tableName} for user ${userId}:`, error);
    return null;
  }

  return data?.[0]?.entry_date ?? null;
}

// Main function to check and send reminders
export async function checkAndSendReminders(){

}

export async function getReminderTime(userId: string) {
  const { data, error } = await selectData<IReminders>('reminders', {
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as IReminders;
}

export async function insertReminderTime(userId: string, userEmail: string) {
  // Get the current time in HH:mm:ss format
  const reminderTime = new Date().toISOString().substring(11, 19); // Extract HH:mm:ss

  // Check if an entry already exists for this user
  const { data: existingReminder, error } = await selectData('reminders', {
    user_id: userId,
  });

  if (error) {
    console.error('Error checking existing reminders:', error);
    return { error };
  }

  return await insertData('reminders', [
    {
      user_id: userId,
      email: userEmail,
      reminder_time: reminderTime,
    },
  ]);
}

export async function updateReminderTime(
  userId: string,
  newReminderTime: string,
) {
  return await updateData(
    'reminders',
    { user_id: userId },
    { reminder_time: newReminderTime },
  );
}
