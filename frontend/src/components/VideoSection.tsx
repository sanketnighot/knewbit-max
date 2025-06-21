import { CourseContent } from "@/types/course";

interface VideoSectionProps {
  courseData: CourseContent;
}

export default function VideoSection({ courseData }: VideoSectionProps) {
  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="mb-8">
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden max-w-4xl mx-auto">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-1">
            {courseData.title}
          </h2>
          <p className="text-slate-400 text-sm">
            Master the concepts with this comprehensive video
          </p>
        </div>
        <div className="aspect-video">
          {getYouTubeVideoId(courseData.video_url) ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                courseData.video_url
              )}`}
              title="Course Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🎥</div>
                <p className="text-slate-400">Video will load here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
