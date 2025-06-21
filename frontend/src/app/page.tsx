"use client";

import { AuthModal } from "@/components/AuthModal";
import CourseDisplay from "@/components/CourseDisplay";
import MagicalLoader from "@/components/MagicalLoader";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { createMockCourseData } from "@/data/mockCourse";
import { CourseContent } from "@/types/course";
import { KeyboardEvent, useState } from "react";

export default function Home() {
  const { session, knewbitUser, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState<CourseContent | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    // Check if user is authenticated
    if (!session || !knewbitUser) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    console.log("Learning prompt:", prompt);

    // Simulate the actual course generation process
    setTimeout(() => {
      const mockCourseData = createMockCourseData();
      setCourseData(mockCourseData);
      setIsLoading(false);
    }, 17000); // Total duration based on loading stages
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show course display when course data is available
  if (courseData) {
    return <CourseDisplay courseData={courseData} prompt={prompt} />;
  }

  // Show magical loader when loading
  if (isLoading) {
    return <MagicalLoader prompt={prompt} />;
  }

  // Main landing page
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300 opacity-40"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-700 opacity-50"></div>
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000 opacity-30"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-500 opacity-40"></div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Header with User Profile / Sign In */}
      <div className="absolute top-8 right-8 z-20">
        <UserProfile onSignInClick={() => setShowAuthModal(true)} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="mb-8">
            <div className="relative inline-block">
              <h1 className="text-7xl md:text-8xl font-black text-white mb-2 tracking-tight relative">
                Knewbit
                <span className="text-cyan-400 ml-2">Max</span>
              </h1>
              {/* Glowing effect */}
              <div className="absolute -inset-1 bg-cyan-400/20 blur-xl rounded-full opacity-30"></div>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-12 h-0.5 bg-cyan-400"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-12 h-0.5 bg-cyan-400"></div>
            </div>
          </div>

          <p className="text-2xl md:text-3xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed mb-6">
            The Future of{" "}
            <span className="text-cyan-400 font-semibold relative">
              AI-Powered Learning
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400/30 block"></span>
            </span>
          </p>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Transform your learning journey with personalized courses crafted by
            advanced AI, tailored specifically to your goals, pace, and learning
            style
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI-Generated Courses</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <span>Personalized Learning</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
              <span>Interactive Support</span>
            </div>
          </div>
        </div>

        {/* Main Input Section */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative group">
            {/* Enhanced border glow */}
            <div className="absolute -inset-0.5 bg-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-cyan-400/10 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl group-hover:border-cyan-400/30 transition-colors duration-300">
              <div className="p-10">
                {/* Enhanced header */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What do you want to master today?
                  </h2>
                  <div className="w-16 h-0.5 bg-cyan-400 mx-auto rounded-full"></div>
                  {!knewbitUser && (
                    <p className="text-sm text-slate-400 mt-4">
                      <span className="inline-flex items-center px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-md text-xs font-medium">
                        Sign in required
                      </span>{" "}
                      to generate personalized courses
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <div className="relative">
                    <textarea
                      id="learning-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe your learning goals in detail...
e.g., 'I want to become a DevOps engineer, focusing on containerization with Docker, orchestration with Kubernetes, and CI/CD pipelines with Jenkins.'"
                      className="w-full h-40 px-8 py-6 text-lg bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 resize-none placeholder-slate-500 text-slate-200 font-medium leading-relaxed backdrop-blur-sm group-hover:bg-slate-800/70"
                      disabled={isLoading}
                      maxLength={500}
                    />

                    {/* Enhanced character count */}
                    <div className="absolute bottom-4 right-6 flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          prompt.length > 400
                            ? "bg-red-400"
                            : prompt.length > 200
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        }`}
                      ></div>
                      <span className="text-xs text-slate-400 font-mono">
                        {prompt.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-600 rounded-md shadow-sm">
                        Enter
                      </kbd>
                      <span>{knewbitUser ? "Generate Course" : "Sign In"}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-600"></div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-600 rounded-md shadow-sm">
                        Shift + Enter
                      </kbd>
                      <span>New Line</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isLoading}
                    className="group relative px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 hover:shadow-2xl min-w-[200px]"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center justify-center space-x-3">
                      <span>
                        {knewbitUser
                          ? "Generate Course"
                          : "Sign In to Generate Course"}
                      </span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Feature Section */}
        <div className="mt-24 w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Knewbit Max?
            </h2>
            <div className="w-20 h-0.5 bg-cyan-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "Advanced AI Engine",
                description:
                  "Next-generation machine learning algorithms analyze your preferences and create perfectly tailored learning experiences",
                color: "cyan",
                delay: "0",
              },
              {
                icon: "⚡",
                title: "Lightning Fast Generation",
                description:
                  "From prompt to complete course structure in under 10 seconds. No waiting, just instant personalized learning",
                color: "blue",
                delay: "200",
              },
              {
                icon: "🎯",
                title: "Adaptive Learning Path",
                description:
                  "Dynamic course adjustment based on your progress, ensuring optimal challenge level and maximum retention",
                color: "purple",
                delay: "400",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10k+", label: "Courses Generated", color: "cyan" },
              { number: "95%", label: "Success Rate", color: "green" },
              { number: "24/7", label: "AI Support", color: "blue" },
              { number: "< 10s", label: "Generation Time", color: "purple" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Custom scrollbar */
        textarea::-webkit-scrollbar {
          width: 6px;
        }

        textarea::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.4);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.6);
        }

        /* Enhanced kbd styling */
        kbd {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(100, 116, 139, 0.3) inset,
            0 2px 4px rgba(0, 0, 0, 0.2);
          color: #cbd5e1;
        }

        /* Magical loader animations */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
