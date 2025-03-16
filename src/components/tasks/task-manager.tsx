'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Check, Trash2, X, Clock } from 'lucide-react';
import { Broom } from '@phosphor-icons/react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  addTasks,
  deleteTask,
  extractTasksFromTranscript,
  fetchTasks,
  markTask,
} from '@/actions/tasks';
import { toast } from 'react-toastify';
import type { ITask } from '@/supabase/schema';
import VoiceRecorder from '@/components/tasks/voice-recorder';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { isSameDay, parseISO, format } from 'date-fns';
import { getDate } from '@/lib/utils';
import { activateFireworks } from '@/components/magicui/fireworks';

interface TaskManagerProps {
  userId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const taskVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
  checked: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  },
};

const progressVariants = {
  initial: { width: 0 },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: { duration: 0.5, ease: 'easeOut' },
  }),
};

export default function TaskManager({ userId }: TaskManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [manualTask, setManualTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [transcript, setTranscript] = useState('');
  const fireworksRef = useRef(false);

  useEffect(() => {
    if (
      tasks.length > 0 &&
      tasks.every((task) => task.is_completed) &&
      !fireworksRef.current
    ) {
      fireworksRef.current = true;
      activateFireworks();
      setTimeout(() => {
        fireworksRef.current = false;
      }, 3000); // Reset after fireworks animation
    }
  }, [tasks]);

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
        setTasks((prevTasks) => [...result.data, ...prevTasks]);
      }
    } catch (error) {
      toast.error(
        'The AI service is currently unavailable. Please try again later.',
      );
    } finally {
      setIsProcessing(false);
      setTranscript('');
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
        setTasks((prevTasks) => [...result.data, ...prevTasks]);
      }

      setManualTask('');
      setIsAddingTask(false);
    }
  };

  const handleToggleComplete = async (
    taskId: string,
    is_completed: boolean,
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, is_completed: !task.is_completed }
          : task,
      ),
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

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.is_completed).length;
    return (completedTasks / tasks.length) * 100;
  };

  const clearAllTasks = async () => {
    for (const task of tasks) {
      await deleteTask(task.id);
    }
    setTasks([]);
    toast.success('Cleared all tasks');
  };

  // Today's incomplete tasks
  const todaysIncompleteTasks = tasks.filter(
    (task) =>
      isSameDay(getDate(), parseISO(task.created_at)) && !task.is_completed,
  );

  // Today's completed tasks
  const todaysCompletedTasks = tasks.filter(
    (task) =>
      isSameDay(getDate(), parseISO(task.created_at)) && task.is_completed,
  );

  // Previous days' incomplete tasks
  const previousIncompleteTasks = tasks.filter(
    (task) =>
      !isSameDay(getDate(), parseISO(task.created_at)) && !task.is_completed,
  );

  // Previous days' completed tasks
  const previousCompletedTasks = tasks.filter(
    (task) =>
      !isSameDay(getDate(), parseISO(task.created_at)) && task.is_completed,
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4 max-w-4xl mx-auto w-full">
      {/* Voice Input at the top */}
      <div className="w-full space-y-3">
        <p className="text-gray-500 text-sm text-center">
          Press record and tell me about your tasks for today.
        </p>

        <div className="flex items-center justify-between gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllTasks}
                  className="bg-gray-100 text-gray-600 p-3 rounded-full shadow-md"
                >
                  <Broom className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Clear all tasks</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 max-w-md mx-auto"
          >
            <Card className="bg-white shadow-md border-none overflow-hidden">
              <CardContent className="p-0">
                <VoiceRecorder
                  onTranscriptComplete={processTranscript}
                  onTranscriptChange={setTranscript}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>
          </motion.div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTask}
                  className="bg-blue-500 text-white p-3 rounded-full shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Add task manually</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Manual Task Input */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 max-w-md mx-auto"
            >
              <Input
                value={manualTask}
                onChange={(e) => setManualTask(e.target.value)}
                placeholder="Enter a task..."
                className="flex-1 border-none shadow-md"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmTask}
                disabled={!manualTask.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg shadow-md disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingTask(false)}
                className="bg-gray-100 text-gray-600 p-2 rounded-lg shadow-md"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Transcript */}
        <AnimatePresence>
          {transcript && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm text-gray-700 max-w-md mx-auto"
            >
              {transcript}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Card */}
      <Card className="w-full overflow-hidden border-none shadow-lg bg-white rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 rounded-full p-1.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.75V6.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.25 6.75L16.25 7.75"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.25 12H17.75"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.25 17.25L16.25 16.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19.25V17.75"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.75 16.25L6.75 17.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.25 12H4.75"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.75 7.75L6.75 6.75"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14.25C13.2426 14.25 14.25 13.2426 14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium">AI Insights</h2>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 pt-2 pb-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Suggested To-Do List
            </h3>

            <div className="relative mb-4">
              <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  custom={calculateProgress()}
                  variants={progressVariants}
                  initial="initial"
                  animate="animate"
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>
                  {tasks.filter((t) => t.is_completed).length} completed
                </span>
                <span>{tasks.length} total</span>
              </div>
            </div>
          </div>

          {/* Task Lists - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Left Column - To Do Tasks */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <div className="bg-blue-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                To Do
              </h3>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                <AnimatePresence>
                  {todaysIncompleteTasks.length > 0 ? (
                    todaysIncompleteTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={taskVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() =>
                            handleToggleComplete(task.id, task.is_completed)
                          }
                          className="rounded-full border-2 border-gray-300"
                        />
                        <span className="flex-1 text-sm">
                          {task.description}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2 text-gray-500 text-sm"
                    >
                      No pending tasks for today
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Previous Incomplete Tasks */}
              {previousIncompleteTasks.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Previous Uncompleted Tasks</span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {previousIncompleteTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          variants={taskVariants}
                          exit="exit"
                          layout
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Checkbox
                            checked={false}
                            onCheckedChange={() =>
                              handleToggleComplete(task.id, task.is_completed)
                            }
                            className="rounded-full border-2 border-gray-300"
                          />
                          <span className="flex-1 text-sm text-gray-600">
                            {task.description}
                            <span className="text-xs text-gray-400 ml-2">
                              {format(parseISO(task.created_at), 'MMM d')}
                            </span>
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Right Column - Completed Tasks */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                Completed
              </h3>

              <motion.div variants={containerVariants} className="space-y-2">
                <AnimatePresence>
                  {todaysCompletedTasks.length > 0 ? (
                    todaysCompletedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={taskVariants}
                        animate="checked"
                        exit="exit"
                        layout
                        className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() =>
                            handleToggleComplete(task.id, task.is_completed)
                          }
                          className="rounded-full border-2 border-green-500 bg-green-500"
                        />
                        <span className="flex-1 text-sm text-gray-400 line-through">
                          {task.description}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2 text-gray-500 text-sm"
                    >
                      No completed tasks for today
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Previous Completed Tasks */}
              {previousCompletedTasks.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Previously Completed</span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {previousCompletedTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          variants={taskVariants}
                          animate="checked"
                          exit="exit"
                          layout
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Checkbox
                            checked={true}
                            onCheckedChange={() =>
                              handleToggleComplete(task.id, task.is_completed)
                            }
                            className="rounded-full border-2 border-green-500 bg-green-500"
                          />
                          <span className="flex-1 text-sm text-gray-400 line-through">
                            {task.description}
                            <span className="text-xs text-gray-400 ml-2">
                              {format(parseISO(task.created_at), 'MMM d')}
                            </span>
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-500"
            >
              No tasks available. Add some tasks to get started!
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
