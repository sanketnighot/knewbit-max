"use client";

import { ActiveTab, CourseContent } from "@/types/course";
import { useState } from "react";
import ChatInterface from "./ChatInterface";
import CourseSummary from "./CourseSummary";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";
import Sidebar from "./Sidebar";
import TabNavigation from "./TabNavigation";
import VideoSection from "./VideoSection";

interface CourseDisplayProps {
  courseData: CourseContent;
  prompt: string;
}

export default function CourseDisplay({
  courseData,
  prompt,
}: CourseDisplayProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                <span className="text-cyan-400">Knewbit Max</span> Course
              </h1>
              <p className="text-slate-400">
                Your personalized learning experience is ready!
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl px-6 py-3 border border-slate-700/50">
              <div className="text-sm text-slate-400">Generated from:</div>
              <div className="text-cyan-400 font-medium">"{prompt}"</div>
            </div>
          </div>

          {/* Video Section - Always Visible */}
          <VideoSection courseData={courseData} />

          {/* Tab Navigation - Below video */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "summary" && (
              <CourseSummary courseData={courseData} />
            )}
            {activeTab === "flashcards" && (
              <Flashcards courseData={courseData} />
            )}
            {activeTab === "quiz" && <Quiz courseData={courseData} />}
            {activeTab === "chat" && (
              <ChatInterface
                courseDetails={{
                  ...({} as any), // Cast to bypass type checking for legacy course
                  id: "legacy-course",
                  title: courseData.title,
                  slug: "legacy-course",
                  description: courseData.summary,
                  summary: courseData.summary,
                }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar courseData={courseData} />
          </div>
        </div>
      </div>
    </div>
  );
}
