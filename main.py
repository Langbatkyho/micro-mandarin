import os
import json
import tempfile
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class LessonRequest(BaseModel):
    topic: str
    level: str
    lang: str = "vi"

# --- Helper Functions ---
def get_gemini_model(api_key: str, model_name: str = "gemini-1.5-flash", response_mime_type: str = "application/json"):
    genai.configure(api_key=api_key)
    generation_config = {
        "temperature": 0.5,
        "response_mime_type": response_mime_type,
    }
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config=generation_config,
        safety_settings={
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
    )

# --- Endpoints ---

@app.post("/api/generate-lesson")
async def generate_lesson(
    request: LessonRequest,
    x_gemini_api_key: str = Header(None, alias="x-gemini-api-key")
):
    if not x_gemini_api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")

    try:
        # Define Language Strings
        lang_instruction = "Vietnamese (Tiếng Việt)" if request.lang == 'vi' else "English"
        
        system_instruction = f"""
        ROLE:
        You are a curriculum developer for a micro-learning Chinese app called "Micro Mandarin".

        TASK:
        Generate a short learning module based on the user's Interest and HSK Level.

        INPUT PARAMETERS:
        - User Interest: {request.topic}
        - HSK Level: {request.level}

        OUTPUT SCHEMA (Strict JSON):
        {{
          "lesson_title": "Title in {lang_instruction}",
          "context_intro": "A short context setting in {lang_instruction}",
          "vocabulary": [
            {{ "hanzi": "Chinese word", "pinyin": "pinyin", "translation": "meaning in {lang_instruction}", "type": "noun/verb" }}
          ],
          "dialogue": [
            {{
              "role": "A",
              "chinese": "Simple sentence using HSK vocabulary",
              "pinyin": "pinyin",
              "translation": "translation in {lang_instruction}"
            }},
            {{
              "role": "B",
              "chinese": "Reply sentence",
              "pinyin": "pinyin",
              "translation": "translation in {lang_instruction}"
            }}
          ],
          "grammar_point": {{
            "structure": "The grammar structure",
            "explanation": "Simple explanation in {lang_instruction}"
          }}
        }}
        """

        model = get_gemini_model(x_gemini_api_key)
        response = model.generate_content(system_instruction)
        
        return json.loads(response.text)

    except Exception as e:
        print(f"Error generating lesson: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-audio")
async def analyze_audio(
    audio: UploadFile = File(...),
    target_text: str = Form(...),
    target_pinyin: str = Form(...),
    lang: str = Form("vi"),
    x_gemini_api_key: str = Header(None, alias="x-gemini-api-key")
):
    if not x_gemini_api_key:
        raise HTTPException(status_code=401, detail="Missing API Key")

    try:
        # Read audio file into memory
        audio_bytes = await audio.read()
        
        # Create a temporary file because Gemini SDK expects a path or a specific blob structure
        # Note: For optimal performance in production, consider passing bytes directly if SDK supports it 
        # or handling this in memory. Here we use a temp file for compatibility.
        
        # NOTE: Gemini 1.5 Flash supports audio input. We need to supply the mime_type.
        audio_part = {
            "mime_type": "audio/webm", 
            "data": audio_bytes
        }

        lang_instruction = "Vietnamese (Tiếng Việt)" if lang == 'vi' else "English"

        system_prompt = f"""
        ROLE:
        You are "Laoshi" (老师), a strict but encouraging Mandarin Chinese pronunciation coach.

        TASK:
        1. Listen to the provided AUDIO input.
        2. Compare it strictly against the TARGET_TEXT provided below.
        3. Analyze the accuracy of Pinyin vowels, consonants, and specifically TONES.
        4. Provide feedback in {lang_instruction}.

        INPUT DATA:
        Target Text: {target_text}
        Target Pinyin: {target_pinyin}

        OUTPUT SCHEMA (Strict JSON):
        {{
          "heard_transcript": "The Chinese characters you actually heard",
          "heard_pinyin": "The Pinyin with tone marks you actually heard",
          "score": Integer (0-100),
          "tone_accuracy": "Perfect" | "Good" | "Needs Work" | "Bad",
          "errors": [
            {{
              "word": "The specific character",
              "expected_tone": "Tone number (1-5)",
              "heard_tone": "Tone number (1-5)",
              "comment": "Explain the error in {lang_instruction}"
            }}
          ],
          "overall_feedback": "A short, encouraging advice in {lang_instruction}."
        }}
        
        CONSTRAINTS:
        - If audio is silent, return score 0.
        """

        model = get_gemini_model(x_gemini_api_key)
        
        # Generate content with both text prompt and audio part
        response = model.generate_content([system_prompt, audio_part])
        
        return json.loads(response.text)

    except Exception as e:
        print(f"Error analyzing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)