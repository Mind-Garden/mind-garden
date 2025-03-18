import supabase from '../../../jest.setup';
import {
  signup,
  login,
  logout,
  deleteAccount,
  modifyAccount,
} from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

jest.mock('next/cache');
jest.mock('next/navigation');

describe('Auth Integration Tests', () => {
  let userId: string;
  const email = `authuser${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  beforeAll(async () => {
    // Create a test user
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');

    await signup(formData);
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(redirect).toHaveBeenCalledWith('/home');

    // Retrieve user ID
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    expect(data.user).toBeDefined();
    if (data.user) {
      userId = data.user.id;
    } else {
      throw new Error('User data is null');
    }
  });

  afterAll(async () => {
    if (userId) {
      await deleteAccount(userId);
    }
  });

  it('should log in with valid credentials', async () => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    await login(formData);

    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(redirect).toHaveBeenCalledWith('/home');
  });

  it('should not log in with invalid credentials', async () => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', 'WrongPassword123!');

    const { error } = await login(formData);
    expect(error).toBeDefined();
  });

  it('should modify user account details', async () => {
    const newEmail = `updated${Date.now()}@example.com`;
    const response = await modifyAccount('Updated', 'User', newEmail, userId);
    expect(response?.error).toBeUndefined();
  });

  it('should log out successfully', async () => {
    await logout();

    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('should reject signup with invalid email format', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');
    formData.append('password', 'ValidPassword123!');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');

    const response = await signup(formData);
    expect(response?.error).toBeDefined();
    expect(response?.error).toContain('invalid format');
  });

  it('should reject signup with weak password', async () => {
    const formData = new FormData();
    formData.append('email', `weakpass${Date.now()}@example.com`);
    formData.append('password', 'weak');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');

    const response = await signup(formData);

    expect(response?.error).toBeDefined();
    expect(response?.error).toContain(
      'Password should be at least 6 characters.',
    );
  });

  it('should reject duplicate email during signup', async () => {
    // Try to sign up with the same email again
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', 'DifferentPassword123!');
    formData.append('firstName', 'Duplicate');
    formData.append('lastName', 'User');

    const response = await signup(formData);
    expect(response?.error).toBeDefined();
    expect(response?.error).toContain('User already registered');
  });

  it('should handle non-existent user during login', async () => {
    const formData = new FormData();
    formData.append('email', `nonexistent${Date.now()}@example.com`);
    formData.append('password', 'ValidPassword123!');

    const response = await login(formData);
    expect(response?.error).toBeDefined();
    expect(response?.error).toContain('Invalid login credentials');
  });

  it('should reject account modification with invalid email', async () => {
    const response = await modifyAccount(
      'Valid',
      'Name',
      'invalid-email',
      userId,
    );
    expect(response?.error).toBeDefined();
  });

  it('should handle empty form fields during login', async () => {
    const formData = new FormData();

    const response = await login(formData);
    expect(response?.error).toBeDefined();
    expect(response?.error).toContain('missing email or phone');
  });
});
