export interface CourseContent {
  title: string;
  video_url: string;
  summary: string;
  flashcards: Array<{
    id?: string;
    question: string;
    answer: string;
  }>;
  quiz: Array<{
    id?: string;
    question: string;
    type: "multiple_choice" | "true_false";
    options?: string[];
    correct_answer: string | boolean;
    explanation?: string;
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
