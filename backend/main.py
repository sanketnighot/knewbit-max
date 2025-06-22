import re
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import json
import shutil
import subprocess
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from video_process import (
    VideoCache,
    transcribe_video,
    clean_json_output,
    generate_tts_audio,
)
import ffmpeg
from google import genai
import requests
from typing import List, Optional, TypedDict
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableLambda
import dotenv
import google.generativeai as geneai
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


dotenv.load_dotenv()

geneai.configure(api_key=os.environ["GOOGLE_API_KEY"])


# --- ENV ---
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
KNEWBIT_API_URL = os.getenv("KNEWBIT_API_URL")

# --- API Endpoints ---
ENROLLED_COURSES_API = f"{KNEWBIT_API_URL}/api/user/enrolled-courses"
ALL_COURSES_API = f"{KNEWBIT_API_URL}/courses"
MODEL_NAME = "gemini-2.5-flash-preview-05-20"

# Request deduplication storage
active_requests = {}
request_lock = threading.Lock()


# Cleanup function for stuck requests
def cleanup_old_requests():
    """Remove old requests that might be stuck"""
    import time

    current_time = time.time()
    with request_lock:
        # Remove requests older than 30 minutes
        keys_to_remove = []
        for key, timestamp in active_requests.items():
            if isinstance(timestamp, bool):  # Old format, clean up
                keys_to_remove.append(key)
            elif current_time - timestamp > 1800:  # 30 minutes
                keys_to_remove.append(key)

        for key in keys_to_remove:
            active_requests.pop(key, None)
            print(f"Cleaned up old request: {key}")


# Schedule cleanup every 5 minutes
import threading
import time


def periodic_cleanup():
    while True:
        time.sleep(300)  # 5 minutes
        cleanup_old_requests()


# Start cleanup thread
cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
cleanup_thread.start()

# Create FastAPI application with metadata for Swagger
app = FastAPI(
    title="Knewbit Max API",
    description="Backend API for Knewbit Max - AI-Powered Learning Platform",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc documentation
)

video_cache = VideoCache(max_size=10)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://max.knewbit.xyz",
        "https://knewbit-max.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Add rate limiting middleware (optional but recommended for production)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Root route
@app.get("/")
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Welcome to Knewbit Max API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {"status": "healthy", "service": "knewbit-max-api"}


