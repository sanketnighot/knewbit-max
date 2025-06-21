"use client";

import { dubVideo, getCourseDetails } from "@/lib/api";
import { ActiveTab } from "@/types/course";
import { CourseDetail, Language } from "@/types/language";
import { useEffect, useRef, useState } from "react";
import ChatInterface from "./ChatInterface";
import CourseFlashcards from "./CourseFlashcards";
import CourseQuiz from "./CourseQuiz";
import CourseSidebar from "./CourseSidebar";
import CourseSummaryContent from "./CourseSummaryContent";
import CourseTabNavigation from "./CourseTabNavigation";

interface CoursePageProps {
  courseSlug: string;
  selectedLanguage: Language | null;
  onBack: () => void;
}

export const CoursePage = ({
  courseSlug,
  selectedLanguage,
  onBack,
}: CoursePageProps) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [dubbedVideoUrl, setDubbedVideoUrl] = useState<string | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isDubbingVideo, setIsDubbingVideo] = useState(false);
  const [dubbingError, setDubbingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");

  // Track the last dubbing request to prevent duplicates
  const lastDubbingRequest = useRef<string | null>(null);
  const dubbingAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoadingCourse(true);
        const details = await getCourseDetails(courseSlug);
        setCourseDetails(details);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setIsLoadingCourse(false);
      }
    };

    loadCourse();
  }, [courseSlug]);

  // Separate effect for video dubbing to prevent unnecessary re-runs
  useEffect(() => {
    if (!courseDetails?.youtube_url || !selectedLanguage) {
      return;
    }

    // Create request identifier
    const requestId = `${courseDetails.youtube_url}_${selectedLanguage.name}_${selectedLanguage.code}`;

    // Skip if same request is already processed or in progress
    if (lastDubbingRequest.current === requestId) {
      console.log("Skipping duplicate dubbing request:", requestId);
      return;
    }

    // Cancel any ongoing dubbing request
    if (dubbingAbortController.current) {
      dubbingAbortController.current.abort();
    }

    handleVideoDubbing(courseDetails.youtube_url, requestId);
  }, [courseDetails?.youtube_url, selectedLanguage]);

  const handleVideoDubbing = async (youtubeUrl: string, requestId: string) => {
    if (!selectedLanguage) return;

    try {
      // Create new abort controller for this request
      dubbingAbortController.current = new AbortController();

      setIsDubbingVideo(true);
      setDubbingError(null);
      setDubbedVideoUrl(null); // Clear previous video

      // Mark this request as being processed
      lastDubbingRequest.current = requestId;

      console.log("Starting video dubbing:", requestId);

      const videoBlob = await dubVideo(
        youtubeUrl,
        selectedLanguage.name,
        selectedLanguage.code
      );

      // Check if request was aborted
      if (dubbingAbortController.current?.signal.aborted) {
        console.log("Dubbing request was aborted");
        return;
      }

      const videoUrl = URL.createObjectURL(videoBlob);
      setDubbedVideoUrl(videoUrl);
      console.log("Video dubbing completed successfully:", requestId);
    } catch (error) {
      // Don't show error if request was aborted
      if (dubbingAbortController.current?.signal.aborted) {
        console.log("Dubbing request was aborted");
        return;
      }

      console.error("Failed to dub video:", error);
      setDubbingError(
        error instanceof Error ? error.message : "Failed to dub video"
      );
    } finally {
      setIsDubbingVideo(false);
      dubbingAbortController.current = null;
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup video URL to prevent memory leaks
      if (dubbedVideoUrl) {
        URL.revokeObjectURL(dubbedVideoUrl);
      }
      // Abort any ongoing requests
      if (dubbingAbortController.current) {
        dubbingAbortController.current.abort();
      }
    };
  }, [dubbedVideoUrl]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-400 bg-green-400/20";
      case "intermediate":
        return "text-yellow-400 bg-yellow-400/20";
      case "advanced":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/20";
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Course not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-cyan-400 text-slate-900 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:64px_64px]"></div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-400/50 rounded-lg transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
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
          <span className="text-slate-300 hidden sm:inline">
            Back to Recommendations
          </span>
          <span className="text-slate-300 sm:hidden">Back</span>
        </button>
      </div>

      <div className="relative z-10 pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Course Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <span className="px-2 sm:px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs sm:text-sm">
                {courseDetails.category_name}
              </span>
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(
                  courseDetails.difficulty_level
                )}`}
              >
                {courseDetails.difficulty_level}
              </span>
              {courseDetails.is_free ? (
                <span className="px-2 sm:px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-xs sm:text-sm font-medium">
                  Free
                </span>
              ) : (
                <span className="px-2 sm:px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-xs sm:text-sm font-medium">
                  ${courseDetails.price}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
              {courseDetails.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 sm:mb-6 leading-relaxed">
              {courseDetails.description || courseDetails.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span>{courseDetails.enrollment_count} students</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>
                  {courseDetails.average_rating}/5 ({courseDetails.review_count}{" "}
                  reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              {isDubbingVideo ? (
                <div className="aspect-video flex items-center justify-center bg-slate-800">
                  <div className="text-center p-4">
                    <div className="w-8 sm:w-12 h-8 sm:h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Creating Dubbed Version
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400">
                      Generating {selectedLanguage?.name} audio...
                    </p>
                  </div>
                </div>
              ) : dubbingError ? (
                <div className="aspect-video flex items-center justify-center bg-slate-800">
                  <div className="text-center max-w-md px-4 sm:px-6">
                    <div className="text-3xl sm:text-4xl mb-4">⚠️</div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Dubbing Failed
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-4">
                      {dubbingError}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Showing original video instead
                    </p>
                  </div>
                </div>
              ) : dubbedVideoUrl ? (
                <div className="relative">
                  <video
                    controls
                    className="w-full aspect-video"
                    src={dubbedVideoUrl}
                  />
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 bg-cyan-400/90 text-slate-900 rounded-full text-xs sm:text-sm font-medium">
                    Dubbed in {selectedLanguage?.name}
                  </div>
                </div>
              ) : courseDetails.youtube_video_id ? (
                <div className="relative">
                  <iframe
                    className="w-full aspect-video"
                    src={`https://www.youtube.com/embed/${courseDetails.youtube_video_id}`}
                    title={courseDetails.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 bg-slate-800/90 text-slate-300 rounded-full text-xs sm:text-sm">
                    Original Language
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-slate-800">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-4">📹</div>
                    <p className="text-sm sm:text-base text-slate-400">
                      No video available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <CourseTabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === "summary" && (
                <CourseSummaryContent courseDetails={courseDetails} />
              )}
              {activeTab === "flashcards" && (
                <CourseFlashcards courseDetails={courseDetails} />
              )}
              {activeTab === "quiz" && (
                <CourseQuiz courseDetails={courseDetails} />
              )}
              {activeTab === "chat" && <ChatInterface />}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CourseSidebar courseDetails={courseDetails} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
