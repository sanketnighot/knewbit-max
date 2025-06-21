"use client";

import { CourseContent } from "@/types/course";
import { useState } from "react";

interface FlashcardsProps {
  courseData: CourseContent;
}

export default function Flashcards({ courseData }: FlashcardsProps) {
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlashcardFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowFlashcardAnswer(!showFlashcardAnswer);
      setIsFlipping(false);
    }, 150);
  };

  const nextCard = () => {
    setCurrentFlashcard(
      Math.min(courseData.flashcards.length - 1, currentFlashcard + 1)
    );
    setShowFlashcardAnswer(false);
  };

  const prevCard = () => {
    setCurrentFlashcard(Math.max(0, currentFlashcard - 1));
    setShowFlashcardAnswer(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Interactive Flashcards
        </h2>
        <p className="text-slate-400">
          Card {currentFlashcard + 1} of {courseData.flashcards.length}
        </p>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div
          className={`bg-slate-900/50 rounded-2xl border ${
            showFlashcardAnswer ? "border-green-400/30" : "border-slate-700/50"
          } p-12 min-h-[350px] flex items-center justify-center cursor-pointer transform transition-all duration-500 hover:scale-105 ${
            isFlipping ? "animate-pulse pointer-events-none" : ""
          }`}
          onClick={handleFlashcardFlip}
        >
          <div className="text-center">
            {!showFlashcardAnswer ? (
              <>
                <div className="text-lg text-cyan-400 mb-6 flex items-center justify-center">
                  <span className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></span>
                  Question
                </div>
                <p className="text-xl text-white font-medium leading-relaxed">
                  {courseData.flashcards[currentFlashcard]?.question}
                </p>
                <div className="mt-8 flex items-center justify-center space-x-2 text-slate-400">
                  <span className="text-sm">Click to reveal answer</span>
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg text-green-400 mb-6 flex items-center justify-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                  Answer
                </div>
                <p className="text-xl text-white font-medium leading-relaxed">
                  {courseData.flashcards[currentFlashcard]?.answer}
                </p>
                <div className="mt-8 flex items-center justify-center space-x-2 text-slate-400">
                  <span className="text-sm">Click to see question</span>
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevCard}
          disabled={currentFlashcard === 0}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
        >
          ← Previous
        </button>

        <div className="flex space-x-2">
          {courseData.flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentFlashcard ? "bg-cyan-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          disabled={currentFlashcard === courseData.flashcards.length - 1}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