@app.post("/dub")
@limiter.limit("3/minute")  # Allow max 3 dubbing requests per minute per IP
async def dub_video(
    request: Request,
    youtube_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    target_language: str = Form(...),
    lang_code: str = Form(...),
):
    """
    Video dubbing endpoint that ensures MP4 output format.

    Fixes applied for MP4 generation:
    1. yt-dlp configured to prefer MP4 formats and force recode if needed
    2. Input videos converted to H.264/MP4 format before processing
    3. FFmpeg output forced to use libx264 codec and MP4 container
    4. Added movflags +faststart for web optimization
    """
    temp_filename = None
    output_path = None
    request_key = None

    try:
        # --- Input validation ---
        if not youtube_url and not file:
            return JSONResponse(
                status_code=400,
                content={"error": "Either file or YouTube URL must be provided."},
            )

        # --- Create request deduplication key ---
        if youtube_url:
            request_key = f"youtube_{youtube_url}_{target_language}_{lang_code}"
        else:
            # For uploaded files, we'll create key after reading file content
            temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
            with open(temp_filename, "wb") as f_out:
                shutil.copyfileobj(file.file, f_out)

            # Create hash of file content for deduplication
            import hashlib

            with open(temp_filename, "rb") as f:
                file_hash = hashlib.md5(f.read()).hexdigest()
            request_key = f"file_{file_hash}_{target_language}_{lang_code}"

        # --- Check for duplicate requests ---
        import time

        with request_lock:
            if request_key in active_requests:
                print(f"Duplicate request detected: {request_key}")
                return JSONResponse(
                    status_code=429,
                    content={"error": "Request already being processed. Please wait."},
                )
            active_requests[request_key] = time.time()

        print(f"Processing new request: {request_key}")

        # --- Download from YouTube using yt-dlp CLI (if not already done) ---
        if youtube_url and not temp_filename:
            video_id = str(uuid.uuid4())
            temp_filename = f"temp_{video_id}.mp4"
            command = [
                "yt-dlp",
                "-f",
                "bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/best[ext=mp4]/best",
                "--merge-output-format",
                "mp4",
                "--recode-video",
                "mp4",
                "-o",
                temp_filename,
                youtube_url,
            ]
            result = subprocess.run(
                command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            if result.returncode != 0:
                raise RuntimeError(f"yt-dlp failed: {result.stderr.decode()}")

        # --- Ensure MP4 format ---
        temp_filename = await ensure_mp4_format(temp_filename)

        # --- Transcribe and generate dubbing ---
        request_id = f"dub-api-{uuid.uuid4()}"
        result_string = await transcribe_video(
            file_path=temp_filename,
            request_id=request_id,
            model_name=MODEL_NAME,
            video_cache=video_cache,
            target_language=target_language,
        )

        transcript_data = clean_json_output(result_string)
        segments = transcript_data.get("segments", [])
        if not segments:
            raise ValueError("No segments found in transcript.")

        output_path = f"dubbed_output_{uuid.uuid4()}.mp4"
        await create_dubbed_video_fast(temp_filename, segments, lang_code, output_path)

        # --- Validate output format ---
        try:
            probe = ffmpeg.probe(output_path)
            video_stream = next(
                (s for s in probe["streams"] if s["codec_type"] == "video"), None
            )
            if video_stream:
                codec = video_stream.get("codec_name", "unknown")
                print(f"Final output video codec: {codec}")
        except Exception as e:
            print(f"Warning: Could not verify output format: {e}")

        print(f"Successfully processed request: {request_key}")
        return FileResponse(
            output_path, media_type="video/mp4", filename="dubbed_video.mp4"
        )

    except Exception as e:
        print(f"Error processing request {request_key}: {str(e)}")
        # Clean up output file if it was created
        if output_path and os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        # Clean up temporary files
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
                print(f"Cleaned up temp file: {temp_filename}")
            except Exception as e:
                print(f"Error cleaning up temp file: {e}")

        # Remove request from active requests
        if request_key:
            with request_lock:
                active_requests.pop(request_key, None)
                print(f"Removed request from active list: {request_key}")


async def ensure_mp4_format(input_path):
    """
    Ensure the video file is in MP4 format with H.264 codec.
    If not, convert it to MP4. This fixes the .webm issue by forcing proper MP4 output.
    """
    try:
        # Check if the file is already in proper MP4 format
        probe = ffmpeg.probe(input_path)
        video_stream = next(
            (s for s in probe["streams"] if s["codec_type"] == "video"), None
        )

        if video_stream:
            codec_name = video_stream.get("codec_name", "unknown")
            print(f"Input video codec: {codec_name}, file: {input_path}")

        if (
            video_stream
            and video_stream.get("codec_name") == "h264"
            and input_path.lower().endswith(".mp4")
        ):
            # Already in proper MP4 format
            print(f"Video already in MP4 H.264 format: {input_path}")
            return input_path

        # Convert to MP4
        output_path = f"converted_{uuid.uuid4()}.mp4"
        print(f"Converting {input_path} to MP4 format: {output_path}")

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-f",
            "mp4",
            "-movflags",
            "+faststart",
            output_path,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"MP4 conversion error: {result.stderr}")
            # If conversion fails, return original file
            return input_path

        # Remove original file and return converted one
        if os.path.exists(input_path):
            os.remove(input_path)

        print(f"Successfully converted to MP4: {output_path}")
        return output_path

    except Exception as e:
        print(f"Error in ensure_mp4_format: {e}")
        # Return original file if anything goes wrong
        return input_path


