
import React from 'react';
import { Quiz, Score, Answer } from '../types';
import QuizRunner from './QuizRunner';
import { TranslationKey } from '../utils/translations';
import { ChevronLeftIcon } from './icons';

interface QuizViewProps {
  quiz: Quiz;
  onSubmit: (answers: Answer[]) => void;
  score: Score;
  onReset: () => void;
  onBackToDeck: () => void;
  t: (key: TranslationKey) => string;
}

const QuizView: React.FC<QuizViewProps> = (props) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={props.onBackToDeck}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {props.t('backToDeck')}
        </button>
      </div>
      <div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-lg shadow-sm">
        <QuizRunner
          quiz={props.quiz}
          onSubmit={props.onSubmit}
          score={props.score}
          onReset={props.onReset}
          t={props.t}
        />
      </div>
    </div>
  );
};

export default QuizView;
