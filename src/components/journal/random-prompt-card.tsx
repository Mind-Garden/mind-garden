'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getRandomPrompt } from '@/actions/journal';
import { CardDescription } from '@/components/shadcn/card';
import { cn } from '@/lib/utils';

export function RandomPromptCard() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getPrompt();
  }, []);

  const getPrompt = async () => {
    setIsLoading(true);
    const result = await getRandomPrompt();

    if (result?.error) {
      setPrompt('Something went wrong...');
    } else if (result.data) {
      setPrompt(result.data[0].prompt);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center space-x-2 mb-3">
      <CardDescription>Need inspiration?</CardDescription>
      <AnimatePresence mode="wait">
        <motion.div
          key={prompt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <CardDescription className="font-bold text-center">
            {prompt}
          </CardDescription>
        </motion.div>
      </AnimatePresence>
      <button
        onClick={getPrompt}
        disabled={isLoading}
        className={cn(
          'bg-emerald-500/30 hover:bg-emerald-600/30 p-2.5 rounded-full shrink-0',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        aria-label="Get new prompt"
      >
        <RotateCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
      </button>
    </div>
  );
}