async def create_dubbed_video_fast(video_path, segments, lang_code, output_path):
    """Super fast method: Parallel TTS generation + single FFmpeg command"""

    # Step 1: Generate all TTS files in parallel
    temp_audio_files = []

    async def generate_single_tts(segment, idx):
        tts_path = f"tts_{uuid.uuid4()}.wav"
        translated_text = segment["translated_text"]

        # Run TTS generation in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            await loop.run_in_executor(
                executor, generate_tts_audio, translated_text, lang_code, tts_path
            )

        return (tts_path, segment, idx)

    # Generate all TTS files concurrently
    tts_tasks = [
        generate_single_tts(segment, idx) for idx, segment in enumerate(segments)
    ]
    tts_results = await asyncio.gather(*tts_tasks)

    try:
        # Step 2: Build single FFmpeg command with all inputs and filters
        build_and_run_ffmpeg_command(video_path, tts_results, output_path)

    finally:
        # Cleanup TTS files
        for tts_path, _, _ in tts_results:
            if os.path.exists(tts_path):
                os.remove(tts_path)


def build_and_run_ffmpeg_command(video_path, tts_results, output_path):
    """Build and execute single optimized FFmpeg command"""

    # Get video duration for reference
    probe = ffmpeg.probe(video_path)
    video_duration = float(probe["streams"][0]["duration"])

    # Sort by start time to ensure proper ordering
    tts_results = sorted(tts_results, key=lambda x: float(x[1]["start"]))

    # Build FFmpeg command
    cmd = ["ffmpeg", "-y"]

    # Add video input
    cmd.extend(["-i", video_path])

    # Add all audio inputs
    for tts_path, _, _ in tts_results:
        cmd.extend(["-i", tts_path])

    # Build filter complex for audio processing
    filter_parts = []

    # Process each audio segment with timing
    for idx, (tts_path, segment, _) in enumerate(tts_results):
        start_ms = int(float(segment["start"]) * 1000)
        input_idx = idx + 1  # +1 because video is input 0

        # Delay audio to start time
        filter_parts.append(
            f"[{input_idx}:a]adelay={start_ms}|{start_ms}[delayed{idx}]"
        )

    # Mix all delayed audio segments
    if len(tts_results) == 1:
        final_audio = "[delayed0]"
    else:
        # Create mix inputs string
        mix_inputs = "".join([f"[delayed{i}]" for i in range(len(tts_results))])
        filter_parts.append(
            f"{mix_inputs}amix=inputs={len(tts_results)}:duration=longest:dropout_transition=2[mixed_audio]"
        )
        final_audio = "[mixed_audio]"

    # Join all filter parts
    filter_complex = ";".join(filter_parts)

    # Add filter complex to command
    cmd.extend(["-filter_complex", filter_complex])

    # Map video and final audio
    cmd.extend(["-map", "0:v"])  # Original video
    cmd.extend(["-map", final_audio])  # Mixed audio

    # Output settings for MP4 format
    cmd.extend(
        [
            "-c:v",
            "libx264",  # Force H.264 codec for MP4 compatibility
            "-preset",
            "fast",  # Fast encoding preset
            "-crf",
            "23",  # Good quality setting
            "-c:a",
            "aac",  # Audio codec
            "-b:a",
            "128k",  # Audio bitrate
            "-ac",
            "2",  # Stereo output
            "-f",
            "mp4",  # Force MP4 container format
            "-movflags",
            "+faststart",  # Enable fast start for web playback
            "-shortest",  # Match shortest stream
            output_path,
        ]
    )

    # Run the command
    print(f"Running FFmpeg command: {' '.join(cmd[:10])}...")  # Debug (first 10 args)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}")
        raise Exception(f"FFmpeg failed: {result.stderr}")


# Alternative ultra-fast method if the above still has issues
async def create_dubbed_video_ultra_fast(video_path, segments, lang_code, output_path):
    """Ultra fast method: Direct audio stream replacement"""

    temp_audio_files = []

    # Generate TTS files in parallel (same as above)
    async def generate_single_tts(segment, idx):
        tts_path = f"tts_{uuid.uuid4()}.wav"
        translated_text = segment["translated_text"]

        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            await loop.run_in_executor(
                executor, generate_tts_audio, translated_text, lang_code, tts_path
            )

        return (tts_path, segment)

    tts_tasks = [
        generate_single_tts(segment, idx) for idx, segment in enumerate(segments)
    ]
    tts_results = await asyncio.gather(*tts_tasks)

    try:
        # Create audio timeline using direct file operations (fastest)
        create_audio_timeline_direct(video_path, tts_results, output_path)

    finally:
        for tts_path, _ in tts_results:
            if os.path.exists(tts_path):
                os.remove(tts_path)


