import React, { useState } from 'react';
import { Deck } from '../types';
import { TranslationKey } from '../utils/translations';
import Accordion from './Accordion';
import { SparklesIcon, DownloadIcon, SpinnerIcon, EyeIcon } from './icons';
import QuizTypeSelector from './QuizTypeSelector';

type QuizType = 'mcq' | 'fill';

interface DeckViewProps {
  deck: Deck;
  t: (key: TranslationKey) => string;
  onCreateQuiz: (quizTypes: Set<QuizType>, qCount: number) => void;
  onGenerateDialogue: (thinkingMode: boolean) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  hasQuiz: boolean;
  hasDialogue: boolean;
  onViewQuiz: () => void;
  onViewDialogue: () => void;
}

const DeckView: React.FC<DeckViewProps> = ({
  deck,
  t,
  onCreateQuiz,
  onGenerateDialogue,
  onExportCSV,
  onExportJSON,
  hasQuiz,
  hasDialogue,
  onViewQuiz,
  onViewDialogue,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedQuizTypes, setSelectedQuizTypes] = useState<Set<QuizType>>(new Set(['mcq']));
  const [useThinkingMode, setUseThinkingMode] = useState<boolean>(false);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState<boolean>(false);

  const handleGenerateDialogueClick = () => {
      setIsGeneratingDialogue(true);
      onGenerateDialogue(useThinkingMode);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">{deck.title}</h2>
        <p className="text-slate-500">{deck.rows.length} {t('itemsSuffix')}</p>
        
        <Accordion title={t('contentGenTitle')} defaultOpen>
          <div className="space-y-4">
            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 mb-1">{t('numQuestionsLabel')}</label>
              <div className="flex items-center gap-2">
                <input id="numQuestions" type="number" value={questionCount} onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, Number(e.target.value))))} className="w-24 p-2 border rounded-md bg-white text-slate-900 border-slate-300" min="1" max="20" />
                <span className="text-sm text-slate-500">{t('questionCountMax')}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('questionTypeLabel')}</label>
              <QuizTypeSelector selected={selectedQuizTypes} onChange={setSelectedQuizTypes} vocabRowCount={deck.rows.length} t={t} />
            </div>
             <div className="pt-4 border-t border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={useThinkingMode} onChange={(e) => setUseThinkingMode(e.target.checked)} className="h-4 w-4 mt-0.5 rounded bg-white border-slate-400 text-blue-600 focus:ring-blue-500"/>
                    <div>
                        <span className="font-medium text-slate-800">{t('thinkingModeLabel')}</span>
                        <p className="text-xs text-slate-500">{t('thinkingModeHelper')}</p>
                    </div>
                </label>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <button onClick={() => onCreateQuiz(selectedQuizTypes, questionCount)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50" disabled={deck.rows.length === 0 || selectedQuizTypes.size === 0}>
                  <SparklesIcon className="w-5 h-5" />
                  {t('createQuizButton')}
                </button>
                {hasQuiz && (
                   <button onClick={onViewQuiz} title={t('viewQuizButton')} className="flex-shrink-0 p-2.5 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50">
                     <EyeIcon className="w-5 h-5" />
                   </button>
                )}
              </div>
               <div className="flex items-center gap-2">
                <button onClick={handleGenerateDialogueClick} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50" disabled={deck.rows.length === 0 || isGeneratingDialogue}>
                  {isGeneratingDialogue ? <SpinnerIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5" />}
                  {isGeneratingDialogue ? t('generatingMessage') : t('generateDialogueButton')}
                </button>
                 {hasDialogue && (
                   <button onClick={onViewDialogue} title={t('viewDialogueButton')} className="flex-shrink-0 p-2.5 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50">
                     <EyeIcon className="w-5 h-5" />
                   </button>
                )}
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title={t('exportTitle')}>
          <div className="flex flex-wrap gap-2">
            <button onClick={onExportCSV} disabled={deck.rows.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50 disabled:opacity-50">
              <DownloadIcon className="w-5 h-5" />
              {t('exportCSVButton')}
            </button>
            <button onClick={onExportJSON} disabled={deck.rows.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50 disabled:opacity-50">
              <DownloadIcon className="w-5 h-5" />
              {t('exportJSONButton')}
            </button>
          </div>
        </Accordion>
      </div>

      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deck.rows.map((row, i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800">{row.word}</h3>
              {row.ipa && <p className="text-lg text-slate-500 mt-1">[{row.ipa}]</p>}
              <p className="text-xl text-slate-700 mt-4">{row.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckView;