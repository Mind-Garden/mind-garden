import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Run the reminders job here
  return NextResponse.json({ message: 'Reminder job executed' });
}