def create_audio_timeline_direct(video_path, tts_results, output_path):
    """Direct audio timeline creation - fastest method"""

    # Get video info
    probe = ffmpeg.probe(video_path)
    duration = float(probe["streams"][0]["duration"])
    sample_rate = 44100

    # Sort segments by start time
    sorted_segments = sorted(tts_results, key=lambda x: float(x[1]["start"]))

    # Create temporary file list for concatenation
    file_list = f"filelist_{uuid.uuid4()}.txt"
    temp_files = []

    try:
        current_time = 0.0

        with open(file_list, "w") as f:
            for tts_path, segment in sorted_segments:
                start_time = float(segment["start"])

                # Add silence before segment if needed
                if start_time > current_time:
                    silence_duration = start_time - current_time
                    silence_file = f"silence_{uuid.uuid4()}.wav"

                    # Create silence quickly
                    subprocess.run(
                        [
                            "ffmpeg",
                            "-y",
                            "-f",
                            "lavfi",
                            "-i",
                            f"anullsrc=channel_layout=stereo:sample_rate={sample_rate}",
                            "-t",
                            str(silence_duration),
                            "-c:a",
                            "pcm_s16le",
                            silence_file,
                        ],
                        capture_output=True,
                        check=True,
                    )

                    f.write(f"file '{silence_file}'\n")
                    temp_files.append(silence_file)

                # Add the TTS audio
                f.write(f"file '{tts_path}'\n")

                # Update current time
                audio_probe = ffmpeg.probe(tts_path)
                audio_duration = float(audio_probe["streams"][0]["duration"])
                current_time = start_time + audio_duration

            # Add final silence to match video duration
            if current_time < duration:
                final_silence = f"final_silence_{uuid.uuid4()}.wav"
                subprocess.run(
                    [
                        "ffmpeg",
                        "-y",
                        "-f",
                        "lavfi",
                        "-i",
                        f"anullsrc=channel_layout=stereo:sample_rate={sample_rate}",
                        "-t",
                        str(duration - current_time),
                        "-c:a",
                        "pcm_s16le",
                        final_silence,
                    ],
                    capture_output=True,
                    check=True,
                )

                f.write(f"file '{final_silence}'\n")
                temp_files.append(final_silence)

        # Concatenate audio files
        combined_audio = f"combined_audio_{uuid.uuid4()}.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                file_list,
                "-c:a",
                "pcm_s16le",
                combined_audio,
            ],
            capture_output=True,
            check=True,
        )

        # Combine with video (final step) - ensure MP4 output
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                video_path,
                "-i",
                combined_audio,
                "-c:v",
                "libx264",  # Force H.264 codec for MP4
                "-preset",
                "fast",  # Fast encoding
                "-crf",
                "23",  # Good quality
                "-c:a",
                "aac",
                "-f",
                "mp4",  # Force MP4 container
                "-movflags",
                "+faststart",  # Web-optimized
                "-shortest",
                output_path,
            ],
            capture_output=True,
            check=True,
        )

        # Cleanup
        if os.path.exists(combined_audio):
            os.remove(combined_audio)

    finally:
        # Clean up temp files
        for temp_file in temp_files + [file_list]:
            if os.path.exists(temp_file):
                os.remove(temp_file)


# --- Types ---
class CleanedCourse(TypedDict):
    id: str
    title: str
    slug: str
    description: Optional[str]
    category: Optional[str]
    difficulty: str
    tags: List[str]
    is_free: bool
    price: float
    rating: float
    enrollments: int


class AgentState(TypedDict):
    knewbit_jwt: str
    user_question: str
    enrolled_courses: Optional[List[CleanedCourse]]
    all_courses: Optional[List[CleanedCourse]]
    matched_courses: Optional[List[dict]]


class QueryRequest(BaseModel):
    user_question: str


