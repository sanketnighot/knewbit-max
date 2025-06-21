import { ActiveTab } from "@/types/course";

interface TabNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const tabs = [
  { id: "summary", label: "Course Summary", icon: "📚" },
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "quiz", label: "Quiz", icon: "📝" },
  { id: "chat", label: "AI Tutor", icon: "💬" },
] as const;

export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as ActiveTab)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-cyan-500 text-slate-900"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
