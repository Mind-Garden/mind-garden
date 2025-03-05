'use client';
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Mic, Plus, CircleStop, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { extractTasksFromTranscript } from '@/actions/todos';

declare const window: any;

export default function TaskManager() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      // Convert the results to an array and map to their transcripts
      const transcripts = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      setTranscript(transcripts);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    // Start processing if transcript is not empty
    if (transcript.trim()) {
      processTranscript();
    }
  };

  const processTranscript = async () => {
    setIsProcessing(true);
    try {
      // Extract tasks from transcript
      const extractedTasks = await extractTasksFromTranscript(transcript);


      setTasks(prevTasks => [...extractedTasks, ...prevTasks]);
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <p className="text-gray-500 text-sm text-center">Press record and tell me about your tasks for today.</p>
      <Card className="bg-white/60 backdrop-blur-sm rounded-full border-none shadow-lg flex items-center w-1/2 max-w-md p-4 relative">
        <div className="absolute left-0 right-0 flex justify-center">
          <button 
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105 ${isRecording ? 'bg-red-50' : 'hover:bg-blue-50'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </div>
        <div className="ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-green-50"
                  aria-label="Add task manually"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Add task manually</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>

      
      
      {transcript && !isProcessing && (
        <p className="text-gray-700 text-sm text-center bg-white/80 p-2 rounded-lg shadow">{transcript}</p>
      )}
      
      {tasks.length > 0 && (
        <div className="w-1/2 max-w-md bg-white/80 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Extracted Tasks:</h3>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task} className="bg-blue-50 p-2 rounded text-sm">
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}