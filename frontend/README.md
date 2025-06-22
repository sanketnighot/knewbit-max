# 🎨 Knewbit Max Frontend

Modern React application built with Next.js for the Knewbit Max AI-powered learning platform.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **State Management**: React Context & Hooks
- **Package Manager**: Bun (ultra-fast JavaScript runtime)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Bun** package manager
- Backend API running on port 8000

### Installation

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Environment Setup**:
   ```bash
   # Copy environment template
   cp .env.local.example .env.local

   # Edit with your configuration
   nano .env.local
   ```

3. **Start Development Server**:
   ```bash
   # Start with Turbopack (faster builds)
   bun dev

   # Alternative: Standard Next.js dev server
   bun run dev
   ```

4. **Open Application**:
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Development Scripts

```bash
# Development with Turbopack
bun dev

# Production build
bun build

# Start production server
bun start

# Run ESLint
bun lint

# Type checking
bun run type-check
```

## 🌍 Environment Variables

Create a `.env.local` file with:

```bash
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Configuration (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 📁 Project Structure

```
src/
├── 📁 app/                   # Next.js App Router
│   ├── favicon.ico
│   ├── globals.css          # Global Tailwind styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Homepage
├── 📁 components/           # Reusable React components
│   ├── AuthModal.tsx        # Authentication modal
│   ├── ChatInterface.tsx    # AI Tutor chat interface
│   ├── CourseDisplay.tsx    # Course listing display
│   ├── CourseFlashcards.tsx # Interactive flashcards
│   ├── CoursePage.tsx       # Main course page
│   ├── CourseQuiz.tsx       # Quiz component
│   ├── CourseRecommendations.tsx # AI recommendations
│   ├── CourseSidebar.tsx    # Course information sidebar
│   ├── CourseSummary.tsx    # Course summary display
│   ├── CourseTabNavigation.tsx # Tab navigation
│   ├── LanguageSelector.tsx # Dubbing language selector
│   ├── MagicalLoader.tsx    # Animated loading component
│   ├── Sidebar.tsx          # Main navigation sidebar
│   ├── TabNavigation.tsx    # General tab navigation
│   ├── UserProfile.tsx      # User profile component
│   └── VideoSection.tsx     # Video player section
├── 📁 contexts/             # React Context providers
│   └── AuthContext.tsx      # Authentication context
├── 📁 data/                 # Static data and mock content
│   ├── loadingStages.ts     # Loading stage definitions
│   └── mockCourse.ts        # Mock course data
├── 📁 lib/                  # Utility functions and API
│   ├── api.ts               # API client functions
│   └── supabaseClient.ts    # Supabase client setup
└── 📁 types/                # TypeScript type definitions
    ├── auth.ts              # Authentication types
    ├── course.ts            # Course-related types
    └── language.ts          # Language and localization types
```

## 🎨 Key Features

### 🤖 AI Tutor Integration
- **Real-time Chat**: Interactive AI tutor powered by Google Gemini
- **Course Context**: AI responses based on specific course content
- **Educational Methodology**: Implements Socratic method for learning
- **Chat History**: Maintains conversation context

### 🎬 Video Dubbing Interface
- **Language Selection**: Support for multiple target languages
- **YouTube Integration**: Direct YouTube URL processing
- **File Upload**: Support for direct video file uploads
- **Progress Tracking**: Real-time dubbing progress updates

### 📚 Course Management
- **Personalized Recommendations**: AI-driven course suggestions
- **Interactive Learning**: Flashcards, quizzes, and summaries
- **Progress Tracking**: User learning analytics
- **Responsive Design**: Mobile-first responsive interface

### 🔐 Authentication
- **Supabase Auth**: Secure user authentication
- **JWT Integration**: Seamless API authentication
- **User Profiles**: Personalized user experience

## 🎨 Design System

### Color Palette
- **Primary**: Cyan (#06B6D4) - Main brand color
- **Background**: Slate grays (#0F172A, #1E293B) - Dark theme
- **Accent**: Green (#10B981) - Success states
- **Warning**: Yellow (#F59E0B) - Attention states
- **Error**: Red (#EF4444) - Error states

### Components
- **Consistent Styling**: All components use Tailwind CSS
- **Dark Theme**: Modern dark interface for reduced eye strain
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and micro-interactions

## 🔌 API Integration

### Backend Endpoints
```typescript
// Course Recommendations
POST /recommend-courses
{
  "user_question": "I want to learn about AI"
}

// AI Tutor Chat
POST /ai-tutor
{
  "user_message": "Explain machine learning",
  "course_id": "course-slug",
  "chat_history": [...]
}

// Video Dubbing
POST /dub
FormData {
  youtube_url: "...",
  target_language: "Hindi",
  lang_code: "hi"
}
```

### Error Handling
- **Graceful Degradation**: Fallbacks for API failures
- **User Feedback**: Clear error messages and retry options
- **Loading States**: Comprehensive loading indicators

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Build the application
bun build

# Vercel CLI deployment
vercel --prod

# Or connect GitHub repo to Vercel dashboard
```

### Netlify
```bash
# Build command
bun build

# Publish directory
out/

# Environment variables: Configure in Netlify dashboard
```

### Docker
```bash
# Build container
docker build -t knewbit-frontend .

# Run container
docker run -p 3000:3000 knewbit-frontend
```

## 🧪 Testing

### Component Testing
```bash
# Install testing dependencies
bun add --dev @testing-library/react @testing-library/jest-dom jest

# Run tests
bun test

# Watch mode
bun test --watch
```

### Type Checking
```bash
# Check TypeScript types
bun run type-check

# Fix TypeScript issues
bun run type-check --watch
```

## 🔧 Development Tips

### Performance Optimization
- **Next.js Image**: Use `next/image` for optimized images
- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: Components load on demand
- **Turbopack**: Faster development builds

### State Management
- **React Context**: For global state (auth, user preferences)
- **Local State**: `useState` for component-specific state
- **Server State**: API responses cached in components

### Styling Best Practices
- **Tailwind Classes**: Utility-first CSS approach
- **Component Isolation**: Styles scoped to components
- **Responsive Design**: Mobile-first breakpoints
- **Dark Theme**: Consistent dark mode implementation

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**:
   ```bash
   # Clear Next.js cache
   rm -rf .next
   bun dev
   ```

2. **Environment Variables**:
   ```bash
   # Ensure variables start with NEXT_PUBLIC_ for client-side
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Supabase Connection**:
   ```bash
   # Check Supabase configuration
   bun run test-supabase
   ```

4. **API Connection Issues**:
   - Verify backend is running on port 8000
   - Check CORS configuration in backend
   - Ensure JWT tokens are properly set

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

## 🤝 Contributing

1. Follow the component structure in `/components`
2. Use TypeScript for all new components
3. Implement responsive design with Tailwind
4. Add proper error handling and loading states
5. Test components thoroughly before submitting PRs

---

**Made with ❤️ using Next.js and React**
