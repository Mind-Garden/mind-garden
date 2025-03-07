'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { fetchResponse } from '@/actions/tasks';
import { summarizeData } from '@/actions/ai-data-analysis';

interface AIResponseProps {
  readonly userId: string;
  readonly data?: any;
  readonly title?: string;
  readonly messageDuration?: number; // How long each fallback message stays visible (ms)
}

export default function AIResponse({
  userId,
  data,
  title = 'Summary',
  messageDuration = 5000, // 5 seconds default
}: AIResponseProps) {
  const [summaryText, setSummaryText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);

  const typingSpeed = useRef(30); // milliseconds per character
  const typingIndex = useRef(0);
  const messageTimer = useRef<NodeJS.Timeout | null>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  // Fallback messages that don't reveal AI issues
  const fallbackMessages = [
    "Hope you're having a wonderful day! I'm gathering some insights about your mood patterns...",
    'Looking at your recent entries to find helpful patterns. Keep tracking - it makes a difference!',
    'Taking a moment to analyze your recent habits. Remember, small steps lead to big changes!',
    'Preparing your personalized insights. Your consistency in tracking is really impressive!',
    'Analyzing your sleep and mood data. Remember to be kind to yourself today!',
  ];

  // Function to rotate to the next message
  const rotateToNextMessage = () => {
    // Clear any existing rotation timer
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }

    // Stop any current typing
    setIsTyping(false);

    // Reset typing state
    typingIndex.current = 0;

    // Move to next fallback message
    setCurrentFallbackIndex(
      (prevIndex) => (prevIndex + 1) % fallbackMessages.length,
    );
  };

  // Fetch AI data on component mount
  useEffect(() => {
    async function fetchAISummary() {
      setIsLoading(true);
      try {
        const response = await summarizeData(userId, 'sleep');
        setSummaryText(response);
        setHasError(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching AI summary:', error);
        setHasError(true);
      }
    }

    fetchAISummary();
  }, []);

  // Determine what text to show
  const textToShow =
    isLoading || hasError || !summaryText
      ? fallbackMessages[currentFallbackIndex] // show fallback messages when loading or error occurs
      : summaryText;

  // Typewriter effect - triggered when textToShow changes
  useEffect(() => {
    // Clean up any existing typing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    // Reset display and typing state
    setDisplayText('');
    typingIndex.current = -1;
    setIsTyping(true);

    const typeNextCharacter = () => {
      if (typingIndex.current < textToShow.length) {
        setDisplayText((prev) => prev + textToShow.charAt(typingIndex.current));
        typingIndex.current += 1;

        typingTimer.current = setTimeout(
          typeNextCharacter,
          typingSpeed.current,
        );
      } else {
        // Typing is complete
        setIsTyping(false);
        typingTimer.current = null;

        // Now that typing is complete, set timer for next message rotation if we're showing a fallback message
        if (isLoading || hasError) {
          messageTimer.current = setTimeout(
            rotateToNextMessage,
            messageDuration,
          );
        }
      }
    };

    typeNextCharacter();

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [textToShow, isLoading, hasError, messageDuration]);

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
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="min-h-[100px] text-base leading-relaxed">
            {displayText}
            {isTyping && (
              <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-primary"></span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
