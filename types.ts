import { translations } from './utils/translations';

export interface VocabRow {
  word: string;
  ipa: string;
  meaning: string;
}

export interface Deck {
  id: string;
  title: string;
  rows: VocabRow[];
  targetLanguage: TargetLanguage;
  ipa: 'us' | 'uk' | 'pinyin';
}

export interface DialogueLine {
  character: string;
  text: string;
  transcription: string;
  meaning: string;
}

export interface MCQQuestion {
  type: 'mcq';
  question: string;
  options: string[];
  answer: string;
}

export interface FillQuestion {
  type: 'fill';
  question: string;
  answer: string;
}

export type QuizQuestion = MCQQuestion | FillQuestion;
export type Quiz = QuizQuestion[];
export type Score = { correct: number; total: number } | null;
export type Answer = string | null;
export type Language = keyof typeof translations;
export type TargetLanguage = 'en' | 'zh';
