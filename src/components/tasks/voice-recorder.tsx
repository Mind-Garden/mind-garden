'use client';
import { CircleStop, Loader2, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

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

  // Audio visualization
  const colors = [
    'bg-emerald-400',
    'bg-teal-400',
    'bg-violet-400',
    'bg-sky-400',
  ];
  const numBars = 58;
  const minHeight = 2;
  const maxHeight = 40;

  const [bars, setBars] = useState(Array(numBars).fill(minHeight));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  /**
   * Start recording audio and process it for speech recognition and audio visualization.
   *
   * Initializes a WebKit SpeechRecognition object and sets it to continuous and interim results mode.
   * Sets up an AudioContext and Analyser to process the audio stream.
   * Requests access to the user's microphone and sets up the MediaStreamSource and connects it to the Analyser.
   * Starts the speech recognition and audio visualization animations.
   *
   * @throws Will log an error to the console if there's an issue accessing the microphone.
   */
  const startRecording = async () => {
    try {
      setIsRecording(true);

      // Initialize Speech Recognition
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        const transcripts = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');

        setTranscript(transcripts);
        onTranscriptChange?.(transcripts);
      };
      recognitionRef.current.start();

      // Initialize Audio Processing
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamSourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      mediaStreamSourceRef.current.connect(analyserRef.current);

      dataArrayRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount,
      );
      animateBars();
    } catch (error) {
      toast.error('Error accessing microphone. Please try again.');
    }
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

    // Stop audio processing
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setBars(Array(numBars).fill(minHeight));
  };

  /**
   * Animates the audio visualizer bars by updating their heights based on the audio frequency data.
   * This function retrieves frequency data from the analyser node and calculates the height of
   * each bar in the visualizer, creating a symmetrical effect around the center. It then updates
   * the state with the new bar heights and recursively calls itself using requestAnimationFrame
   * for continuous animation.
   */
  const animateBars = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Generate symmetrical bars around the center
      const newBars = Array(numBars).fill(0);
      const half = Math.floor(numBars / 2);

      for (let i = 0; i < half; i++) {
        const value = dataArrayRef.current[i % dataArrayRef.current.length];
        const height = Math.max(minHeight, (value / 255) * maxHeight);

        newBars[half + i] = height; // Right side
        newBars[half - i - 1] = height; // Left side (mirror effect)
      }

      setBars(newBars);
      animationRef.current = requestAnimationFrame(animateBars);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-full">
        {/* Audio visualizer */}
        <div className="flex h-12 w-full items-center justify-center space-x-1">
          {bars.map((height, index) => (
            <motion.div
              key={index}
              className={`w-0.5 rounded-full ${colors[index % colors.length]}`}
              animate={{ height: isRecording ? `${height}px` : minHeight }}
              transition={{
                height: {
                  duration: isRecording ? 0.1 : 1.2,
                  ease: isRecording ? 'easeOut' : 'circOut',
                },
              }}
            />
          ))}
        </div>

        {/* Mic button */}
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
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
