export const DEFAULT_QUESTIONS = 3;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

export type Role = "interviewer" | "candidate";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface QuestionFeedback {
  question: string;
  score: number;
  feedback: string;
  keyPoints: string[];
  exampleAnswer: string;
}

export interface Evaluation {
  overallScore: number;
  summary: string;
  questions: QuestionFeedback[];
  strengths: string[];
  improvements: string[];
}

export interface InterviewRequest {
  jobDescription: string;
  totalQuestions: number;
  history: ChatMessage[];
}

export type InterviewResponse =
  | { type: "question"; questionNumber: number; content: string }
  | { type: "evaluation"; evaluation: Evaluation };
