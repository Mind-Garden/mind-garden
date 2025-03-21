'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { summarizeData } from '@/actions/ai-data-analysis';
import ReactMarkdown from 'react-markdown';
import { TypingAnimation } from './magicui/typing-animation';

interface AIResponseProps {
  readonly userId: string;
  readonly type: string;
  readonly title?: string;
}

export default function AIResponse({
  userId,
  type,
  title = 'Summary',
}: AIResponseProps) {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const duration = 15;

  // Loading messages while the response is being fetched
  const loadingMessages = [
    'Hope you are having a wonderful day! I am gathering some insights using your data...',
    'Looking at your recent entries to find helpful patterns. Keep tracking - it makes a difference!',
    'Taking a moment to analyze your recent habits. Remember, small steps lead to big changes!',
    'Preparing your personalized insights!',
  ];

  const [currentMessage, setCurrentMessage] = useState<string>(
    loadingMessages[0],
  );
  const [index, setIndex] = useState(0);

  // First hook to fetch AI summary
  useEffect(() => {
    async function fetchAISummary() {
      try {
        const response = await summarizeData(userId, type);
        setSummaryText(response);
        setHasError(false);
      } catch (error) {
        setHasError(true);
      }
    }

    fetchAISummary();
  }, [userId, type]);

  // Second hook to animate text while waiting for AI summary to be fetched
  useEffect(() => {
    if (summaryText) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < summaryText.length) {
          setDisplayedText(summaryText.slice(0, i + 1)); // Reveal text progressively
          i++;
        } else {
          clearInterval(interval);
        }
      }, duration); // Typing speed

      return () => clearInterval(interval);
    }
  }, [summaryText]);

  // Third hook to make the messages change either on loading or when the summary is fetched
  useEffect(() => {
    if (summaryText) return;

    const interval = setInterval(
      () => {
        setIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        setCurrentMessage(loadingMessages[index]);
      },
      currentMessage.length * duration + 4000,
    );

    return () => clearInterval(interval);
  }, [summaryText, index]);

  return (
    <Card className="w-full shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-primary">
            {title}
          </CardTitle>
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-primary/10 px-2 py-1"
          >
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">AI Powered</span>
          </Badge>
        </div>
      </CardHeader>
      {/* Ai summary box */}
      <CardContent className="h-48 overflow-y-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert text-base leading-relaxed inline-block font-semibold text-lg">
          {summaryText ? (
            <ReactMarkdown>{displayedText}</ReactMarkdown>
          ) : (
            <TypingAnimation
              className="inline-block font-semibold text-lg"
              duration={duration}
            >
              {hasError ? 'AI Model is currently unavailable' : currentMessage}
            </TypingAnimation>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
