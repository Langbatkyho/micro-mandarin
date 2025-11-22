import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw } from 'lucide-react';
import { Dictionary } from '../types';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isAnalyzing: boolean;
  t: Dictionary;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isAnalyzing, t }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer webm/opus for Gemini, but browser support varies.
      // Gemini generally supports standard audio containers.
      const options = MediaRecorder.isTypeSupported('audio/webm') 
        ? { mimeType: 'audio/webm' } 
        : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(t.errorMicrophone);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
         <div className="text-slate-500 text-sm animate-pulse mb-2">{t.analyzing}</div>
         <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 animate-progress-indeterminate"></div>
         </div>
         <style>{`
           @keyframes progress-indeterminate {
             0% { width: 0%; margin-left: 0%; }
             50% { width: 50%; margin-left: 25%; }
             100% { width: 0%; margin-left: 100%; }
           }
           .animate-progress-indeterminate {
             animation: progress-indeterminate 1.5s infinite linear;
           }
         `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative">
        {isRecording && (
           <div className="absolute -inset-4 bg-red-100 rounded-full animate-ping opacity-75"></div>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
        </button>
      </div>

      <div className="text-sm font-medium text-slate-600 min-h-[1.25rem]">
        {isRecording ? (
          <span className="text-red-500 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             {t.recording} {formatTime(recordingTime)}
          </span>
        ) : (
          <span className="text-slate-400">{t.tapRecord}</span>
        )}
      </div>
    </div>
  );
};