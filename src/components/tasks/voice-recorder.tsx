'use client';
import { CircleStop, Loader2, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing?: boolean;
  onTranscriptChange?: (transcript: string) => void;
}

declare const window: any;

export default function VoiceRecorder({
  onTranscriptComplete,
  onTranscriptChange,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const colors = [
    'bg-emerald-400',
    'bg-teal-400',
    'bg-violet-400',
    'bg-sky-400',
  ];

  const numBars = 48;
  const maxHeight = 40;
  const minHeight = 2;

  const [isAnimating, setIsAnimating] = useState(false);
  const [bars, setBars] = useState(Array(numBars).fill(0));
  const animationRef = useRef<number | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // On result from the speech recognition engine, concatenate all the transcripts
    // received and set the component state to the concatenated string.
    // Additionally, call onTranscriptChange with the same string, if it's provided.
    recognitionRef.current.onresult = (event: any) => {
      const transcripts = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');

      setTranscript(transcripts);
      onTranscriptChange?.(transcripts);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (transcript.trim()) {
      onTranscriptComplete(transcript);
    }
    setTranscript('');
    onTranscriptChange?.('');
  };

  const handleToggleRecording = () => {
    toggleAnimation();
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const animateBars = () => {
    if (isAnimating) {
      setBars(
        Array(numBars)
          .fill(0)
          .map(() => Math.random() * (maxHeight - minHeight) + minHeight),
      );

      animationRef.current = window.setTimeout(animateBars, 100);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = window.setTimeout(animateBars, 100);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating]);

  const toggleAnimation = () => {
    setIsAnimating((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-full">
        {/* Audio visualizer in background */}
        <div className="flex h-12 w-full items-center justify-center space-x-1">
          {Array(numBars)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className={`w-0.5 rounded-full ${colors[index % colors.length]}`}
                animate={{
                  height: isRecording ? `${bars[index]}px` : 2,
                }}
                transition={{
                  height: {
                    duration: isRecording ? 0.3 : 1.2,
                    ease: isRecording ? 'easeOut' : 'circOut',
                  },
                }}
              />
            ))}
        </div>

        {/* Mic button centered on top */}
        <motion.button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          whileTap={{ scale: 0.95 }}
          className={`absolute z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-colors duration-300
              ${isRecording ? 'bg-red-50' : 'bg-blue-50'} 
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Activate voice input"
        >
          {isProcessing ? (
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          ) : isRecording ? (
            <CircleStop className="w-7 h-7 text-red-500 animate-pulse" />
          ) : (
            <Mic className="w-7 h-7 text-blue-500" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
