'use client';
import { Broom } from '@phosphor-icons/react';
import { format, isSameDay, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, ListTodo, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  addTasks,
  deleteTask,
  extractTasksFromTranscript,
  fetchTasks,
  markTask,
} from '@/actions/tasks';
import { activateFireworks } from '@/components/magicui/fireworks';
import { Card, CardContent, CardHeader } from '@/components/shadcn/card';
import { Checkbox } from '@/components/shadcn/checkbox';
import { Input } from '@/components/shadcn/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/tooltip';
import VoiceRecorder from '@/components/tasks/voice-recorder';
import { getDate, getGreetingText } from '@/lib/utils';
import type { ITask } from '@/supabase/schema';

interface TaskManagerProps {
  userId: string;
  firstName: string;
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

export default function TaskManager({ userId, firstName }: TaskManagerProps) {
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

  const clearAllCompletedTasks = async () => {
    tasks
      .filter((task) => task.is_completed)
      .forEach((task) => handleDeleteTask(task.id));
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
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold opacity text-slate-800 font-title">
          {getGreetingText()}, {firstName}.
        </h1>
      </div>
      <div className="w-full space-y-3">
        <p className="text-gray-500 text-sm text-center">
          Press record and tell me about your tasks for today.
        </p>

        <div className="flex items-center justify-between gap-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllCompletedTasks}
                  className="bg-gray-100 text-gray-600 p-3 rounded-full shadow-md"
                >
                  <Broom className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Clear all completed tasks</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Card className="flex-1 max-w-md mx-auto bg-sky-100 shadow-md border-none overflow-hidden flex justify-center">
            <CardContent className="p-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 max-w-md mx-auto"
              >
                <VoiceRecorder
                  onTranscriptComplete={processTranscript}
                  onTranscriptChange={setTranscript}
                  isProcessing={isProcessing}
                />
              </motion.div>
            </CardContent>
          </Card>

          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTask}
                  className="bg-sky-500 text-white p-3 rounded-full shadow-md"
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
              className="flex items-center gap-2 max-w-md mx-auto pt-2"
            >
              <Input
                value={manualTask}
                onChange={(e) => setManualTask(e.target.value)}
                placeholder="Enter a task..."
                className="flex-1 border-none shadow-md"
                maxLength={70}
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmTask}
                disabled={!manualTask.trim()}
                className="bg-sky-500 text-white p-2 rounded-lg shadow-md disabled:opacity-50"
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
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 bg-sky-50">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 rounded-full p-1.5">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-title font-medium">Task Manager</h2>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 pt-4 pb-0">
            <div className="relative mb-4">
              <div className="h-3 w-full bg-sky-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sky-500 rounded-full"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column - To Do Tasks */}
            <div className="space-y-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg mb-4">
                <div className="bg-sky-100 p-1.5 rounded-full">
                  <Check className="w-5 h-5 text-sky-600" />
                </div>
                To Do
              </h3>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
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
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 transition-colors border border-sky-100/50 shadow-sm"
                      >
                        <div className="relative">
                          <Checkbox
                            checked={false}
                            onCheckedChange={() =>
                              handleToggleComplete(task.id, task.is_completed)
                            }
                            className="h-5 w-5 rounded-full border-2 border-sky-400 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:ring-offset-0"
                          />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 break-all">
                          {task.description}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 text-gray-500 text-sm bg-sky-50/50 rounded-xl border border-sky-100/30 italic"
                    >
                      No pending tasks for today
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Previous Incomplete Tasks */}
              {previousIncompleteTasks.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Previous Uncompleted Tasks</span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <AnimatePresence>
                      {previousIncompleteTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          variants={taskVariants}
                          exit="exit"
                          layout
                          className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200/50 shadow-sm"
                        >
                          <div className="relative">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() =>
                                handleToggleComplete(task.id, task.is_completed)
                              }
                              className="h-5 w-5 rounded-full border-2 border-gray-400 data-[state=checked]:bg-gray-500 data-[state=checked]:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0"
                            />
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-600 break-all">
                            {task.description}
                            <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                              {format(parseISO(task.created_at), 'MMM d')}
                            </div>
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
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
            <div className="space-y-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg mb-4">
                <div className="bg-green-100 p-1.5 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                Completed
              </h3>

              <motion.div variants={containerVariants} className="space-y-3">
                <AnimatePresence>
                  {todaysCompletedTasks.length > 0 ? (
                    todaysCompletedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={taskVariants}
                        animate="checked"
                        exit="exit"
                        layout
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100/70 transition-colors border border-green-100/50 shadow-sm"
                      >
                        <div className="relative">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() =>
                              handleToggleComplete(task.id, task.is_completed)
                            }
                            className="h-5 w-5 rounded-full border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 focus:ring-2 focus:ring-green-200 focus:ring-offset-0"
                          />
                        </div>
                        <span className="flex-1 text-sm text-gray-400 line-through break-all">
                          {task.description}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 text-gray-500 text-sm bg-green-50/50 rounded-xl border border-green-100/30 italic"
                    >
                      No completed tasks for today
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Previous Completed Tasks */}
              {previousCompletedTasks.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Previously Completed</span>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    className="space-y-3"
                  >
                    <AnimatePresence>
                      {previousCompletedTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          variants={taskVariants}
                          animate="checked"
                          exit="exit"
                          layout
                          className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200/50 shadow-sm"
                        >
                          <div className="relative">
                            <Checkbox
                              checked={true}
                              onCheckedChange={() =>
                                handleToggleComplete(task.id, task.is_completed)
                              }
                              className="h-5 w-5 rounded-full border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 focus:ring-2 focus:ring-green-200 focus:ring-offset-0"
                            />
                          </div>
                          <span className="flex-1 text-sm text-gray-400 line-through break-all">
                            {task.description}
                            <div className="text-xs text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                              {format(parseISO(task.created_at), 'MMM d')}
                            </div>
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
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
