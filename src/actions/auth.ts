'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { selectData } from '@/supabase/dbfunctions';
import { createClient } from '@/supabase/server';

export async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect('/error');
  }

  return authData.user.id;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/home');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Validate name fields
  const firstNameError = validateName(formData.get('firstName'), 'First name');
  if (firstNameError) return firstNameError;

  const lastNameError = validateName(formData.get('lastName'), 'Last name');
  if (lastNameError) return lastNameError;

  const userData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(userData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/home');
}

export async function logout() {
  const supabase = await createClient();

  // Check if a user's logged in
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    await supabase.auth.signOut();
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function deleteAccount(userId: string) {
  const supabase = await createClient();

  // Delete user from system and their data ( this requires the service role key )
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function modifyAccount(
  firstName: string,
  lastName: string,
  email: string,
  userId: string,
) {
  const supabase = await createClient();

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) return firstNameError;

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) return lastNameError;

  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const dataIn = {
    email: email,
    first_name: firstName,
    last_name: lastName,
  };

  const { error: updateError } = await supabase
    .from('users')
    .update(dataIn)
    .eq('id', userId);
  if (updateError) {
    if (updateError.code === '23505') {
      return { error: 'Email already in use' };
    } else {
      return { error: 'An unexpected error occurred. Please try again later.' };
    }
  }
}

export async function modifyPassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }
}

export async function forgotPassword(email: string, siteUrl: string) {
  const { data, error } = await selectData<{ email: string }>(
    'users',
    { email },
    ['email'],
  );

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: 'Please enter a valid email.' };
  }

  const supabase = await createClient();
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${siteUrl}/reset-password`,
    },
  );

  if (resetError) {
    return { error: resetError.message };
  }

  return { success: 'Password reset link sent to your email successfully.' };
}

export async function authenticateResetCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { error: error.message };
  }

  return { data: data.session };
}

const validateName = (name: FormDataEntryValue | null, field: string) => {
  if (!name) return { error: `${field} is required` };
  if (typeof name !== 'string' || name.length < 2)
    return { error: `${field} must be at least 2 characters long` };
};

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { error: 'Email is required' };
  if (!emailRegex.test(email)) return { error: 'Invalid email format' };
}
