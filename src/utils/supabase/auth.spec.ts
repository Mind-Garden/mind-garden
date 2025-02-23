import { login, signup, logout, deleteAccount, modifyAccount, modifyPassword } from '@/actions/auth';
import { createClient } from './server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Supabase client
jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Auth Functions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const mockEq = jest.fn();
    const mockUpdate = jest.fn(() => ({
      eq: mockEq, 
    }));

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        admin: {
          deleteUser: jest.fn(),
        },
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        update: mockUpdate, // Properly mocked update function
      })),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      // Act
      await login(formData);

      // Assert
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/home');
    });

    it('should return error message on login failure', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrong');

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      // Act
      const result = await login(formData);

      // Assert
      expect(result).toEqual({ error: 'Invalid credentials' });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');

      mockSupabaseClient.auth.signUp.mockResolvedValue({ error: null });

      // Act
      await signup(formData);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/home');
    });

    it('should return error message on signup failure (Email already in use)', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'password123');
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        error: { message: 'Email already in use' },
      });

      // Act
      const result = await signup(formData);

      // Assert
      expect(result).toEqual({ error: 'Email already in use' });
      expect(redirect).not.toHaveBeenCalled();
    });

    // Name validation tests within signup context
    describe('name validation', () => {
      it('should return error when firstName is missing', async () => {
        const formData = new FormData();
        formData.append('lastName', 'Doe');

        const result = await signup(formData);
        expect(result).toEqual({ error: 'First name is required' });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when lastName is missing', async () => {
        const formData = new FormData();
        formData.append('firstName', 'John');

        const result = await signup(formData);
        expect(result).toEqual({ error: 'Last name is required' });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when firstName is too short', async () => {
        const formData = new FormData();
        formData.append('firstName', 'J');
        formData.append('lastName', 'Doe');

        const result = await signup(formData);
        expect(result).toEqual({
          error: 'First name must be at least 2 characters long',
        });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should return error when lastName is too short', async () => {
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'D');

        const result = await signup(formData);
        expect(result).toEqual({
          error: 'Last name must be at least 2 characters long',
        });
        expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

      // Act
      await logout();

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete a user account', async () => {
      // Arrange
      const userId = 'user123';
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: null,
      });

      // Act
      await deleteAccount(userId);

      // Assert
      expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith(
        userId,
      );
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to error page on deletion failure', async () => {
      // Arrange
      const userId = 'user123';
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
        error: { message: 'Deletion failed' },
      });

      // Act
      await deleteAccount(userId);

      // Assert
      expect(redirect).toHaveBeenCalledWith('/error');
    });
  });

  describe('modifyAccount', () => {
    it('should successfully modify account details', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        userId: 'user123'
      };

      mockSupabaseClient.from().update().eq.mockResolvedValue({ error:  null });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId
      );

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName
      });
      expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith('id', userData.userId);
      expect(result).toBeUndefined();
    });

    it('should return error when email is already in use', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'existing@example.com',
        userId: 'user123'
      };

      mockSupabaseClient.from().update().eq.mockResolvedValue({
        error: { code: '23505', message: 'duplicate key value violates unique constraint' }
      });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId
      );

      // Assert
      expect(result).toEqual({ error: 'Email already in use' });
    });

    it('should return generic error for unexpected errors', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        userId: 'user123'
      };

      mockSupabaseClient.from().update().eq.mockReturnValue({
        error: { code: 'unknown', message: 'Database error' }
      });

      // Act
      const result = await modifyAccount(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.userId
      );

      // Assert
      expect(result).toEqual({ error: 'An unexpected error occurred. Please try again later.' });
    });

    // Name validation tests
    it('should return error when firstName is too short', async () => {
      const result = await modifyAccount(
        'J',
        'Smith',
        'john.smith@example.com',
        'user123'
      );
      
      expect(result).toEqual({ error: 'First name must be at least 2 characters long' });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return error when lastName is too short', async () => {
      const result = await modifyAccount(
        'John',
        'S',
        'john.smith@example.com',
        'user123'
      );
      
      expect(result).toEqual({ error: 'Last name must be at least 2 characters long' });
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('modifyPassword', () => {
    it('should successfully update password', async () => {
      // Arrange
      mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });
      const newPassword = 'newPassword123';

      // Act
      const result = await modifyPassword(newPassword);

      // Assert
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword
      });
      expect(result).toBeUndefined();
    });

    it('should return error message when password update fails', async () => {
      // Arrange
      const errorMessage = 'Password must be at least 6 characters';
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: { message: errorMessage }
      });
      const newPassword = 'short';

      // Act
      const result = await modifyPassword(newPassword);

      // Assert
      expect(result).toEqual({ error: errorMessage });
    });
  });


});
