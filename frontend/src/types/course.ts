export interface CourseContent {
  title: string;
  video_url: string;
  summary: string;
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
  quiz: Array<{
    question: string;
    type: "multiple_choice" | "true_false";
    options?: string[];
    correct_answer: string | boolean;
  }>;
}

export interface LoadingStage {
  stage: string;
  message: string;
  submessage: string;
  progress: number;
  duration: number;
}

export interface ChatMessage {
  role: "user" | "ai";
  message: string;
}

export type ActiveTab = "summary" | "flashcards" | "quiz" | "chat";
