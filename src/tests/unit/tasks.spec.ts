import {
  addTasks,
  deleteTask,
  extractTasksFromTranscript,
  fetchTasks,
  markTask,
} from '@/actions/tasks';
import { getDate } from '@/lib/utils';
import { getSupabaseClient } from '@/supabase/client';
import { insertData, selectData, updateData } from '@/supabase/dbfunctions';

jest.mock('@/supabase/client', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  getDate: jest.fn(),
}));

jest.mock('@/supabase/dbfunctions', () => ({
  insertData: jest.fn(),
  selectData: jest.fn(),
  updateData: jest.fn(),
}));

// Mock fetch for the LLM API calls
global.fetch = jest.fn();

describe('Task Actions', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (getDate as jest.Mock).mockReturnValue('2025-03-06');
  });

  describe('Fetch Tasks', () => {
    it('should return tasks when select is successful', async () => {
      console.error = jest.fn();
      const userId = '1';
      const mockTasks = [
        {
          id: '1',
          user_id: userId,
          description: 'Task 1',
          is_completed: false,
          created_at: '2025-03-06',
        },
        {
          id: '2',
          user_id: userId,
          description: 'Task 2',
          is_completed: true,
          created_at: '2025-03-06',
        },
      ];

      (selectData as jest.Mock).mockResolvedValue({
        data: mockTasks,
        error: null,
      });

      const result = await fetchTasks(userId);

      expect(selectData).toHaveBeenCalledWith('tasks', { user_id: userId });
      expect(result).toEqual({ data: mockTasks });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when select fails', async () => {
      const userId = '1';
      const mockError = { message: 'Database error' };

      (selectData as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await fetchTasks(userId);

      expect(selectData).toHaveBeenCalledWith('tasks', { user_id: userId });
      expect(result).toEqual({ error: mockError.message });
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching tasks:',
        mockError,
      );
    });
  });

  describe('Add Tasks', () => {
    it('should add tasks successfully', async () => {
      const userId = '1';
      const descriptions = ['Task 1', 'Task 2'];
      const mockInsertedTasks = [
        {
          id: '1',
          user_id: userId,
          description: 'Task 1',
          is_completed: false,
          created_at: '2025-03-06',
        },
        {
          id: '2',
          user_id: userId,
          description: 'Task 2',
          is_completed: false,
          created_at: '2025-03-06',
        },
      ];

      const expectedTasksToInsert = descriptions.map((description) => ({
        user_id: userId,
        description,
        is_completed: false,
        created_at: '2025-03-06',
      }));

      (insertData as jest.Mock).mockResolvedValue({
        data: mockInsertedTasks,
        error: null,
      });

      const result = await addTasks(userId, descriptions);

      expect(insertData).toHaveBeenCalledWith(
        'tasks',
        expectedTasksToInsert,
        false,
      );
      expect(result).toEqual({ data: mockInsertedTasks });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when insert fails', async () => {
      const userId = '1';
      const descriptions = ['Task 1', 'Task 2'];
      const mockError = { message: 'Insert error' };

      (insertData as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await addTasks(userId, descriptions);

      expect(result).toEqual({ error: mockError.message });
      expect(console.error).toHaveBeenCalledWith(
        'Error adding tasks:',
        mockError,
      );
    });
  });

  describe('Mark Task', () => {
    it('should mark task as complete successfully', async () => {
      const taskId = '1';
      const completed = true;
      const mockUpdatedTask = {
        id: taskId,
        user_id: '1',
        description: 'Task 1',
        is_completed: completed,
        created_at: '2025-03-06',
      };

      (updateData as jest.Mock).mockResolvedValue({
        data: mockUpdatedTask,
        error: null,
      });

      const result = await markTask(taskId, completed);

      expect(updateData).toHaveBeenCalledWith(
        'tasks',
        { id: taskId },
        { is_completed: completed },
      );
      expect(result).toEqual({ data: mockUpdatedTask });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when update fails', async () => {
      const taskId = '1';
      const completed = true;
      const mockError = { message: 'Update error' };

      (updateData as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await markTask(taskId, completed);

      expect(updateData).toHaveBeenCalledWith(
        'tasks',
        { id: taskId },
        { is_completed: completed },
      );
      expect(result).toEqual({ error: mockError });
      expect(console.error).toHaveBeenCalledWith(
        'Error marking task as complete:',
        mockError,
      );
    });
  });

  describe('Delete Task', () => {
    it('should delete task successfully', async () => {
      const taskId = '1';
      const mockDeletedTask = {
        id: taskId,
        user_id: '1',
        description: 'Task 1',
        is_completed: false,
        created_at: '2025-03-06',
      };

      const matchMock = jest.fn().mockResolvedValue({
        data: mockDeletedTask,
        error: null,
      });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      const result = await deleteTask(taskId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tasks');
      expect(deleteMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalledWith({ id: taskId });
      expect(result).toEqual({ data: mockDeletedTask });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should return error when delete fails', async () => {
      const taskId = '1';
      const mockError = { message: 'Delete error' };

      const matchMock = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      const deleteMock = jest.fn().mockReturnValue({ match: matchMock });

      mockSupabaseClient.from.mockReturnValue({
        delete: deleteMock,
      });

      const result = await deleteTask(taskId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tasks');
      expect(deleteMock).toHaveBeenCalled();
      expect(matchMock).toHaveBeenCalledWith({ id: taskId });
      expect(result).toEqual({ error: mockError });
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting task:',
        mockError,
      );
    });
  });

  describe('Extract Tasks From Transcript', () => {
    it('should extract tasks from transcript successfully', async () => {
      const transcript = 'Do some task and another task';
      const mockTasksText = '- Task 1\n- Task 2';
      const expectedTasks = ['Task 1', 'Task 2'];

      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          message: { content: mockTasksText },
        }),
      });

      const result = await extractTasksFromTranscript(transcript);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.2:1b',
            messages: [
              {
                role: 'user',
                content: `Summarize all the following tasks in a dashed list: ${transcript}.`,
              },
            ],
            stream: false,
          }),
        },
      );
      expect(result).toEqual(expectedTasks);
    });

    it('should handle API errors', async () => {
      const transcript = 'Do some task and another task';

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(extractTasksFromTranscript(transcript)).rejects.toThrow(
        'AI service is currently unavailable',
      );
    });

    it('should handle non-200 responses', async () => {
      const transcript = 'Do some task and another task';

      (global.fetch as jest.Mock).mockResolvedValue({
        status: 500,
      });

      const result = await extractTasksFromTranscript(transcript);
      expect(result).toEqual([]);
    });
  });
});
