import { HSKLevel, LessonData, AudioAnalysisResult } from '../types';

// Safe way to access environment variables in various environments
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || (window as any)._env_?.[key];
  } catch (e) {
    return undefined;
  }
};

const BACKEND_URL = getEnv('VITE_BACKEND_URL') || "http://localhost:8000";

/**
 * Generates a Chinese lesson module via Python Backend
 */
export const generateLesson = async (
  topic: string, 
  level: HSKLevel, 
  lang: 'en' | 'vi', 
  apiKey: string
): Promise<LessonData> => {
  
  const response = await fetch(`${BACKEND_URL}/api/generate-lesson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-api-key': apiKey
    },
    body: JSON.stringify({
      topic,
      level,
      lang
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to generate lesson");
  }

  return await response.json();
};

/**
 * Analyzes user audio via Python Backend
 */
export const analyzeAudio = async (
  audioBlob: Blob, 
  targetText: string, 
  targetPinyin: string, 
  lang: 'en' | 'vi',
  apiKey: string
): Promise<AudioAnalysisResult> => {

  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("target_text", targetText);
  formData.append("target_pinyin", targetPinyin);
  formData.append("lang", lang);

  const response = await fetch(`${BACKEND_URL}/api/analyze-audio`, {
    method: 'POST',
    headers: {
      // Content-Type is automatically set for FormData
      'x-gemini-api-key': apiKey
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to analyze audio");
  }

  return await response.json();
};
