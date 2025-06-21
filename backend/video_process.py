import hashlib
import json
import re
import time
from typing import Any, Dict, List, Optional
import asyncio
import requests
import base64
import os
from starlette.concurrency import run_in_threadpool
import dotenv
import google.generativeai as genai

dotenv.load_dotenv()

# Configure the Google GenAI client
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

SARVAM_API_KEY = "sk_0w266dla_ZoG8JiTcFyQPpZTm58dY1ljx"

# Storage for progress updates
progress_updates: Dict[str, List[Dict[str, Any]]] = {}

VIDEO_TRANSCRIPTION_PROMPT = """
You are an expert multilingual dubbing transcriber and translator.

Your task is to:
1. Transcribe the spoken content from the video with accurate timestamps.
2. Identify the speaker’s emotion.
3. Translate the text into **{target_language}**, optimized for dubbing.

⚠️ Dubbing Requirements:
- The translated sentence must match the **original speech duration** (start → end).
- It must **preserve the tone, emotion, and intent** of the speaker (e.g., joy, sarcasm, sadness).
- Use natural, conversational phrasing suited for voiceover—not overly literal.
- Make it **speakable**: translation should sound fluid and time-fit when spoken aloud.

🎯 Return the result as a valid JSON object like this:

{
  "segments": [
    {
      "start": <float: start time in seconds>,
      "end": <float: end time in seconds>,
      "original_text": "<verbatim English transcription>",
      "translated_text": "<translated text in {target_language}, dubbing-optimized>",
      "emotion": "<emotion like joy, anger, sadness, excitement, neutral, etc.>"
    }
  ]
}

Do not add any notes or explanations outside the JSON.
Ensure the response is valid JSON that can be parsed directly.
"""


class VideoCache:
    def __init__(self, max_size=50):
        self.cache, self.max_size = {}, max_size

    def _hash_key(self, text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    async def get_cached_response(self, k: str) -> Optional[Dict]:
        return self.cache.get(k)

    async def set_cached_response(self, k: str, r: Dict) -> None:
        if len(self.cache) >= self.max_size:
            self.cache.pop(next(iter(self.cache)))
        self.cache[k] = r


def update_progress(request_id: str, message: str) -> None:
    if request_id not in progress_updates:
        progress_updates[request_id] = []
    progress_updates[request_id].append(
        {"timestamp": time.time(), "message": message, "type": "progress"}
    )
    print(f"[{request_id}] {message}")


async def upload_and_process_video(file_path: str, request_id: str) -> Optional[Any]:
    # Step 1: Initial validation
    update_progress(request_id, "Starting video upload and processing...")
    update_progress(request_id, f"Validating file path: {file_path}")
    if not os.path.exists(file_path):
        update_progress(request_id, f"Error: File not found at {file_path}")
        return None

    # Step 2: File upload
    update_progress(request_id, f"Initiating file upload: {file_path}")
    try:
        video_file = await run_in_threadpool(
            lambda: genai.upload_file(
                path=file_path, display_name=os.path.basename(file_path)
            )
        )
        update_progress(
            request_id,
            f"Upload successful - File name: {video_file.name}, Size: {os.path.getsize(file_path)} bytes",
        )
    except Exception as e:
        update_progress(request_id, f"Upload failed: {str(e)}")
        return None

    # Step 3: Processing monitoring
    update_progress(request_id, "Beginning processing status monitoring...")
    attempt = 1
    while True:
        update_progress(
            request_id, f"Checking processing status (Attempt {attempt})..."
        )
        try:
            video_file = await run_in_threadpool(
                lambda: genai.get_file(name=video_file.name)
            )

            # Step 4a: Check for successful completion
            if video_file.state.name == "ACTIVE":
                update_progress(request_id, "Processing completed successfully")
                update_progress(request_id, "File is ACTIVE and ready for use")
                return video_file

            # Step 4b: Check for failure
            if video_file.state.name == "FAILED":
                error = getattr(video_file, "error", {}).get(
                    "message", "Unknown processing error"
                )
                update_progress(request_id, f"Processing failed with error: {error}")
                return None

            # Step 4c: Still processing
            update_progress(
                request_id,
                f"Current processing state: {video_file.state.name} (Attempt {attempt})",
            )
            update_progress(
                request_id, "Waiting 10 seconds before next status check..."
            )
            await asyncio.sleep(10)
            attempt += 1

        except Exception as e:
            update_progress(request_id, f"Error checking processing status: {str(e)}")
            return None

    # except Exception as e:
    #     update_progress(request_id, f"Upload error: {str(e)}")
    #     return None


async def transcribe_video(
    file_path: str,
    request_id: str,
    model_name: str,
    video_cache: VideoCache,
    target_language: str,
) -> str:
    try:
        with open(file_path, "rb") as f:
            video_hash = hashlib.md5(f.read()).hexdigest()
    except IOError as e:
        return json.dumps({"error": f"Could not read file: {e}"})

    cache_key = f"{video_hash}_transcription"
    if cached := await video_cache.get_cached_response(cache_key):
        update_progress(request_id, f"Cache hit: {cache_key}")
        return cached.get("content", "")

    video_file = None
    try:
        video_file = await upload_and_process_video(file_path, request_id)
        if not video_file:
            return json.dumps({"error": "Video upload or processing failed."})

        update_progress(
            request_id, f"Running transcription with model '{model_name}'..."
        )
        model = genai.GenerativeModel(model_name)
        response = await run_in_threadpool(
            lambda: model.generate_content(
                [
                    VIDEO_TRANSCRIPTION_PROMPT.replace(
                        "{target_language}", target_language
                    ),
                    video_file,
                ],
                request_options={"timeout": 600},
            )
        )

        content = (
            response.parts[0].text
            if response.parts
            else json.dumps({"error": "Empty model response."})
        )
        update_progress(request_id, "Transcription completed.")
        await video_cache.set_cached_response(cache_key, {"content": content})
        return content

    except Exception as e:
        error_message = f"Transcription error: {str(e)}"
        update_progress(request_id, error_message)
        return json.dumps({"error": error_message})

    finally:
        if video_file:
            await run_in_threadpool(lambda: genai.delete_file(name=video_file.name))
            update_progress(request_id, f"Deleted remote file: {video_file.name}")
        progress_updates.pop(request_id, None)


def clean_json_output(raw: str) -> dict:
    # Remove triple backtick blocks (e.g., ```json ... ```)
    raw = re.sub(r"^```(?:json)?\n", "", raw.strip(), flags=re.IGNORECASE)
    raw = re.sub(r"\n```$", "", raw.strip())
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse model output as JSON",
            "raw": raw,
            "exception": str(e),
        }


def generate_tts_audio(text: str, lang_code: str, output_path: str):

    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {"text": text, "target_language_code": lang_code, "speaker": "karun"}
    response = requests.post(
        "https://api.sarvam.ai/text-to-speech", headers=headers, json=payload
    )
    if response.status_code != 200:
        raise Exception(f"TTS API Error: {response.text}")

    data = response.json()

    if "audios" not in data or not data["audios"]:
        raise ValueError("No audio data received from TTS API")

    # Decode and save WAV file directly
    audio_base64 = data["audios"][0]
    audio_bytes = base64.b64decode(audio_base64)

    with open(output_path, "wb") as f:
        f.write(audio_bytes)
