'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { summarizeData } from '@/actions/ai-data-analysis';
import ReactMarkdown from 'react-markdown';

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
  const [summaryText, setSummaryText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [hasError, setHasError] = useState(false);
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);

  // Component-scoped refs
  const typingSpeed = useRef(30);
  const typingIndex = useRef(0);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const loadingTimer = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Loading messages
  const loadingMessages = [
    "Hope you're having a wonderful day! I'm gathering some insights using your data...",
    'Looking at your recent entries to find helpful patterns. Keep tracking - it makes a difference!',
    'Taking a moment to analyze your recent habits. Remember, small steps lead to big changes!',
    'Preparing your personalized insights!',
  ];

  // Clean up function
  const cleanupTimers = () => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
      loadingTimer.current = null;
    }
  };

  // Setup mount tracking
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  // Function to rotate to the next message
  const rotateToNextMessage = () => {
    setCurrentLoadingIndex(
      (prevIndex) => (prevIndex + 1) % loadingMessages.length,
    );
  };

  // Fetch AI data
  useEffect(() => {
    const isActive = true;

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

  // Typewriter effect
  useEffect(() => {
    const textToShow =
      hasError || !summaryText
        ? loadingMessages[currentLoadingIndex]
        : summaryText;

    // Clean up any existing timers
    cleanupTimers();

    // Reset display and typing state
    setDisplayText('');
    typingIndex.current = 0;

    const typeNextCharacter = () => {
      if (typingIndex.current < textToShow.length) {
        setDisplayText(textToShow.substring(0, typingIndex.current + 1));
        typingIndex.current += 1;

        typingTimer.current = setTimeout(
          typeNextCharacter,
          typingSpeed.current,
        );
      } else {
        // Typing is complete
        typingTimer.current = null;

        // Schedule next message if showing loading message
        if (!summaryText || hasError) {
          loadingTimer.current = setTimeout(
            rotateToNextMessage,
            messageDuration,
          );
        }
      }
    };

    typeNextCharacter();

    return cleanupTimers;
  }, [currentLoadingIndex, hasError, messageDuration, summaryText]);

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
        <div
          className="prose prose-sm max-w-none dark:prose-invert text-base leading-relaxed"
          ref={contentRef}
        >
          <div className="markdown-container">
            <ReactMarkdown>{displayText}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
