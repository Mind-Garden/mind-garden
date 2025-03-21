import { NextRequest, NextResponse } from 'next/server';

import { sendReminders } from '@/actions/email';

// This is your Next.js API route handler for the GET request.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Extract the 'hour' query parameter from the URL (e.g., ?hour=14)
  const hourParam = searchParams.get('hour');

  // Safely parse the hour into a number (expecting values like 0 to 23)
  const utcHour = hourParam ? parseInt(hourParam, 10) : null;

  // Validate the hour (ensure it's between 0 and 23, as those are valid 24-hour times)
  if (utcHour === null || isNaN(utcHour) || utcHour < 0 || utcHour > 23) {
    return NextResponse.json(
      { error: 'Invalid or missing hour parameter' },
      { status: 400 },
    );
  }

  const reminderTime = `${utcHour.toString().padStart(2, '0')}:00:00`;

  await sendReminders(reminderTime);

  // Return a success response to the caller (could be your GitHub Action)
  return NextResponse.json({
    message: `Reminder job executed for UTC hour ${reminderTime}`,
  });
}
