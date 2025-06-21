"use client";

import { CourseContent } from "@/types/course";
import { useState } from "react";

interface QuizProps {
  courseData: CourseContent;
}

export default function Quiz({ courseData }: QuizProps) {
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, any>>({});
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizAnswer = (answer: any) => {
    setQuizAnswers((prev) => ({ ...prev, [currentQuizQuestion]: answer }));
    setShowQuizFeedback(true);
  };

  const nextQuizQuestion = () => {
    if (currentQuizQuestion < courseData.quiz.length - 1) {
      setCurrentQuizQuestion((prev) => prev + 1);
      setShowQuizFeedback(false);
    } else {
      // Calculate final score
      let correct = 0;
      courseData.quiz.forEach((question, index) => {
        if (quizAnswers[index] === question.correct_answer) {
          correct++;
        }
      });
      setQuizScore(Math.round((correct / courseData.quiz.length) * 100));
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizQuestion(0);
    setQuizAnswers({});
    setShowQuizFeedback(false);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  if (quizCompleted) {
    return (
      <div className="text-center space-y-8">
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-12">
          <div className="text-6xl mb-6">
            {quizScore >= 80 ? "🎉" : quizScore >= 60 ? "👍" : "📚"}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
          <div className="text-6xl font-black mb-4">
            <span
              className={
                quizScore >= 80
                  ? "text-green-400"
                  : quizScore >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {quizScore}%
            </span>
          </div>
          <p className="text-slate-400 mb-8">
            You got{" "}
            {
              Object.values(quizAnswers).filter(
                (answer, index) =>
                  answer === courseData.quiz[index].correct_answer
              ).length
            }{" "}
            out of {courseData.quiz.length} questions correct
          </p>

          <div
            className={`p-6 rounded-xl mb-8 ${
              quizScore >= 80
                ? "bg-green-500/10 border border-green-400/30"
                : quizScore >= 60
                ? "bg-yellow-500/10 border border-yellow-400/30"
                : "bg-red-500/10 border border-red-400/30"
            }`}
          >
            <p
              className={`font-semibold ${
                quizScore >= 80
                  ? "text-green-400"
                  : quizScore >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {quizScore >= 80
                ? "Excellent work!"
                : quizScore >= 60
                ? "Good job!"
                : "Keep studying!"}
            </p>
            <p className="text-slate-300 text-sm mt-2">
              {quizScore >= 80
                ? "You have a strong understanding of the material."
                : quizScore >= 60
                ? "You understand most concepts. Review the areas you missed."
                : "Consider reviewing the video and flashcards before retaking the quiz."}
            </p>
          </div>

          <button
            onClick={resetQuiz}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = courseData.quiz[currentQuizQuestion];

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Knowledge Quiz</h2>
        <p className="text-slate-400">
          Question {currentQuizQuestion + 1} of {courseData.quiz.length}
        </p>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
          <div
            className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentQuizQuestion + 1) / courseData.quiz.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
        <h3 className="text-xl font-semibold text-white mb-8">
          {currentQuestion?.question}
        </h3>

        {/* Multiple Choice */}
        {currentQuestion?.type === "multiple_choice" &&
          currentQuestion?.options && (
            <div className="space-y-4">
              {currentQuestion.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={showQuizFeedback}
                  className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
                    quizAnswers[currentQuizQuestion] === option
                      ? showQuizFeedback
                        ? option === currentQuestion.correct_answer
                          ? "bg-green-500/20 border-green-400 text-green-400"
                          : "bg-red-500/20 border-red-400 text-red-400"
                        : "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                      : showQuizFeedback &&
                        option === currentQuestion.correct_answer
                      ? "bg-green-500/20 border-green-400 text-green-400"
                      : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                  } ${showQuizFeedback ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        quizAnswers[currentQuizQuestion] === option
                          ? "border-current"
                          : "border-slate-500"
                      }`}
                    >
                      {quizAnswers[currentQuizQuestion] === option && (
                        <div className="w-2 h-2 bg-current rounded-full m-0.5" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                    {showQuizFeedback &&
                      option === currentQuestion.correct_answer && (
                        <span className="ml-auto text-green-400">✓</span>
                      )}
                    {showQuizFeedback &&
                      quizAnswers[currentQuizQuestion] === option &&
                      option !== currentQuestion.correct_answer && (
                        <span className="ml-auto text-red-400">✗</span>
                      )}
                  </div>
                </button>
              ))}
            </div>
          )}

        {/* True/False */}
        {currentQuestion?.type === "true_false" && (
          <div className="space-y-4">
            {[true, false].map((option) => (
              <button
                key={option.toString()}
                onClick={() => handleQuizAnswer(option)}
                disabled={showQuizFeedback}
                className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
                  quizAnswers[currentQuizQuestion] === option
                    ? showQuizFeedback
                      ? option === currentQuestion.correct_answer
                        ? "bg-green-500/20 border-green-400 text-green-400"
                        : "bg-red-500/20 border-red-400 text-red-400"
                      : "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                    : showQuizFeedback &&
                      option === currentQuestion.correct_answer
                    ? "bg-green-500/20 border-green-400 text-green-400"
                    : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                } ${showQuizFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      quizAnswers[currentQuizQuestion] === option
                        ? "border-current"
                        : "border-slate-500"
                    }`}
                  >
                    {quizAnswers[currentQuizQuestion] === option && (
                      <div className="w-2 h-2 bg-current rounded-full m-0.5" />
                    )}
                  </div>
                  <span className="font-medium">
                    {option ? "True" : "False"}
                  </span>
                  {showQuizFeedback &&
                    option === currentQuestion.correct_answer && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  {showQuizFeedback &&
                    quizAnswers[currentQuizQuestion] === option &&
                    option !== currentQuestion.correct_answer && (
                      <span className="ml-auto text-red-400">✗</span>
                    )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {showQuizFeedback && (
          <div className="mt-8 p-6 rounded-xl bg-slate-800/50 border border-slate-600">
            <div
              className={`flex items-start space-x-3 ${
                quizAnswers[currentQuizQuestion] ===
                currentQuestion.correct_answer
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 border-2 border-current">
                {quizAnswers[currentQuizQuestion] ===
                currentQuestion.correct_answer
                  ? "✓"
                  : "✗"}
              </div>
              <div>
                <p className="font-semibold mb-2">
                  {quizAnswers[currentQuizQuestion] ===
                  currentQuestion.correct_answer
                    ? "Correct!"
                    : "Incorrect"}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {quizAnswers[currentQuizQuestion] ===
                  currentQuestion.correct_answer
                    ? "Great job! You understand this concept well."
                    : `The correct answer is "${currentQuestion.correct_answer}". Review the video content for more details on this topic.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {showQuizFeedback && (
          <div className="mt-6 text-center">
            <button
              onClick={nextQuizQuestion}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              {currentQuizQuestion < courseData.quiz.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
