
import { Quiz, QuizQuestion, VocabRow, MCQQuestion, FillQuestion } from '../types';

type QuizType = 'mcq' | 'fill';

function generateMCQ(rows: VocabRow[], itemIndex: number, choices: number = 4): MCQQuestion {
  const correctRow = rows[itemIndex];
  const correctMeaning = correctRow.meaning;

  const pool = rows
    .filter((_, i) => i !== itemIndex && rows[i].meaning && rows[i].meaning !== correctMeaning)
    .map(r => r.meaning);

  const shuffledPool = [...new Set(pool)].sort(() => Math.random() - 0.5);
  const distractors = shuffledPool.slice(0, Math.max(0, choices - 1));
  const options = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);

  return {
    type: 'mcq',
    question: correctRow.word,
    options,
    answer: correctMeaning
  };
}

function generateFill(rows: VocabRow[], itemIndex: number): FillQuestion {
  const correctRow = rows[itemIndex];
  return {
    type: 'fill',
    question: correctRow.word,
    answer: correctRow.meaning
  };
}

export function generateQuiz(rows: VocabRow[], kinds: QuizType[], count: number = 10): Quiz {
  if (rows.length === 0 || kinds.length === 0) return [];

  const quizCandidates = rows
    .map((row, index) => ({ row, index }))
    .filter(item => item.row.word && item.row.meaning);

  if (quizCandidates.length === 0) return [];
  
  // Filter out quiz types that don't meet minimum requirements
  const availableKinds = kinds.filter(kind => {
      if (kind === 'mcq' && quizCandidates.length < 4) return false;
      return true;
  });

  if (availableKinds.length === 0) return [];

  const n = Math.min(count, quizCandidates.length);
  const selectedItems = [...quizCandidates]
    .sort(() => Math.random() - 0.5)
    .slice(0, n);

  const quiz: Quiz = selectedItems.map((item) => {
    const originalIndex = item.index;
    const randomKind = availableKinds[Math.floor(Math.random() * availableKinds.length)];

    switch (randomKind) {
      case 'mcq':
        return generateMCQ(rows, originalIndex);
      case 'fill':
        return generateFill(rows, originalIndex);
      default:
        // Fallback, should not be reached
        return generateFill(rows, originalIndex);
    }
  });

  return quiz;
}
