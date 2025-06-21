import { LoadingStage } from "@/types/course";

export const loadingStages: LoadingStage[] = [
  {
    stage: "Getting Data",
    message: "🔍 Getting user data...",
    submessage: "Collecting and processing user information",
    progress: 10,
    duration: 2000,
  },
  {
    stage: "Analyzing",
    message: "🧠 Analyzing user data and preferences...",
    submessage: "Processing learning patterns",
    progress: 20,
    duration: 2000,
  },
  {
    stage: "Personalizing",
    message: "👤 Creating personalized user persona...",
    submessage: "Building your unique learning profile",
    progress: 30,
    duration: 2000,
  },
  {
    stage: "Fetching",
    message: "🎥 Fetching relevant educational videos...",
    submessage: "Finding optimal video content",
    progress: 40,
    duration: 2000,
  },
  {
    stage: "Analyzing Content",
    message: "📊 Analyzing video content and structure...",
    submessage: "Processing educational materials",
    progress: 50,
    duration: 2000,
  },
  {
    stage: "Planning",
    message: "📝 Creating personalized course plan...",
    submessage: "Structuring your learning path",
    progress: 60,
    duration: 2000,
  },
  {
    stage: "Generating",
    message: "⚡ Generating customized course content...",
    submessage: "Building interactive materials",
    progress: 70,
    duration: 2000,
  },
  {
    stage: "Quality Check",
    message: "🔬 Analyzing generated course quality...",
    submessage: "Ensuring learning effectiveness",
    progress: 80,
    duration: 2000,
  },
  {
    stage: "Optimizing",
    message: "✨ Making final optimizations...",
    submessage: "Fine-tuning course elements",
    progress: 90,
    duration: 2000,
  },
  {
    stage: "Complete",
    message: "✅ Course generation complete!",
    submessage: "Ready for your learning journey",
    progress: 100,
    duration: 2000,
  },
];

export const aiThoughts = [
  "🔍 Getting user data...",
  "🧠 Analyzing user data and preferences...",
  "👤 Creating personalized user persona...",
  "🎥 Fetching relevant educational videos...",
  "📊 Analyzing video content and structure...",
  "📝 Creating personalized course plan...",
  "⚡ Generating customized course content...",
  "🔬 Analyzing generated course quality...",
  "✨ Making final optimizations...",
  "✅ Course generation complete!",
];