class ChatMessage(BaseModel):
    role: str  # "user" or "ai"
    message: str


class TutorChatRequest(BaseModel):
    user_message: str
    course_id: str
    chat_history: List[ChatMessage]


# --- Clean course data ---
def clean_course_data(courses: List[dict]) -> List[CleanedCourse]:
    return [
        {
            "id": c["id"],
            "title": c["title"],
            "slug": c.get("slug", ""),  # Add slug field
            "description": c.get("description") or c.get("summary") or "",
            "category": c.get("category_name", ""),
            "difficulty": c["difficulty_level"],
            "tags": c.get("tags", []),
            "is_free": c["is_free"],
            "price": c["price"],
            "rating": c["average_rating"],
            "enrollments": c["enrollment_count"],
        }
        for c in courses
        if c["status"] == "published"
    ]


# --- Step 1: Get enrolled courses ---
def fetch_enrolled(state: AgentState) -> AgentState:
    response = requests.get(
        f"{ENROLLED_COURSES_API}",
        headers={"Authorization": f"Bearer {state['knewbit_jwt']}"},
    )
    enrolled = clean_course_data(response.json())
    return {**state, "enrolled_courses": enrolled}


# --- Step 2: Get all platform courses ---
def fetch_all_courses(state: AgentState) -> AgentState:
    response = requests.get(ALL_COURSES_API)
    all_courses = clean_course_data(response.json())
    return {**state, "all_courses": all_courses}


# --- Step 3: Gemini selects best matches ---
def gemini_match_courses(state: AgentState) -> AgentState:
    user_question = state["user_question"]
    enrolled_courses = state["enrolled_courses"]
    all_courses = state["all_courses"]
    enrolled_ids = {course["id"] for course in enrolled_courses}
    available_courses = [c for c in all_courses if c["id"] not in enrolled_ids]

    # Limit courses for token efficiency
    available_courses = available_courses[:100]

    prompt = f"""
You are an intelligent course recommendation system.

Analyze the user's learning query and their enrolled course history to determine their skill level, learning pattern, and interests.
Then, select the most relevant existing platform courses that would help the user achieve their goal.

User Question:
{user_question}

User's Enrolled Courses (JSON):
{json.dumps(enrolled_courses)}

Available Platform Courses (JSON):
{json.dumps(all_courses)}

Instructions:
1. Understand the user's domain knowledge and learning style from enrolled courses.
2. Identify the top 3–5 platform courses that are not already enrolled, which best align with the user's question.
3. Return a LIST of JSON objects like:
{{
    "id": "...",
    "title": "...",
    "slug": "...",
    "reason": "why this course is ideal for the user"
}}
4. Ensure to return only the JSON list without any additional text or explanation.
"""

    result = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)

    try:
        content = result.text.strip()
        print("Gemini output:", content)
        matched = safe_parse_json(content)
    except Exception as e:
        print("Gemini output parsing failed:", e)
        matched = []

    return {**state, "matched_courses": matched}


# --- Utilities ---
def safe_parse_json(response_text: str) -> dict:
    """Attempts to safely parse an AI-generated JSON string."""
    response_text = response_text.strip()

    # Remove code block markers like ```json or ``` if present
    response_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", response_text.strip())

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"Initial parse failed: {e}")
        # Attempt to fix common issues
        response_text = (
            response_text.replace("True", "true")
            .replace("False", "false")
            .replace("None", "null")
        )
        response_text = re.sub(r",\s*}", "}", response_text)  # Remove trailing commas
        response_text = re.sub(r",\s*\]", "]", response_text)
        response_text = re.sub(r"\\(?![\"\\/bfnrtu])", r"\\\\", response_text)

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"Retry parse failed: {e}")
            raise ValueError("AI response could not be parsed as valid JSON.")


# --- LangGraph Workflow ---
graph = StateGraph(AgentState)

graph.add_node("fetch_enrolled", RunnableLambda(fetch_enrolled))
graph.add_node("fetch_all_courses", RunnableLambda(fetch_all_courses))
graph.add_node("gemini_match", RunnableLambda(gemini_match_courses))

