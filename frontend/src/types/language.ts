export interface Language {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "bn-IN", name: "Bengali" },
  { code: "gu-IN", name: "Gujarati" },
  { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" },
  { code: "mr-IN", name: "Marathi" },
  { code: "od-IN", name: "Odia" },
  { code: "pa-IN", name: "Punjabi" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
];

export interface RecommendedCourse {
  id: string;
  title: string;
  slug: string;
  reason: string;
}

export interface CourseRecommendationResponse {
  recommendations: RecommendedCourse[];
}

export interface QuizOption {
  text: string;
  option_id: string;
}

export interface Quiz {
  options?: QuizOption[];
  quiz_type: string;
  question_text: string;
  correct_option_id?: string;
  correct_answer?: boolean;
  explanation_for_correct_answer?: string;
  explanation?: string;
  feedback_for_incorrect_options?: Record<string, string>;
}

export interface QuestionAnswer {
  question_text: string;
  question_type: string;
  feedback_guidelines: string;
  ideal_answer_points: string[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string;
  category_name: string;
  category_slug: string;
  difficulty_level: string;
  estimated_duration: number;
  is_free: boolean;
  price: number;
  status: string;
  is_featured: boolean;
  tags: string[];
  instructor_name: string;
  view_count: number;
  enrollment_count: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  is_enrolled: boolean;
  identified_speakers: string[];
  lecture_script: string;
  key_concepts: Array<Record<string, string>>;
  important_facts_figures: string[];
  core_educational_takeaways: string[];
  visual_elements_described: string[];
  questions_and_answers: QuestionAnswer[];
  quizzes: Quiz[];
  quiz_user_response: Array<string | boolean>;
}
