'use client';
import { CircleStop, Loader2, Mic } from 'lucide-react';
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

  return (
    <button
      onClick={handleToggleRecording}
      disabled={isProcessing}
      className={`p-2 rounded-full transition-transform duration-300 hover:scale-105 
        ${isRecording ? 'bg-red-50' : 'hover:bg-blue-50'} 
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
    </button>
  );
}
