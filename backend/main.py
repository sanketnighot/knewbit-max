from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import json
import shutil
import subprocess
import asyncio
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

dotenv.load_dotenv()

# --- ENV ---
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
KNEWBIT_API_URL = os.getenv("KNEWBIT_API_URL")

# --- API Endpoints ---
ENROLLED_COURSES_API = f"{KNEWBIT_API_URL}/enrolled_courses"
ALL_COURSES_API = f"{KNEWBIT_API_URL}/all_courses"

# Create FastAPI application with metadata for Swagger
app = FastAPI(
    title="Knewbit Max API",
    description="Backend API for Knewbit Max - AI-Powered Learning Platform",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc documentation
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
async def dub_video(
    youtube_url: str = Form(None),
    file: UploadFile = File(None),
    target_language: str = Form(...),
    lang_code: str = Form(...),
):
    temp_filename = None
    try:
        # --- Download from YouTube using yt-dlp CLI ---
        if youtube_url:
            video_id = str(uuid.uuid4())
            temp_filename = f"temp_{video_id}.mp4"
            command = [
                "yt-dlp",
                "-f",
                "bv+ba/best",
                "--merge-output-format",
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

        # --- Save uploaded file ---
        elif file:
            temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
            with open(temp_filename, "wb") as f_out:
                shutil.copyfileobj(file.file, f_out)
        else:
            return JSONResponse(
                status_code=400,
                content={"error": "Either file or YouTube URL must be provided."},
            )

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

        return FileResponse(
            output_path, media_type="video/mp4", filename="dubbed_video.mp4"
        )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        if temp_filename and os.path.exists(temp_filename):
            os.remove(temp_filename)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)


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

    # Output settings for speed
    cmd.extend(
        [
            "-c:v",
            "copy",  # Don't re-encode video
            "-c:a",
            "aac",  # Audio codec
            "-b:a",
            "128k",  # Audio bitrate
            "-ac",
            "2",  # Stereo output
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

        # Combine with video (final step)
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                video_path,
                "-i",
                combined_audio,
                "-c:v",
                "copy",
                "-c:a",
                "aac",
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
    description: Optional[str]
    category: Optional[str]
    difficulty: str
    tags: List[str]
    is_free: bool
    price: float
    rating: float
    enrollments: int


class AgentState(TypedDict):
    user_id: str
    user_question: str
    enrolled_courses: Optional[List[CleanedCourse]]
    all_courses: Optional[List[CleanedCourse]]
    matched_courses: Optional[List[dict]]


class QueryRequest(BaseModel):
    user_id: str
    user_question: str


# --- Clean course data ---
def clean_course_data(courses: List[dict]) -> List[CleanedCourse]:
    return [
        {
            "id": c["id"],
            "title": c["title"],
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
    response = requests.get(f"{ENROLLED_COURSES_API}?user_id={state['user_id']}")
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
3. Return a JSON list like:
[
  {{
    "id": "...",
    "title": "...",
    "reason": "why this course is ideal for the user"
  }}
]
"""

    result = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)

    try:
        content = result.text.strip()
        matched = json.loads(content)
    except Exception as e:
        print("Gemini output parsing failed:", e)
        matched = []

    return {**state, "matched_courses": matched}


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


# --- FastAPI Endpoint ---
@app.post("/recommend-courses")
def recommend_courses(query: QueryRequest):
    try:
        result = compiled.invoke(query.dict())
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
