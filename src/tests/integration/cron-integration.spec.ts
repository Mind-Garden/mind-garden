import supabase from '../../../jest.setup';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/route';

describe('Reminder API Integration Tests', () => {
  let testUserId: string | undefined;

  beforeAll(async () => {
    // Create a test user
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    });

    if (error) throw new Error(`User creation failed: ${error.message}`);
    testUserId = data.user?.id;
  });

  afterAll(async () => {
    // Clean up test user and reminders
    if (testUserId) {
      await supabase.from('reminders').delete().eq('user_id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should return 400 when hour parameter is missing', async () => {
    const request = new NextRequest(new URL('https://example.com/api/cron'));
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should return 400 when hour parameter is out of range (negative)', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/cron?hour=-1'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should return 400 when hour parameter is out of range (too high)', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/cron?hour=27'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid or missing hour parameter' });
  });

  it('should trigger reminders for users with matching reminder time', async () => {
    const request = new NextRequest(
      new URL('https://example.com/api/cron?hour=9'),
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'Reminder job executed for UTC hour 09:00:00',
    });

    // Check if the reminder for the test user was fetched
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', testUserId)
      .eq('reminder_time', '9:00:00');

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });
});
