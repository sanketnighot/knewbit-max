"use client";

import { CourseContent } from "@/types/course";
import { CourseDetail } from "@/types/language";
import Quiz from "./Quiz";

interface CourseQuizProps {
  courseDetails: CourseDetail;
}

export default function CourseQuiz({ courseDetails }: CourseQuizProps) {
  // Transform course quiz data to match existing Quiz component format
  const transformedCourseData: CourseContent = {
    title: courseDetails.title,
    summary: courseDetails.summary || courseDetails.description || "",
    video_url: courseDetails.youtube_url,
    flashcards: [], // Not used in Quiz component
    quiz:
      courseDetails.quizzes?.map((quiz, index) => {
        if (quiz.quiz_type === "multiple_choice") {
          return {
            id: index.toString(),
            question: quiz.question_text,
            type: "multiple_choice" as const,
            options: quiz.options?.map((opt) => opt.text) || [],
            correct_answer:
              quiz.options?.find(
                (opt) => opt.option_id === quiz.correct_option_id
              )?.text || "",
            explanation:
              quiz.explanation_for_correct_answer || quiz.explanation || "",
          };
        } else if (quiz.quiz_type === "True_False") {
          return {
            id: index.toString(),
            question: quiz.question_text,
            type: "true_false" as const,
            options: ["True", "False"],
            correct_answer: quiz.correct_answer === true ? "True" : "False",
            explanation:
              quiz.explanation_for_correct_answer || quiz.explanation || "",
          };
        } else {
          // Fallback for other quiz types
          return {
            id: index.toString(),
            question: quiz.question_text,
            type: "multiple_choice" as const,
            options: quiz.options?.map((opt) => opt.text) || ["True", "False"],
            correct_answer:
              quiz.options?.find(
                (opt) => opt.option_id === quiz.correct_option_id
              )?.text || "True",
            explanation:
              quiz.explanation_for_correct_answer || quiz.explanation || "",
          };
        }
      }) || [],
  };

  if (!courseDetails.quizzes || courseDetails.quizzes.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-white mb-2">No Quiz Available</h3>
        <p className="text-slate-400">This course doesn't have a quiz yet.</p>
      </div>
    );
  }

  return <Quiz courseData={transformedCourseData} />;
}
