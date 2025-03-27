import { NextRequest, NextResponse } from 'next/server';

import { sendReminders } from '@/actions/email';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hourParam = searchParams.get('hour');
  const utcHour = hourParam ? parseInt(hourParam, 10) : null;
  if (utcHour === null || isNaN(utcHour) || utcHour < 0 || utcHour > 23) {
    return NextResponse.json(
      { error: 'Invalid or missing hour parameter' },
      { status: 400 },
    );
  }

  const reminderTime = `${utcHour.toString().padStart(2, '0')}:00:00`;

  await sendReminders(reminderTime);

  return NextResponse.json({
    message: `Reminder job executed for UTC hour ${reminderTime}`,
  });
}
