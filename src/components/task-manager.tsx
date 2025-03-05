'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Check, Trash2, X } from 'lucide-react';
import { Broom } from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { addTasks, deleteTask, extractTasksFromTranscript, fetchTasks, markTask } from '@/actions/tasks';
import { toast } from 'react-toastify';
import { ITask } from '@/supabase/schema';
import VoiceRecorder from '@/components/voice-recorder';
import { Button } from '@/components/ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';

interface TaskManagerProps {
  userId: string;
}

const taskVariants = {
  hidden: { opacity: 0, x: -100, scale: 0.95 }, 
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 100, scale: 0.45, transition: { duration: 0.4 } }
};

export default function TaskManager({ userId }: TaskManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [manualTask, setManualTask] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [transcript, setTranscript] = useState("");

  const processTranscript = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const extractedTasks = await extractTasksFromTranscript(transcript);

      if (extractedTasks.length === 0) {
        toast.warn('No tasks found in the transcript.');
        return;
      }
      const result = await addTasks(userId, extractedTasks);
      if (result?.error || (!result?.error && !result?.data)) {
        toast.warn('Error adding tasks. Please try again later.');
      } else {
        toast.success('Successfully added tasks!');
      }

      if (result?.data) {
        setTasks(prevTasks => [...result.data, ...prevTasks]);
      }

    } catch (error) {
      toast.error('The AI service is currently unavailable. Please try again later.');
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  };

  useEffect(() => {
    const fetchUserTasks = async () => {
      const result = await fetchTasks(userId);
      if (result?.error) {
        toast.error('Error fetching tasks. Please try again later.');
      } else if (result?.data) {
        setTasks(result.data);
      }
    };

    fetchUserTasks();
  }, [userId]);

  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  const handleConfirmTask = async () => {
    if (manualTask.trim()) {
      const result = await addTasks(userId, [manualTask]);

      if (result?.error || (!result?.error && !result?.data)) {
        toast.warn('Error adding task. Please try again later.');
      } else {
        toast.success('Successfully added task!');
      }

      if (result?.data) {
        setTasks(prevTasks => [...result.data, ...prevTasks]);
      }

      setManualTask("");
      setIsAddingTask(false);
    }
  };

  const handleToggleComplete = async (taskId: string, is_completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      )
    );
    const result = await markTask(taskId, !is_completed);
    if (result?.error || (!result?.error && !result?.data)) {
      toast.warn('Error marking task. Please try again later.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <p className="text-gray-500 text-sm text-center">Press record and tell me about your tasks for today.</p>
      {/* Recording Section */}
      <Card className="bg-white/60 backdrop-blur-sm rounded-full border-none shadow-lg flex items-center justify-between w-full max-w-md p-4">
        <TooltipProvider>
          {/* Clear Completed Tasks (Left) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-full transition-transform duration-300 hover:scale-105 hover:bg-green-50"
                aria-label="Clear all completed tasks"
                onClick={() => tasks.filter(task => task.is_completed).forEach(task => handleDeleteTask(task.id))}
              >
                <Broom className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear all completed tasks</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Voice Input Button (Center) */}
        <VoiceRecorder
          onTranscriptComplete={processTranscript}
          onTranscriptChange={setTranscript}
          isProcessing={isProcessing}
        />

        <TooltipProvider>
          {/* Add Task Manually (Right) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-full transition-transform duration-300 hover:scale-105 hover:bg-green-50"
                aria-label="Add task manually"
                onClick={handleAddTask}
              >
                <Plus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add task manually</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Card>

      {/* Manual Task Input */}
      {isAddingTask && (
        <div className="flex items-center space-x-2">
          <Input
            value={manualTask}
            onChange={(e) => setManualTask(e.target.value)}
            placeholder="Enter a task manually..."
            className="flex-1"
          />
          <Button 
            onClick={handleConfirmTask}
            disabled={!manualTask.trim()}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Add Task
          </Button>
          <Button 
            onClick={() => setIsAddingTask(false)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      )}

      {/* Live Transcript */}
      {transcript && !isProcessing && (
        <p className="text-gray-700 text-sm text-center bg-white/80 p-2 rounded-lg shadow">{transcript}</p>
      )}

      {/* Task List */}
      <Card className="w-full max-w-md rounded-2xl">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"></CardHeader>
  <CardContent>
    {tasks.length > 0 ? (
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={taskVariants}
              className="flex flex-col space-y-1 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition w-full"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={() => handleToggleComplete(task.id, task.is_completed)}
                />
                <span
                  className={`flex-1 text-sm ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.description}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    ) : (
      <div className="text-center text-gray-500 py-4">No tasks available</div>
    )}
  </CardContent>
</Card>

    </div>
  );
}
