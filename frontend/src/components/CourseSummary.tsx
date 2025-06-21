import { CourseContent } from "@/types/course";

interface CourseSummaryProps {
  courseData: CourseContent;
}

export default function CourseSummary({ courseData }: CourseSummaryProps) {
  return (
    <div className="space-y-8">
      {/* Course Summary */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
          Course Summary
        </h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed">{courseData.summary}</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
          What You'll Learn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
            <p className="text-slate-300">Containerization with Docker</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
            <p className="text-slate-300">Kubernetes orchestration</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
            <p className="text-slate-300">CI/CD pipeline setup</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
            <p className="text-slate-300">Infrastructure as Code</p>
          </div>
        </div>
      </div>

      {/* Course Prerequisites */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
          Prerequisites
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-slate-300">Basic command line knowledge</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-slate-300">
              Understanding of software development
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">~</span>
            </div>
            <p className="text-slate-300">
              Basic Linux/Unix knowledge (helpful)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
