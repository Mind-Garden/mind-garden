'use client';

import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getRandomPrompt } from '@/utils/supabase/dbfunctions';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="bg-white/50 text-black backdrop-blur-sm rounded-3xl max-w-2xl mx-auto border-none shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h2 className="text-center text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Need inspiration?
          </h2>
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={prompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-grow min-h-[28px] flex items-center justify-center"
              >
                <p className="text-lg font-medium text-center">{prompt}</p>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={getPrompt}
              disabled={isLoading}
              className={cn(
                'bg-teal-500/30 hover:bg-teal-600/30 p-2.5 rounded-full shrink-0',
                'transition-all duration-300 hover:scale-110 active:scale-95',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="Get new prompt"
            >
              <RotateCw
                className={cn('h-5 w-5', isLoading && 'animate-spin')}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
