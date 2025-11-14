
import React, { useState, useEffect } from 'react';
import { Quiz, Score, Answer, QuizQuestion, MCQQuestion } from '../types';
import { download } from '../utils/fileUtils';
import { TranslationKey } from '../utils/translations';

interface QuizRunnerProps {
  quiz: Quiz;
  onSubmit: (answers: Answer[]) => void;
  score: Score;
  onReset: () => void;
  t: (key: TranslationKey) => string;
}

const getAnswerStatus = (question: QuizQuestion, answer: Answer, showResults: boolean): 'correct' | 'incorrect' | 'unanswered' | 'neutral' => {
  if (!showResults) return 'neutral';
  if (answer === null || answer === undefined || answer === '') return 'unanswered';

  switch (question.type) {
    case 'mcq':
      return answer === question.answer ? 'correct' : 'incorrect';
    case 'fill':
      return (String(answer) || "").trim().toLowerCase() === (question.answer || "").trim().toLowerCase() ? 'correct' : 'incorrect';
    default:
      return 'neutral';
  }
};

const QuestionCard: React.FC<{
  question: QuizQuestion;
  index: number;
  userAnswer: Answer;
  onAnswer: (index: number, value: Answer) => void;
  status: 'correct' | 'incorrect' | 'unanswered' | 'neutral';
  t: (key: TranslationKey) => string;
}> = ({ question, index, userAnswer, onAnswer, status, t }) => {
  
  const baseClasses = "p-4 rounded-lg transition-colors";
  const statusClasses = {
    correct: "bg-green-50 border-green-200",
    incorrect: "bg-red-50 border-red-200",
    unanswered: "bg-yellow-50 border-yellow-200",
    neutral: "bg-white border-slate-200"
  };

  const renderAnswer = () => {
    if (status !== 'correct' && status !== 'incorrect') return null;

    let correctAnswerText = '';
    if (question.type === 'mcq' || question.type === 'fill') {
        correctAnswerText = question.answer;
    }

    return (
        <div className={`mt-2 text-sm font-medium ${status === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
            {status === 'correct' ? t('correctMessage') : `${t('incorrectMessagePrefix')}: ${correctAnswerText}`}
        </div>
    );
  }

  return (
    <li className={`${baseClasses} ${statusClasses[status]} border`}>
      <p className="font-semibold text-slate-800">
        <span className="font-bold">{index + 1}.</span> {question.question}
      </p>
      
      {question.type === 'mcq' && (
        <div className="mt-2 space-y-2">
          {(question as MCQQuestion).options.map((option, i) => (
            <label key={i} className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-slate-100 ${userAnswer === option ? 'bg-slate-200' : ''}`}>
              <input
                type="radio"
                name={`q_${index}`}
                checked={userAnswer === option}
                onChange={() => onAnswer(index, option)}
                disabled={status !== 'neutral'}
                className="form-radio h-4 w-4 text-slate-600"
              />
              <span className="ml-3 text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'fill' && (
        <div className="mt-2">
          <input
            type="text"
            value={(userAnswer as string) || ''}
            onChange={(e) => onAnswer(index, e.target.value)}
            disabled={status !== 'neutral'}
            placeholder={t('fillPlaceholder')}
            className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>
      )}
      {renderAnswer()}
    </li>
  );
};


const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onSubmit, score, onReset, t }) => {
  const [answers, setAnswers] = useState<Answer[]>(Array(quiz.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setAnswers(Array(quiz.length).fill(null));
    setShowResults(false);
  }, [quiz]);

  const handleSetAnswer = (index: number, value: Answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  const handleSubmit = () => {
    onSubmit(answers);
    setShowResults(true);
  }

  const handleRestart = () => {
      setAnswers(Array(quiz.length).fill(null));
      setShowResults(false);
      onReset();
  }

  const handleExportQuiz = () => {
      download('quiz.json', JSON.stringify(quiz, null, 2), 'application/json');
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">{t('quizTitle')} ({quiz.length} {t('questionsSuffix')})</h3>
        {score && (
          <div className="text-lg font-bold bg-slate-100 text-slate-800 px-4 py-2 rounded-full">
            {t('scoreLabel')}: {score.correct} / {score.total}
          </div>
        )}
      </div>

      <ol className="space-y-4">
        {quiz.map((q, i) => (
          <QuestionCard 
            key={i}
            index={i}
            question={q}
            userAnswer={answers[i]}
            onAnswer={handleSetAnswer}
            status={getAnswerStatus(q, answers[i], showResults)}
            t={t}
          />
        ))}
      </ol>
      
      <div className="mt-6 flex flex-wrap gap-3">
        {!showResults ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {t('submitButton')}
          </button>
        ) : (
          <button
            onClick={handleRestart}
            className="px-6 py-2 rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            {t('retakeButton')}
          </button>
        )}
        <button
          onClick={handleExportQuiz}
          className="px-6 py-2 rounded-md bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
        >
          {t('exportQuizButton')}
        </button>
      </div>
    </div>
  );
};

export default QuizRunner;
