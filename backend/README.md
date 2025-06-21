# Knewbit Max Backend API

FastAPI-based backend for the Knewbit Max AI-powered learning platform.

## 🛠️ Tech Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **uvicorn** - ASGI server for FastAPI
- **uv** - Fast Python package manager
- **Python 3.13+** - Latest Python version

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- uv package manager

### Installation & Setup

1. **Install dependencies** (if not already done):
   ```bash
   uv sync
   ```

2. **Run the development server**:
   ```bash
   # Using uv to run the application
   uv run python main.py

   # OR using uvicorn directly
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the API**:
   - **API Root**: http://localhost:8000/
   - **Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc
   - **Health Check**: http://localhost:8000/health

## 📖 API Documentation

### Available Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive Swagger UI documentation
- `GET /redoc` - ReDoc documentation

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Next.js frontend)
- `http://127.0.0.1:3000`

## 🔧 Development

### Running in Development Mode

```bash
# Auto-reload on file changes
uv run python main.py
```

### Adding New Dependencies

```bash
# Add a new dependency
uv add package-name

# Add a development dependency
uv add --dev package-name
```

### Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── pyproject.toml    # uv project configuration
├── uv.lock          # Dependency lock file
├── .python-version  # Python version specification
└── README.md        # This file
```

## 🌐 Production Deployment

For production, consider using:

```bash
# Install production dependencies only
uv sync --no-dev

# Run with production settings
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📝 Notes

- The application uses **uvicorn** as the ASGI server
- **CORS** is enabled for frontend integration
- **Swagger UI** is automatically available at `/docs`
- All dependencies are managed through **uv** for fast package management

## Features

- **Video Dubbing**: AI-powered video dubbing with multilingual support
- **Course Recommendations**: Intelligent course matching based on user preferences
- **AI Tutor**: Personalized educational assistant for course content

## New AI Tutor Feature

### Overview
The AI Tutor provides personalized educational assistance based on course content using Google Gemini's LearnLM capabilities. It implements pedagogical best practices to enhance learning outcomes.

### Educational Principles
- **Active Learning**: Encourages critical thinking through questioning
- **Cognitive Load Management**: Breaks complex concepts into digestible parts
- **Adaptive Learning**: Adjusts to individual learner needs
- **Curiosity Stimulation**: Uses engaging examples and thought-provoking questions
- **Metacognition**: Helps students understand their learning process

### API Endpoint

#### POST `/ai-tutor`

**Request Body:**
```json
{
  "user_message": "What is machine learning?",
  "course_id": "course-slug-or-id",
  "chat_history": [
    {"role": "user", "message": "Previous question"},
    {"role": "ai", "message": "Previous response"}
  ]
}
```

**Response:**
```json
{
  "response": "Great question! Before diving into machine learning, what do you think 'learning' means when we talk about computers? ...",
  "status": "success"
}
```

**Rate Limiting:** 10 requests per minute per IP address

### Environment Variables Required

```bash
GOOGLE_API_KEY=your_gemini_api_key
KNEWBIT_API_URL=http://localhost:3001  # Your course API URL
```

### Testing the AI Tutor

1. **Start the backend:**
   ```bash
   cd backend
   uv run main.py
   ```

2. **Test with curl:**
   ```bash
   curl -X POST http://localhost:8000/ai-tutor \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "user_message": "Can you explain the main concept of this course?",
       "course_id": "sample-course",
       "chat_history": []
     }'
   ```

3. **Expected behavior:**
   - AI responds with educational guidance using Socratic method
   - Asks follow-up questions to encourage deeper thinking
   - References course-specific content when available
   - Maintains conversational and encouraging tone

### Integration Notes

- The AI Tutor integrates with your existing course API at `$KNEWBIT_API_URL/courses/{slug}`
- Course data includes: title, description, key concepts, educational takeaways, lecture script
- Chat history is maintained for context (last 6 messages used)
- Frontend integration via `/ai-tutor` endpoint

### Troubleshooting

1. **"Course not found" error**: Verify `KNEWBIT_API_URL` and course API availability
2. **Rate limiting**: Wait before making additional requests (10/minute limit)
3. **Authentication errors**: Ensure valid JWT token in Authorization header
4. **Gemini API errors**: Check `GOOGLE_API_KEY` and API quota limits

For detailed implementation, see the `build_tutor_prompt()` function in `main.py`.
