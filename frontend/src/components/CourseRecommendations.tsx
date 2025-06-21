"use client";

import { Language, RecommendedCourse } from "@/types/language";

interface CourseRecommendationsProps {
  recommendations: RecommendedCourse[];
  selectedLanguage: Language | null;
  onCourseSelect: (courseSlug: string) => void;
  isLoading?: boolean;
}

export const CourseRecommendations = ({
  recommendations,
  selectedLanguage,
  onCourseSelect,
  isLoading = false,
}: CourseRecommendationsProps) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-400/20 rounded-full mb-4">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Finding Perfect Courses
            </h3>
            <p className="text-slate-400">
              AI is analyzing your learning goals...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
              <span className="text-2xl">🤔</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-slate-400">
              Try refining your learning goals or check back later for new
              courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Recommended Courses
          </h3>
          <div className="w-20 h-0.5 bg-cyan-400 mx-auto rounded-full mb-4"></div>
          {selectedLanguage ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Will be dubbed in {selectedLanguage.name}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Original video language</span>
            </div>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((course, index) => (
            <div
              key={course.id}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              onClick={() => onCourseSelect(course.slug)}
            >
              {/* Course Number Badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                    {course.title}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
                      Why This Course?
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                      {course.reason}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Click to view course
                    </span>
                    <div className="flex items-center space-x-1 text-cyan-400 group-hover:translate-x-1 transition-transform duration-200">
                      <span className="text-sm font-medium">
                        Start Learning
                      </span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-cyan-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Courses are personalized based on your learning goals and
            preferences
          </p>
        </div>
      </div>
    </div>
  );
};
