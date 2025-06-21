"use client";

import { AuthModal } from "@/components/AuthModal";
import CourseDisplay from "@/components/CourseDisplay";
import { CoursePage } from "@/components/CoursePage";
import { CourseRecommendations } from "@/components/CourseRecommendations";
import { LanguageSelector } from "@/components/LanguageSelector";
import MagicalLoader from "@/components/MagicalLoader";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { createMockCourseData } from "@/data/mockCourse";
import { recommendCourses } from "@/lib/api";
import { CourseContent } from "@/types/course";
import { Language, RecommendedCourse } from "@/types/language";
import { KeyboardEvent, useState } from "react";

export default function Home() {
  const { session, knewbitUser, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [courseData, setCourseData] = useState<CourseContent | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>(
    []
  );
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(
    null
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<
    "home" | "recommendations" | "course" | "legacy-course"
  >("home");

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

    try {
      setIsLoadingRecommendations(true);
      console.log("Getting course recommendations for:", prompt);

      const response = await recommendCourses(prompt);
      console.log("✅ Recommendations received:", response);

      setRecommendations(response.recommendations);
      setCurrentView("recommendations");
    } catch (error) {
      console.error("❌ Failed to get recommendations:", error);

      // Show specific error messages to user
      if (error instanceof Error) {
        if (error.message.includes("Authentication required")) {
          setShowAuthModal(true);
          return;
        } else if (error.message.includes("Network error")) {
          alert(
            "❌ Cannot connect to server. Please make sure the backend is running on http://localhost:8000"
          );
          return;
        } else if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          alert("❌ Authentication failed. Please try signing in again.");
          setShowAuthModal(true);
          return;
        } else {
          alert(`❌ Error: ${error.message}`);
        }
      }

      // Only fall back to legacy mode if user explicitly wants to continue
      const shouldFallback = confirm(
        "Would you like to try the legacy course generation instead?"
      );
      if (shouldFallback) {
        setIsLoading(true);
        setTimeout(() => {
          const mockCourseData = createMockCourseData();
          setCourseData(mockCourseData);
          setCurrentView("legacy-course");
          setIsLoading(false);
        }, 3000);
      }
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleCourseSelect = (courseSlug: string) => {
    setSelectedCourseSlug(courseSlug);
    setCurrentView("course");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setRecommendations([]);
    setSelectedCourseSlug(null);
    setPrompt("");
    setSelectedLanguage(null);
  };

  const handleBackToRecommendations = () => {
    setCurrentView("recommendations");
    setSelectedCourseSlug(null);
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

  // Show course page when a course is selected
  if (currentView === "course" && selectedCourseSlug) {
    return (
      <CoursePage
        courseSlug={selectedCourseSlug}
        selectedLanguage={selectedLanguage}
        onBack={handleBackToRecommendations}
      />
    );
  }

  // Show legacy course display when course data is available
  if (currentView === "legacy-course" && courseData) {
    return <CourseDisplay courseData={courseData} prompt={prompt} />;
  }

  // Show magical loader when loading legacy course
  if (isLoading) {
    return <MagicalLoader prompt={prompt} />;
  }

  // Main landing page
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:64px_64px]"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
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
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <UserProfile onSignInClick={() => setShowAuthModal(true)} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8 sm:px-8 sm:py-12">
        {/* Show course recommendations if available */}
        {currentView === "recommendations" && (
          <div className="w-full">
            <div className="text-center mb-8">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-400/50 rounded-lg transition-all duration-300 backdrop-blur-sm mb-6"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-slate-300">New Search</span>
              </button>
            </div>
            <CourseRecommendations
              recommendations={recommendations}
              selectedLanguage={selectedLanguage}
              onCourseSelect={handleCourseSelect}
              isLoading={isLoadingRecommendations}
            />
          </div>
        )}

        {/* Show main search interface when on home view */}
        {currentView === "home" && (
          <>
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in pt-16 sm:pt-0">
              <div className="mb-6 sm:mb-8">
                <div className="relative inline-block">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-2 tracking-tight relative">
                    Knewbit
                    <span className="ml-1 sm:ml-2 relative animated-max-letters">
                      Max
                    </span>
                  </h1>
                  {/* Glowing effect */}
                  <div className="absolute -inset-1 bg-cyan-400/20 blur-xl rounded-full opacity-30"></div>
                </div>
                <div className="flex items-center justify-center space-x-2 mt-3 sm:mt-4">
                  <div className="w-8 sm:w-12 h-0.5 bg-cyan-400"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-8 sm:w-12 h-0.5 bg-cyan-400"></div>
                </div>
              </div>

              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 px-4">
                The Future of{" "}
                <span className="text-cyan-400 font-semibold relative">
                  AI-Powered Learning
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400/30 block"></span>
                </span>
              </p>

              <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
                Transform your learning journey with personalized courses
                crafted by advanced AI, tailored specifically to your goals,
                pace, and learning style
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-slate-500 px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>AI-Generated Courses</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  <span>Personalized Learning</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
                  <span>Interactive Support</span>
                </div>
              </div>
            </div>

            {/* Main Input Section */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-0">
              <div className="relative group">
                {/* Enhanced border glow */}
                <div className="absolute -inset-0.5 bg-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-cyan-400/10 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl group-hover:border-cyan-400/30 transition-colors duration-300">
                  <div className="p-6 sm:p-8 lg:p-10">
                    {/* Enhanced header */}
                    <div className="mb-6 sm:mb-8 text-center">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        What do you want to master today?
                      </h2>
                      <div className="w-16 h-0.5 bg-cyan-400 mx-auto rounded-full"></div>
                      {!knewbitUser && (
                        <p className="text-sm text-slate-400 mt-4 px-2">
                          <span className="inline-flex items-center px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-md text-xs font-medium">
                            Sign in required
                          </span>{" "}
                          to get personalized course recommendations
                        </p>
                      )}
                    </div>

                    <div className="mb-6 sm:mb-8">
                      <div className="relative">
                        <textarea
                          id="learning-prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Describe your learning goals in detail...
e.g., 'I want to become a DevOps engineer, focusing on containerization with Docker, orchestration with Kubernetes, and CI/CD pipelines with Jenkins.'"
                          className="w-full h-32 sm:h-40 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-base sm:text-lg bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 resize-none placeholder-slate-500 text-slate-200 font-medium leading-relaxed backdrop-blur-sm group-hover:bg-slate-800/70"
                          disabled={isLoading || isLoadingRecommendations}
                          maxLength={500}
                        />

                        {/* Enhanced character count */}
                        <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 flex items-center space-x-2">
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

                    {/* Language Selector */}
                    <div className="mb-6 sm:mb-8">
                      <LanguageSelector
                        selectedLanguage={selectedLanguage}
                        onLanguageSelect={setSelectedLanguage}
                      />
                    </div>

                    {/* Enhanced controls */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                      <div className="hidden sm:flex items-center justify-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-2">
                          <kbd className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-600 rounded-md shadow-sm">
                            Enter
                          </kbd>
                          <span>
                            {knewbitUser ? "Get Recommendations" : "Sign In"}
                          </span>
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
                        disabled={
                          !prompt.trim() ||
                          isLoading ||
                          isLoadingRecommendations
                        }
                        className="group relative w-full sm:w-auto sm:mx-auto px-8 sm:px-10 py-3 sm:py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 hover:shadow-2xl sm:min-w-[200px]"
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative flex items-center justify-center space-x-3">
                          {isLoadingRecommendations ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm sm:text-base">
                                Finding Courses...
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm sm:text-base">
                                {knewbitUser
                                  ? "Get Course Recommendations"
                                  : "Sign In to Get Recommendations"}
                              </span>
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-200"
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
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enhanced Feature Section - only show on home view */}
        {currentView === "home" && (
          <div className="mt-16 sm:mt-20 lg:mt-24 w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Why Choose Knewbit Max?
              </h2>
              <div className="w-20 h-0.5 bg-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: "🤖",
                  title: "AI Course Recommendations",
                  description:
                    "Intelligent course matching based on your learning goals and preferences. Get personalized recommendations in seconds.",
                  color: "cyan",
                  delay: "0",
                },
                {
                  icon: "🎤",
                  title: "Multi-Language Dubbing",
                  description:
                    "Learn in your preferred language with AI-powered video dubbing in 11+ Indian languages including Hindi, Tamil, and more.",
                  color: "blue",
                  delay: "200",
                },
                {
                  icon: "🎯",
                  title: "Personalized Learning",
                  description:
                    "Adaptive course paths that adjust to your skill level and learning style for maximum effectiveness.",
                  color: "purple",
                  delay: "400",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                      <span className="text-2xl sm:text-3xl">
                        {feature.icon}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-400 transition-colors duration-300 text-center sm:text-left">
                      {feature.title}
                    </h3>

                    <p className="text-slate-400 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[
                { number: "500+", label: "Courses Available", color: "cyan" },
                { number: "11+", label: "Languages Supported", color: "green" },
                {
                  number: "AI",
                  label: "Powered Recommendations",
                  color: "blue",
                },
                { number: "24/7", label: "Learning Support", color: "purple" },
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider px-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
