import { ActiveTab } from "@/types/course";

interface CourseTabNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const tabs = [
  { id: "summary", label: "Overview", icon: "📚" },
  { id: "flashcards", label: "Study Cards", icon: "🃏" },
  { id: "quiz", label: "Quiz", icon: "📝" },
  { id: "chat", label: "AI Tutor", icon: "💬" },
] as const;

export default function CourseTabNavigation({
  activeTab,
  setActiveTab,
}: CourseTabNavigationProps) {
  return (
    <div className="flex flex-wrap gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 mb-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as ActiveTab)}
          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-cyan-500 text-slate-900"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <span className="text-sm sm:text-base">{tab.icon}</span>
          <span className="text-sm sm:text-base">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
