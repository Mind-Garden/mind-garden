'use client';

import { useState, useEffect, useRef } from 'react';
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
  readonly messageDuration?: number;
  readonly id?: string; // Explicit ID for the component
}

export default function AIResponse({
  userId,
  type,
  title = 'Summary',
  messageDuration = 5000,
  id, // Accept ID from props
}: AIResponseProps) {
  // Component state
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [index, setIndex] = useState(0);
  const duration = 15;

  // Loading messages
  const loadingMessages = [
    'Hope you are having a wonderful day! I am gathering some insights using your data...',
    'Looking at your recent entries to find helpful patterns. Keep tracking - it makes a difference!',
    'Taking a moment to analyze your recent habits. Remember, small steps lead to big changes!',
    'Preparing your personalized insights!',
  ];

  // Fetch AI data
  useEffect(() => {
    async function fetchAISummary() {
      try {
        const response = await summarizeData(userId, type);
        setSummaryText(response);
        setHasError(false);
      } catch (error) {
        console.error('Error fetching AI summary', error);
        setHasError(true);
      }
    }

    fetchAISummary();
  }, [userId, type]);

  // Cycle through loading messages until AI response is ready
  useEffect(() => {
    if (summaryText) return; // Stop cycling once summaryText is set

    const interval = setInterval(
      () => {
        setIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        setCurrentMessage(loadingMessages[index]);
      },
      currentMessage.length * duration + 4000,
    ); // Rotate every 4 seconds

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
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert text-base leading-relaxed">
          <div className="markdown-container">
            <TypingAnimation
              className="inline-block font-semibold text-lg"
              duration={duration}
            >
              {summaryText ? summaryText : currentMessage}
            </TypingAnimation>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