graph.set_entry_point("fetch_enrolled")
graph.add_edge("fetch_enrolled", "fetch_all_courses")
graph.add_edge("fetch_all_courses", "gemini_match")
graph.add_edge("gemini_match", END)

compiled = graph.compile()


# --- AI Tutor Endpoint ---
@app.post("/ai-tutor")
@limiter.limit("10/minute")  # Allow 10 tutor requests per minute per IP
async def ai_tutor_chat(request: Request, chat_request: TutorChatRequest):
    """
    AI Tutor endpoint that provides educational assistance based on course content.

    Uses LearnLM-inspired pedagogical principles:
    - Inspires active learning through questioning
    - Manages cognitive load with clear explanations
    - Adapts to learner needs
    - Stimulates curiosity with follow-up questions
    - Encourages metacognition
    """
    try:
        # Get course details (you'll need to implement this function)
        course_details = await get_course_by_id(chat_request.course_id)

        if not course_details:
            raise HTTPException(status_code=404, detail="Course not found")

        # Build comprehensive tutoring prompt using PARTS framework
        tutor_prompt = build_tutor_prompt(
            course_details=course_details,
            user_message=chat_request.user_message,
            chat_history=chat_request.chat_history,
        )

        # Generate response using Gemini Flash model
        result = client.models.generate_content(
            model="gemini-2.5-flash", contents=tutor_prompt
        )

        ai_response = result.text.strip()

        return {"response": ai_response, "status": "success"}

    except Exception as e:
        print(f"AI Tutor error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate tutor response")


def build_tutor_prompt(
    course_details: dict, user_message: str, chat_history: List[ChatMessage]
) -> str:
    """
    Build a comprehensive tutoring prompt using LearnLM best practices and PARTS framework.

    PARTS Framework:
    - Persona: Educational AI tutor role
    - Act: Provide personalized tutoring
    - Recipient: Individual learner
    - Theme: Course-specific content
    - Structure: Conversational guidance format
    """

    # Format chat history for context
    history_context = ""
    if chat_history:
        history_context = "\n\nPrevious conversation context:\n"
        for msg in chat_history[-6:]:  # Last 6 messages for context
            role_label = "Student" if msg.role == "user" else "You"
            history_context += f"{role_label}: {msg.message}\n"

    # Extract and format key course information
    key_concepts = course_details.get("key_concepts", [])
    if key_concepts and isinstance(key_concepts[0], dict):
        # Handle array of objects format
        key_concepts_text = ", ".join(
            [
                f"{concept.get('concept', concept.get('title', str(concept)))}"
                for concept in key_concepts[:5]
            ]
        )
    else:
        # Handle simple array format
        key_concepts_text = ", ".join(key_concepts[:5]) if key_concepts else "N/A"

    course_context = f"""
Course Information:
- Title: {course_details.get('title', 'N/A')}
- Description: {course_details.get('description', course_details.get('summary', 'N/A'))}
- Difficulty: {course_details.get('difficulty_level', 'N/A')}
- Category: {course_details.get('category_name', 'N/A')}
- Key Concepts: {key_concepts_text}
- Educational Takeaways: {'; '.join(course_details.get('core_educational_takeaways', [])[:3]) if course_details.get('core_educational_takeaways') else 'N/A'}
- Important Facts: {'; '.join(course_details.get('important_facts_figures', [])[:3]) if course_details.get('important_facts_figures') else 'N/A'}
- Lecture Content Preview: {course_details.get('lecture_script', '')[:500] + '...' if course_details.get('lecture_script') else 'N/A'}
"""

    prompt = f"""You are an expert AI tutor specializing in personalized education. Your role is to help students deeply understand course material through effective pedagogical techniques.

EDUCATIONAL PRINCIPLES TO FOLLOW:
✓ Inspire active learning - Ask questions that make students think critically
✓ Manage cognitive load - Break complex concepts into digestible parts
✓ Adapt to learner needs - Adjust explanations based on their responses
✓ Stimulate curiosity - Use engaging examples and thought-provoking questions
✓ Encourage metacognition - Help students understand their own learning process

TUTORING GUIDELINES:
1. **Socratic Method**: Instead of directly giving answers, guide students to discover solutions through thoughtful questioning
2. **Scaffolding**: Build upon their current understanding step by step
3. **Real-world Connections**: Relate concepts to practical, everyday examples
4. **Encouraging Tone**: Be supportive, patient, and enthusiastic about their learning journey
5. **Check Understanding**: Regularly ask follow-up questions to ensure comprehension

{course_context}

{history_context}

EXAMPLE INTERACTIONS:
Student: "I don't understand this concept"
Tutor: "I'd be happy to help you work through this! Can you tell me which specific part feels unclear? Sometimes breaking it down into smaller pieces can make complex concepts much more manageable. What comes to mind when you first think about [concept]?"

Student: "What does [term] mean?"
Tutor: "Great question! Before I explain [term], what do you think it might relate to based on what we've covered so far? [Brief explanation with analogy]. Does this help clarify it? What questions does this raise for you?"

Current Student Question: "{user_message}"

RESPONSE INSTRUCTIONS:
- Address their specific question while encouraging deeper thinking
- Use analogies and examples relevant to the course content
- Ask 1-2 thoughtful follow-up questions to promote active learning
- Keep responses conversational and encouraging (2-4 sentences typically)
- If they seem confused, break down concepts into smaller, more manageable parts
- Reference the course material when relevant (lecture content, key concepts, etc.)
- Encourage them to explain concepts back to you to reinforce learning
- Adapt your language to their apparent level of understanding

Respond as their dedicated AI tutor, helping them not just learn the material, but understand how to learn effectively:"""

    return prompt


