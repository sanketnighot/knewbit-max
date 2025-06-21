"use client";

import { CourseContent } from "@/types/course";
import { CourseDetail } from "@/types/language";
import Flashcards from "./Flashcards";

interface CourseFlashcardsProps {
  courseDetails: CourseDetail;
}

export default function CourseFlashcards({
  courseDetails,
}: CourseFlashcardsProps) {
  // Transform study questions to flashcards format
  const transformedCourseData: CourseContent = {
    title: courseDetails.title,
    summary: courseDetails.summary || courseDetails.description || "",
    video_url: courseDetails.youtube_url,
    quiz: [], // Not used in Flashcards component
    flashcards:
      courseDetails.questions_and_answers?.map((qa, index) => ({
        id: index.toString(),
        question: qa.question_text,
        answer:
          qa.ideal_answer_points?.length > 0
            ? qa.ideal_answer_points
                .map((point, idx) => `${idx + 1}. ${point}`)
                .join("\n\n")
            : "Answer guidelines: " +
              (qa.feedback_guidelines ||
                "Review the course content to understand this concept better."),
      })) || [],
  };

  if (
    !courseDetails.questions_and_answers ||
    courseDetails.questions_and_answers.length === 0
  ) {
    return (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="text-4xl mb-4">🃏</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Study Cards Available
        </h3>
        <p className="text-slate-400">
          This course doesn't have study cards yet.
        </p>
      </div>
    );
  }

  return <Flashcards courseData={transformedCourseData} />;
}
