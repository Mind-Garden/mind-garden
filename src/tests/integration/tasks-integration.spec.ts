import { addTasks, deleteTask, fetchTasks, markTask } from '@/actions/tasks';
import { ITask } from '@/supabase/schema';

import supabase from '../../../jest.setup';

describe('Task Management Integration Tests', () => {
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    // Create a test user in the database
    const formData = {
      email: `taskuser${Date.now()}@example.com`,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Task',
          last_name: 'User',
        },
      },
    };
    const { data, error } = await supabase.auth.signUp(formData);

    if (error || !data.user) {
      throw new Error('Failed to create test user');
    }

    userId = data.user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user (admin privileges needed)
    await supabase.auth.admin.deleteUser(userId);
  });

  it('should add tasks for a user', async () => {
    const taskDescriptions = ['Test Task 1', 'Test Task 2'];

    const { data, error } = await addTasks(userId, taskDescriptions);
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data?.length).toBe(2);

    if (data) {
      taskId = data[0].id; // Save one task ID for later tests
    }
  });

  it('should fetch tasks for the user', async () => {
    const { data, error } = await fetchTasks(userId);
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data?.length).toBe(2);
  });

  it('should mark a task as completed', async () => {
    const { data, error } = await markTask(taskId, true);
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    if (data && Array.isArray(data)) {
      const task = data[0];
      expect(task.is_completed).toBe(true);
    }
  });

  it('should delete a task', async () => {
    const { data, error } = await deleteTask(taskId);
    expect(error).toBeUndefined();
    expect(data).toBeDefined();

    // Verify that task no longer exists
    const { data: afterDelete } = await fetchTasks(userId);
    expect(afterDelete?.some((task: ITask) => task.id === taskId)).toBe(false);
  });

  it('should return error when task does not exist', async () => {
    const { data, error } = await deleteTask('non-existent-task-id');
    expect(error).toBeDefined();
    expect(data).toBeUndefined();
  });

  it('should return error when adding an empty task list', async () => {
    const { data, error } = await addTasks(userId, []);
    expect(error).toBeDefined();
    expect(data).toBeUndefined();
  });

  it('should return error when fetching tasks for a non-existent user', async () => {
    const { data, error } = await fetchTasks('non-existent-user-id');
    expect(error).toBeDefined();
    expect(data).toBeUndefined();
  });

  it('should return error when marking a non-existent task', async () => {
    const { data, error } = await markTask('non-existent-task-id', true);
    expect(error).toBeDefined();
    expect(data).toBeUndefined();
  });

  it('should allow marking a task as incomplete after marking it complete', async () => {
    const { data: addedTask, error: addError } = await addTasks(userId, [
      'Task to toggle',
    ]);
    expect(addError).toBeUndefined();
    expect(addedTask).toBeDefined();

    const toggleTaskId = addedTask![0].id;

    // Mark as complete
    await markTask(toggleTaskId, true);
    const { data: completedTask } = await fetchTasks(userId);
    expect(
      completedTask?.find((t) => t.id === toggleTaskId)?.is_completed,
    ).toBe(true);

    // Mark as incomplete
    await markTask(toggleTaskId, false);
    const { data: incompleteTask } = await fetchTasks(userId);
    expect(
      incompleteTask?.find((t) => t.id === toggleTaskId)?.is_completed,
    ).toBe(false);
  });

  it('should allow bulk adding of multiple tasks', async () => {
    const bulkTasks = Array.from({ length: 50 }, (_, i) => `Task ${i + 1}`);
    const { data, error } = await addTasks(userId, bulkTasks);

    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data?.length).toBe(50);
  });
});
