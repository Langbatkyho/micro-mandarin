import { GoogleGenAI, Type } from "@google/genai";
import { HSKLevel, LessonData, AudioAnalysisResult } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/webm;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates a Chinese lesson module using Gemini 2.5 Flash
 */
export const generateLesson = async (
  topic: string, 
  level: HSKLevel, 
  lang: 'en' | 'vi', 
  apiKey: string
): Promise<LessonData> => {
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a Chinese lesson about "${topic}" for level ${level}.
The user's native language is ${lang === 'en' ? 'English' : 'Vietnamese'}.
Provide translations and explanations in ${lang === 'en' ? 'English' : 'Vietnamese'}.

Structure:
1. lesson_title: Title in Chinese and ${lang}.
2. context_intro: Brief intro.
3. vocabulary: List of new words.
4. dialogue: A conversation.
5. grammar_point: One key grammar point used in the dialogue.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lesson_title: { type: Type.STRING },
          context_intro: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hanzi: { type: Type.STRING },
                pinyin: { type: Type.STRING },
                translation: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ['hanzi', 'pinyin', 'translation', 'type']
            }
          },
          dialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                chinese: { type: Type.STRING },
                pinyin: { type: Type.STRING },
                translation: { type: Type.STRING }
              },
              required: ['role', 'chinese', 'pinyin', 'translation']
            }
          },
          grammar_point: {
            type: Type.OBJECT,
            properties: {
              structure: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['structure', 'explanation']
          }
        },
        required: ['lesson_title', 'context_intro', 'vocabulary', 'dialogue', 'grammar_point']
      }
    }
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No content generated");
  
  return JSON.parse(jsonText) as LessonData;
};

/**
 * Analyzes user audio using Gemini 2.5 Flash Multimodal capabilities
 */
export const analyzeAudio = async (
  audioBlob: Blob, 
  targetText: string, 
  targetPinyin: string, 
  lang: 'en' | 'vi',
  apiKey: string
): Promise<AudioAnalysisResult> => {

  const ai = new GoogleGenAI({ apiKey });
  const base64Audio = await blobToBase64(audioBlob);

  const prompt = `Analyze the user's pronunciation of the Chinese text: "${targetText}" (Pinyin: ${targetPinyin}).
The user's native language is ${lang === 'en' ? 'English' : 'Vietnamese'}.
Provide feedback in ${lang === 'en' ? 'English' : 'Vietnamese'}.

Compare the audio to the expected text.
Return a JSON object with:
- heard_transcript: What Chinese words you heard.
- heard_pinyin: The Pinyin of what you heard.
- score: A score from 0-100.
- tone_accuracy: "Perfect", "Good", "Needs Work", or "Bad".
- overall_feedback: Constructive feedback.
- errors: List of specific pronunciation errors.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/webm', 
            data: base64Audio
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          heard_transcript: { type: Type.STRING },
          heard_pinyin: { type: Type.STRING },
          score: { type: Type.NUMBER },
          tone_accuracy: { type: Type.STRING },
          overall_feedback: { type: Type.STRING },
          errors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                expected_tone: { type: Type.STRING },
                heard_tone: { type: Type.STRING },
                comment: { type: Type.STRING }
              },
              required: ['word', 'expected_tone', 'heard_tone', 'comment']
            }
          }
        },
        required: ['heard_transcript', 'heard_pinyin', 'score', 'tone_accuracy', 'overall_feedback', 'errors']
      }
    }
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No analysis generated");

  return JSON.parse(jsonText) as AudioAnalysisResult;
};