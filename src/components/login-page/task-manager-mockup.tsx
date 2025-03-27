import { Broom } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Check, ListTodo, Plus, Trash2 } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/shadcn/card';
import { Checkbox } from '@/components/shadcn/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/tooltip';
import VoiceRecorder from '@/components/tasks/voice-recorder';

const TaskManagerMockup = () => {
  // Example tasks with static data
  const exampleTasks = [
    {
      id: 1,
      description: 'Prepare weekly team report',
      is_completed: false,
    },
    {
      id: 2,
      description: 'Schedule client meeting',
      is_completed: false,
    },
    {
      id: 3,
      description: 'Review project proposal',
      is_completed: true,
    },
    {
      id: 4,
      description: 'Update project documentation',
      is_completed: true,
    },
  ];

  const todaysIncompleteTasks = exampleTasks.filter(
    (task) => !task.is_completed,
  );
  const todaysCompletedTasks = exampleTasks.filter((task) => task.is_completed);

  const calculateProgress = () => {
    const totalTasks = exampleTasks.length;
    const completedTasks = todaysCompletedTasks.length;
    return (completedTasks / totalTasks) * 100;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-4 max-w-4xl mx-auto w-full">
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
                  onTranscriptComplete={function (_: string): void {
                    return;
                  }}
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
                  className="bg-sky-500 text-white p-3 rounded-full shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Add task manually</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{todaysCompletedTasks.length} completed</span>
                  <span>{exampleTasks.length} total</span>
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

                <div className="space-y-3">
                  {todaysIncompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 transition-colors border border-sky-100/50 shadow-sm"
                    >
                      <div className="relative">
                        <Checkbox
                          checked={false}
                          className="h-5 w-5 rounded-full border-2 border-sky-400"
                        />
                      </div>
                      <span className="flex-1 text-xs font-medium text-gray-700 break-all">
                        {task.description}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Completed Tasks */}
              <div className="space-y-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg mb-4">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  Completed
                </h3>

                <div className="space-y-3">
                  {todaysCompletedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100/70 transition-colors border border-green-100/50 shadow-sm"
                    >
                      <div className="relative">
                        <Checkbox
                          checked={true}
                          className="h-5 w-5 rounded-full border-2 border-green-400 bg-green-500 data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <span className="flex-1 text-xs text-gray-400 line-through break-all">
                        {task.description}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskManagerMockup;
