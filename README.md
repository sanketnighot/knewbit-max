# 🎓 Knewbit Max - AI-Powered Learning Platform

<div align="center">

![Knewbit Max](https://img.shields.io/badge/Knewbit-Max-cyan)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-green)

*Next-generation learning platform powered by AI for personalized education*

</div>

## 🌟 Overview

Knewbit Max is an innovative AI-powered learning platform that revolutionizes how students engage with educational content. Built with cutting-edge technology, it provides personalized learning experiences through intelligent tutoring, multilingual video dubbing, and adaptive course recommendations.

## ✨ Key Features

### 🤖 **AI Tutor**
- **Personalized Learning**: Adaptive AI tutor powered by Google Gemini's LearnLM
- **Socratic Method**: Guides students through questioning rather than direct answers
- **Course Integration**: Context-aware responses based on specific course content
- **Educational Principles**: Implements cognitive load management and active learning

### 🎬 **Multilingual Video Dubbing**
- **AI-Powered Translation**: Convert course videos to multiple languages
- **Voice Synthesis**: Natural-sounding dubbing using advanced TTS
- **Format Support**: YouTube URLs and direct video uploads
- **Quality Output**: Optimized MP4 output with H.264 encoding

### 📚 **Smart Course Recommendations**
- **Intelligent Matching**: AI-driven course suggestions based on learning history
- **Skill Assessment**: Analyzes enrolled courses to understand user preferences
- **Personalized Learning Paths**: Tailored recommendations for optimal learning progression

### 📊 **Interactive Learning Tools**
- **Dynamic Flashcards**: Auto-generated from course content
- **Adaptive Quizzes**: Interactive assessments with instant feedback
- **Progress Tracking**: Comprehensive learning analytics
- **Course Summaries**: AI-generated key takeaways and concepts

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   External      │
│   (Next.js)     │◄──►│   (FastAPI)      │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Python 3.13   │    │ • Google Gemini │
│ • TypeScript    │    │ • FastAPI        │    │ • Sarvam TTS    │
│ • Tailwind CSS  │    │ • Uvicorn        │    │ • YouTube API   │
│ • Supabase      │    │ • LangChain      │    │ • FFmpeg        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **Bun**
- **Python** 3.13+
- **uv** package manager
- **Google API Key** (for Gemini)
- **FFmpeg** (for video processing)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/knewbit-max.git
cd knewbit-max
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
uv sync

# Create environment file
cp .env.example .env
# Add your API keys to .env

# Start the backend server
uv run main.py
```

The backend will be available at `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
bun install

# Create environment file
cp .env.local.example .env.local
# Configure your environment variables

# Start the development server
bun dev
```

The frontend will be available at `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)
```bash
# Google AI Configuration
GOOGLE_API_KEY=your_gemini_api_key

# Course API Configuration
KNEWBIT_API_URL=http://localhost:3001

# Sarvam TTS API (for dubbing)
SARVAM_API_KEY=your_sarvam_api_key

# Optional: Database Configuration
DATABASE_URL=your_database_url
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
knewbit-max/
├── 📁 frontend/              # Next.js React application
│   ├── 📁 src/
│   │   ├── 📁 app/           # Next.js app router
│   │   ├── 📁 components/    # React components
│   │   ├── 📁 lib/          # Utility functions & API
│   │   ├── 📁 types/        # TypeScript definitions
│   │   └── 📁 contexts/     # React context providers
│   ├── package.json
│   └── README.md
├── 📁 backend/               # FastAPI Python application
│   ├── main.py              # FastAPI application entry
│   ├── video_process.py     # Video processing logic
│   ├── course.py           # Course recommendation logic
│   ├── pyproject.toml      # Python dependencies
│   ├── requirements.txt    # Alternative dependency format
│   └── README.md
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.3 with App Router
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4
- **State Management**: React Context & Hooks
- **Authentication**: Supabase Auth
- **HTTP Client**: Fetch API with custom utilities

### Backend
- **Framework**: FastAPI (async Python web framework)
- **Language**: Python 3.13
- **AI Integration**: Google Generative AI (Gemini)
- **Package Manager**: uv (ultra-fast Python package manager)
- **Video Processing**: FFmpeg + yt-dlp
- **Rate Limiting**: SlowAPI
- **Orchestration**: LangChain + LangGraph

### AI Services
- **Language Model**: Google Gemini 2.5 Flash
- **Text-to-Speech**: Sarvam AI TTS
- **Video Processing**: FFmpeg with H.264 encoding
- **Educational Framework**: LearnLM principles

## 🔧 Development

### Frontend Development
```bash
cd frontend

# Start development server with Turbopack
bun dev

# Build for production
bun build

# Run linting
bun lint
```

### Backend Development
```bash
cd backend

# Start with auto-reload
uv run main.py

# Add new dependencies
uv add package-name

# Run tests (if available)
uv run pytest
```

## 📊 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🌍 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
bun build
# Deploy the `out` directory
```

### Backend (Docker/Cloud)
```bash
cd backend
# Production server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for advanced AI capabilities
- **Sarvam AI** for multilingual TTS services
- **Next.js** and **FastAPI** communities
- **LearnLM** research for educational AI principles

## 📞 Support

For support, email support@knewbit.com or join our [Discord community](https://discord.gg/knewbit).

---

<div align="center">
Made with ❤️ by the Knewbit Team
</div>
