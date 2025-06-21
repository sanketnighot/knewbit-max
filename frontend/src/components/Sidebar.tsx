import { CourseContent } from "@/types/course";

interface SidebarProps {
  courseData: CourseContent;
}

export default function Sidebar({ courseData }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Course Progress */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Video Watched</span>
            <span className="text-cyan-400">45%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-cyan-400 h-2 rounded-full"
              style={{ width: "45%" }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Flashcards Reviewed</span>
            <span className="text-green-400">12/20</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-green-400 h-2 rounded-full"
              style={{ width: "60%" }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Quiz Score</span>
            <span className="text-purple-400">Not taken</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Course Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Duration</span>
            <span className="text-white">24m 31s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Difficulty</span>
            <span className="text-yellow-400">Intermediate</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Flashcards</span>
            <span className="text-white">{courseData.flashcards.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quiz Questions</span>
            <span className="text-white">{courseData.quiz.length}</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-cyan-400 mr-2">🤖</span>
          AI Recommendations
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-slate-300">
              Focus on the Docker concepts around 8:30 - you might want to
              rewatch that section.
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-slate-300">
              Try the flashcards for Kubernetes networking - it's a common pain
              point.
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-slate-300">
              Great progress! Consider taking the quiz to test your
              understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
