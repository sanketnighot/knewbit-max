# 🚀 Knewbit Max Backend API

FastAPI-based backend powering the Knewbit Max AI-driven learning platform with intelligent tutoring, video dubbing, and course recommendations.

## 🛠️ Tech Stack

- **Framework**: FastAPI (async Python web framework)
- **Language**: Python 3.13+
- **Package Manager**: uv (ultra-fast Python package manager)
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Video Processing**: FFmpeg + yt-dlp
- **Rate Limiting**: SlowAPI
- **Orchestration**: LangChain + LangGraph

## ✨ Key Features

### 🤖 **AI Tutor**
- **Personalized Learning**: Adaptive AI tutor using Google Gemini's LearnLM
- **Educational Principles**: Active learning, cognitive load management, curiosity stimulation
- **Socratic Method**: Guides students through questioning rather than direct answers
- **Course Integration**: Context-aware responses based on specific course content

### 🎬 **Video Dubbing**
- **AI-Powered Translation**: Convert videos to multiple languages
- **Voice Synthesis**: Natural-sounding dubbing using Sarvam TTS
- **Format Support**: YouTube URLs and direct video uploads
- **Quality Output**: Optimized MP4 output with H.264 encoding

### 📚 **Course Recommendations**
- **Intelligent Matching**: AI-driven course suggestions based on learning history
- **User Analysis**: Analyzes enrolled courses to understand preferences
- **Personalized Paths**: Tailored recommendations for optimal learning progression

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+**
- **uv** package manager ([Install uv](https://docs.astral.sh/uv/getting-started/installation/))
- **FFmpeg** (for video processing)
- **Google API Key** (for Gemini AI)

### Installation & Setup

1. **Install dependencies**:
   ```bash
   cd backend
   uv sync
   ```

2. **Environment Configuration**:
   ```bash
   # Create environment file
   cp .env.example .env

   # Add your API keys
   nano .env
   ```

3. **Start Development Server**:
   ```bash
   # Using uv (recommended)
   uv run main.py

   # Alternative: Direct uvicorn
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Verify Installation**:
   - **API Root**: http://localhost:8000/
   - **Health Check**: http://localhost:8000/health
   - **Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc

## 🔑 Environment Variables

Create a `.env` file with the following:

```bash
# Google AI Configuration (Required)
GOOGLE_API_KEY=your_gemini_api_key_here

# Course API Configuration (Required)
KNEWBIT_API_URL=http://localhost:3001

# Sarvam TTS API (Required for dubbing)
SARVAM_API_KEY=your_sarvam_api_key

# Optional: Database Configuration
DATABASE_URL=your_database_url

# Optional: Logging Level
LOG_LEVEL=INFO
```

## 📖 API Documentation

### Core Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/` | API information and health | None |
| `GET` | `/health` | Service health check | None |
| `POST` | `/recommend-courses` | Get AI course recommendations | Standard |
| `POST` | `/ai-tutor` | Chat with AI tutor | 10/min |
| `POST` | `/dub` | Video dubbing service | 3/min |

### AI Tutor API

#### `POST /ai-tutor`

**Description**: Interactive AI tutor for personalized learning assistance.

**Request Body**:
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

**Response**:
```json
{
  "response": "Great question! Before diving into machine learning, what do you think 'learning' means when we talk about computers? Let me guide you through this concept step by step...",
  "status": "success"
}
```

**Educational Principles Applied**:
- ✅ **Active Learning**: Encourages critical thinking through questioning
- ✅ **Cognitive Load Management**: Breaks complex concepts into digestible parts
- ✅ **Adaptive Learning**: Adjusts to individual learner needs
- ✅ **Curiosity Stimulation**: Uses engaging examples and thought-provoking questions
- ✅ **Metacognition**: Helps students understand their learning process

### Video Dubbing API

#### `POST /dub`

**Description**: AI-powered video dubbing with multilingual support.

**Request** (Form Data):
```bash
# YouTube URL dubbing
curl -X POST http://localhost:8000/dub \
  -F "youtube_url=https://youtube.com/watch?v=..." \
  -F "target_language=Hindi" \
  -F "lang_code=hi"

# File upload dubbing
curl -X POST http://localhost:8000/dub \
  -F "file=@video.mp4" \
  -F "target_language=Spanish" \
  -F "lang_code=es"
```

**Response**: MP4 video file with dubbed audio

**Supported Languages**:
- Hindi (hi), Spanish (es), French (fr), German (de)
- Arabic (ar), Chinese (zh), Japanese (ja), Korean (ko)
- And more...

### Course Recommendations API

#### `POST /recommend-courses`

**Description**: AI-powered course recommendations based on user learning history.

**Request Body**:
```json
{
  "user_question": "I want to learn about artificial intelligence and machine learning"
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "id": "ai-ml-fundamentals",
      "title": "AI & ML Fundamentals",
      "slug": "ai-ml-fundamentals",
      "reason": "Perfect starting point covering essential AI concepts and practical ML applications"
    }
  ]
}
```

## 📁 Project Structure

```
backend/
├── 📄 main.py              # FastAPI application entry point
├── 📄 video_process.py     # Video processing and dubbing logic
├── 📄 course.py           # Course recommendation engine
├── 📄 pyproject.toml      # uv project configuration
├── 📄 requirements.txt    # Alternative dependency format
├── 📄 uv.lock            # Dependency lock file
├── 📄 .env.example       # Environment template
├── 📄 dockerfile         # Docker configuration
└── 📄 README.md          # This file
```

## 🔧 Development

### Adding Dependencies

```bash
# Add new package
uv add package-name

# Add development dependency
uv add --dev package-name

# Update all dependencies
uv sync --upgrade
```

### Running Tests

```bash
# Install test dependencies
uv add --dev pytest pytest-asyncio httpx

# Run tests
uv run pytest

# Run with coverage
uv run pytest --cov=.
```

### Code Quality

```bash
# Format code
uv run black .

# Lint code
uv run flake8 .

# Type checking
uv run mypy .
```

## 🌍 Production Deployment

### Docker Deployment

```bash
# Build container
docker build -t knewbit-backend .

# Run container
docker run -p 8000:8000 --env-file .env knewbit-backend
```

### Direct Production Server

```bash
# Install production dependencies only
uv sync --no-dev

# Run with multiple workers
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Or with Gunicorn
uv run gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Environment-Specific Configuration

```bash
# Development
uv run main.py

# Staging
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# Production
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --no-reload
```

## 🧪 Testing

### Manual API Testing

```bash
# Health check
curl http://localhost:8000/health

# AI Tutor test
curl -X POST http://localhost:8000/ai-tutor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_message": "Can you explain neural networks?",
    "course_id": "ai-basics",
    "chat_history": []
  }'

# Course recommendations test
curl -X POST http://localhost:8000/recommend-courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_question": "I want to learn data science"
  }'
