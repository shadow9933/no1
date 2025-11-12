import { translations } from './utils/translations';

export interface VocabRow {
  word: string;
  ipa: string;
  meaning: string;
}

export interface MCQQuestion {
  type: 'mcq';
  question: string;
  options: string[];
  answer: string;
}

export interface TFQuestion {
  type: 'tf';
  question: string;
  meaning: string;
  answer: boolean;
}

export interface FillQuestion {
  type: 'fill';
  question: string;
  answer: string;
}

export type QuizQuestion = MCQQuestion | TFQuestion | FillQuestion;
export type Quiz = QuizQuestion[];
export type Score = { correct: number; total: number } | null;
export type Answer = string | boolean | null;
export type Language = keyof typeof translations;
