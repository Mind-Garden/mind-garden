import { sendReminders } from '@/actions/email';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/route';

// Mock the email action
jest.mock('@/actions/email', () => ({
  sendReminders: jest.fn().mockResolvedValue(undefined),
}));

describe('Email API Endpoint', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return 400 when hour parameter is missing', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should return 400 when hour parameter is not a number', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders?hour=abc'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should return 400 when hour parameter is out of range (negative)', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders?hour=-1'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should return 400 when hour parameter is out of range (too high)', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders?hour=24'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should call sendReminders with formatted time and return success message', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders?hour=14'),
    );
    const response = await GET(request);

    expect(sendReminders).toHaveBeenCalledWith('14:00:00');
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'Reminder job executed for UTC hour 14:00:00',
    });
  });

  it('should pad single-digit hour values with a leading zero', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/reminders?hour=5'),
    );
    const response = await GET(request);

    expect(sendReminders).toHaveBeenCalledWith('05:00:00');
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'Reminder job executed for UTC hour 05:00:00',
    });
  });
});
