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