async def get_course_by_id(course_id: str) -> Optional[dict]:
    """
    Fetch course details by course ID/slug from the course API.
    Includes fallback for when course API is unavailable.
    """
    try:
        # Use the same course API that the frontend uses
        api_url = os.getenv("KNEWBIT_API_URL", "http://localhost:3001")
        course_url = f"{api_url}/courses/{course_id}"

        print(f"Fetching course details from: {course_url}")

        response = requests.get(course_url, timeout=10)

        if response.status_code == 200:
            course_data = response.json()
            print(f"Successfully fetched course: {course_data.get('title', 'Unknown')}")
            return course_data
        elif response.status_code == 404:
            print(f"Course not found: {course_id}")
            return None
        else:
            print(f"Failed to fetch course: {response.status_code} - {response.text}")
            # Return fallback course data for tutoring to continue
            return create_fallback_course_data(course_id)

    except requests.exceptions.Timeout:
        print(f"Timeout fetching course details for: {course_id}")
        return create_fallback_course_data(course_id)
    except requests.exceptions.ConnectionError:
        print(f"Connection error fetching course details for: {course_id}")
        return create_fallback_course_data(course_id)
    except Exception as e:
        print(f"Error fetching course details: {e}")
        return create_fallback_course_data(course_id)


def create_fallback_course_data(course_id: str) -> dict:
    """
    Create fallback course data when the course API is unavailable.
    This allows the tutor to still function with limited context.
    """
    return {
        "id": course_id,
        "slug": course_id,
        "title": f"Course: {course_id}",
        "description": "Course content details are temporarily unavailable, but I can still help answer your questions about general learning concepts.",
        "difficulty_level": "Unknown",
        "category_name": "General",
        "key_concepts": [],
        "core_educational_takeaways": [],
        "important_facts_figures": [],
        "lecture_script": "",
        "summary": "I'm here to help you learn! While I don't have the specific course details right now, I can still assist with general questions and learning concepts.",
    }


# --- FastAPI Endpoint ---
@app.post("/recommend-courses")
def recommend_courses(query: QueryRequest, request: Request):
    token = request.cookies.get("knewbit_jwt")
    if not token:
        token = (
            auth_header.split("Bearer ")[-1]
            if (auth_header := request.headers.get("Authorization"))
            else None
        )
    if not token:
        raise HTTPException(
            status_code=401, detail="Unauthorized: Missing authentication token."
        )
    try:
        result = compiled.invoke(query.model_dump() | {"knewbit_jwt": token})
        return {"recommendations": result["matched_courses"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info",
    )
