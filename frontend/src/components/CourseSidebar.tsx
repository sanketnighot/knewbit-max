import { CourseDetail } from "@/types/language";

interface CourseSidebarProps {
  courseDetails: CourseDetail;
}

export default function CourseSidebar({ courseDetails }: CourseSidebarProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Course Info */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Course Information
        </h3>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Instructor</div>
            <div className="text-white font-medium">
              {courseDetails.instructor_name}
            </div>
          </div>

          {courseDetails.estimated_duration && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Duration</div>
              <div className="text-white">
                {formatDuration(courseDetails.estimated_duration)}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-slate-400 mb-1">Difficulty</div>
            <div className="text-white capitalize">
              {courseDetails.difficulty_level}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-1">Category</div>
            <div className="text-white">{courseDetails.category_name}</div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-1">Status</div>
            <div className="text-white capitalize">{courseDetails.status}</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {courseDetails.tags && courseDetails.tags.length > 0 && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {courseDetails.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-cyan-400/10 text-cyan-300 rounded-full text-sm border border-cyan-400/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
