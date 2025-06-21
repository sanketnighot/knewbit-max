"use client";

import { CourseDetail } from "@/types/language";

interface CourseSummaryContentProps {
  courseDetails: CourseDetail;
}

export default function CourseSummaryContent({
  courseDetails,
}: CourseSummaryContentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Course Summary */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
          Course Summary
        </h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed">
            {courseDetails.description || courseDetails.summary}
          </p>
        </div>
      </div>

      {/* Learning Outcomes */}
      {courseDetails.core_educational_takeaways &&
        courseDetails.core_educational_takeaways.length > 0 && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {courseDetails.core_educational_takeaways.map(
                (takeaway, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{takeaway}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* Key Concepts */}
      {courseDetails.key_concepts && courseDetails.key_concepts.length > 0 && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
            Key Concepts
          </h3>
          <div className="space-y-4">
            {courseDetails.key_concepts.map((concept, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-lg p-4 sm:p-6 border border-slate-700/30"
              >
                <h4 className="text-lg font-bold text-cyan-400 mb-3">
                  {concept.concept}
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {concept.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Facts & Figures */}
      {courseDetails.important_facts_figures &&
        courseDetails.important_facts_figures.length > 0 && (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
              Important Facts & Figures
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {courseDetails.important_facts_figures.map((fact, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 sm:p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-slate-300 text-sm sm:text-base">
                    {fact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Lecture Transcript */}
      {courseDetails.lecture_script && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
            Lecture Transcript
          </h3>
          <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 max-h-64 sm:max-h-96 overflow-y-auto">
            <pre className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {courseDetails.lecture_script}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
