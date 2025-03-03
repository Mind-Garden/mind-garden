'use server';

import transporter from "@/lib/transporter";
import {getSupabaseClient} from "@/utils/supabase/client";

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