```

### Expected Behavior

1. **AI Tutor**:
   - Responds with educational guidance using Socratic method
   - Asks follow-up questions to encourage deeper thinking
   - References course-specific content when available
   - Maintains conversational and encouraging tone

2. **Video Dubbing**:
   - Processes YouTube URLs or uploaded files
   - Generates dubbed audio in target language
   - Returns optimized MP4 with H.264 encoding
   - Maintains original video quality

3. **Course Recommendations**:
   - Analyzes user's learning history and preferences
   - Returns 3-5 relevant course suggestions
   - Provides clear reasoning for each recommendation

## 🐛 Troubleshooting

### Common Issues

1. **"Course not found" error**:
   ```bash
   # Check course API connectivity
   curl $KNEWBIT_API_URL/courses/sample-course

   # Verify environment variable
   echo $KNEWBIT_API_URL
   ```

2. **Rate limiting errors**:
   ```bash
   # Check current rate limits
   curl -I http://localhost:8000/ai-tutor

   # Wait before retrying (10 requests/minute for AI tutor)
   ```

3. **Authentication errors**:
   ```bash
   # Test with valid JWT token
   curl -H "Authorization: Bearer VALID_TOKEN" http://localhost:8000/health
   ```

4. **Video processing errors**:
   ```bash
   # Check FFmpeg installation
   ffmpeg -version

   # Verify yt-dlp installation
   yt-dlp --version
   ```

5. **Gemini API errors**:
   ```bash
   # Test API key
   curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
        https://generativelanguage.googleapis.com/v1/models

   # Check quota limits in Google Cloud Console
   ```

## 📊 Performance & Monitoring

### Rate Limits
- **AI Tutor**: 10 requests/minute per IP
- **Video Dubbing**: 3 requests/minute per IP
- **Course Recommendations**: Standard rate limiting

### Monitoring Endpoints
- **Health**: `/health` - Service availability
- **Metrics**: `/metrics` - Performance metrics (if enabled)
- **Logs**: Check console output for request tracking

### Performance Tips
- Use video caching for repeated requests
- Implement proper error handling for external APIs
- Monitor rate limits to avoid service disruption
- Set up proper logging for debugging

## 🔐 Security

### Authentication
- JWT tokens required for most endpoints
- Rate limiting prevents abuse
- CORS configured for specific origins
- Input validation on all endpoints

### API Security
- Environment variables for sensitive data
- Request deduplication prevents duplicate processing
- Proper error handling without data leakage
- Secure file handling for uploads

## 🤝 Contributing

1. **Code Style**: Follow PEP 8 and use Black formatter
2. **Testing**: Add tests for new endpoints
3. **Documentation**: Update API docs for changes
4. **Error Handling**: Implement proper error responses
5. **Performance**: Consider rate limiting and caching

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-endpoint

# 2. Install dependencies
uv sync

# 3. Make changes and test
uv run main.py

# 4. Run tests
uv run pytest

# 5. Format code
uv run black .

# 6. Submit PR
git push origin feature/new-endpoint
```

---

**⚡ Powered by FastAPI and Google Gemini AI**
