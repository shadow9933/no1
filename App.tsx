
import React, { useState, useRef, useCallback } from 'react';
import { VocabRow, Quiz, Score, Language, Answer } from './types';
import { parseTextToVocabRows, download } from './utils/fileUtils';
import { generateQuiz } from './utils/quizUtils';
import PreviewTable from './components/PreviewTable';
import QuizRunner from './components/QuizRunner';
import { UploadIcon, CreateQuizIcon, LanguageIcon, ParseIcon, QuizIcon, DownloadIcon } from './components/icons';
import { useTranslation } from './utils/translations';
import QuizTypeSelector from './components/QuizTypeSelector';

type QuizType = 'mcq' | 'tf' | 'fill';

const App: React.FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [vocabRows, setVocabRows] = useState<VocabRow[]>([]);
  const [deckTitle, setDeckTitle] = useState<string>('My Vocab Deck');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [score, setScore] = useState<Score>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<Language>('vi');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedQuizTypes, setSelectedQuizTypes] = useState<Set<QuizType>>(new Set(['mcq']));

  const t = useTranslation(language);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
  };

  const handleParseText = useCallback((text: string) => {
    const parsed = parseTextToVocabRows(text);
    setVocabRows(parsed);
    setRawText(text);
    setQuiz(null);
    setScore(null);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleParseText(String(e.target.result || ''));
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const rowsToCSV = (data: VocabRow[]): string => {
    const header = ["word", "ipa", "meaning"];
    const lines = data.map((row) => {
      return `"${row.word.replace(/"/g, '""')}","${row.ipa.replace(/"/g, '""')}","${row.meaning.replace(/"/g, '""')}"`;
    });
    return [header.join(","), ...lines].join("\n");
  };

  const exportCSV = () => {
    const csv = rowsToCSV(vocabRows);
    download(`${deckTitle.replace(/\s+/g, '_')}.csv`, csv, 'text/csv');
  };

  const exportJSON = () => {
    const payload = vocabRows.map(({ word, ipa, meaning }) => ({ word, ipa, meaning }));
    download(`${deckTitle.replace(/\s+/g, '_')}.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const handleCreateQuiz = () => {
    if (vocabRows.length === 0) {
      alert(t('alertAddWords'));
      return;
    }
    if (selectedQuizTypes.size === 0) {
      alert(t('alertSelectQuizType'));
      return;
    }
    const kinds = [...selectedQuizTypes];
    const newQuiz = generateQuiz(vocabRows, kinds, questionCount);
    setQuiz(newQuiz);
    setScore(null);
  };
  
  const handleSubmitAnswers = (answers: Answer[]) => {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, i) => {
      const userAnswer = answers[i];
      if (userAnswer === null || userAnswer === undefined) return;

      switch (q.type) {
        case 'mcq':
          if (userAnswer === q.answer) correct++;
          break;
        case 'tf':
          if ((userAnswer === true) === q.answer) correct++;
          break;
        case 'fill':
          if (String(userAnswer).trim().toLowerCase() === q.answer.trim().toLowerCase()) correct++;
          break;
      }
    });
    setScore({ correct, total: quiz.length });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-6">
          <div>
              <h1 className="text-3xl font-bold text-slate-900">{t('appTitle')}</h1>
              <p className="text-slate-600 mt-1">{t('appSubtitle')}</p>
          </div>
          <button 
              onClick={toggleLanguage} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Toggle Language"
          >
              <LanguageIcon className="w-6 h-6" />
          </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Card */}
        <div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-lg shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="deckTitle" className="block text-sm font-medium text-slate-700 mb-1">{t('deckTitleLabel')}</label>
              <input id="deckTitle" value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="pasteArea" className="block text-sm font-medium text-slate-700 mb-1">{t('pasteListLabel')}</label>
              <p className="text-xs text-slate-500 mb-2">{t('pasteListHelper')}</p>
              <textarea id="pasteArea" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={8} className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={t('pasteListPlaceholder')} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <input type="file" accept=".csv,.txt,.tsv" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50">
                <UploadIcon className="w-5 h-5" />
                {t('uploadFileButton')}
              </button>
              <button onClick={() => handleParseText(rawText)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
                <ParseIcon className="w-5 h-5" />
                {t('analyzeButton')}
              </button>
            </div>
             <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <button onClick={exportCSV} disabled={vocabRows.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon className="w-5 h-5" />
                    {t('exportCSVButton')}
                </button>
                <button onClick={exportJSON} disabled={vocabRows.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon className="w-5 h-5" />
                    {t('exportJSONButton')}
                </button>
              </div>
          </div>
        </div>
        
        {/* Right Column: Preview Card */}
        <div className="lg:col-span-1">
            <PreviewTable rows={vocabRows} t={t} />
        </div>
      </main>

      {/* Quiz Creation Card */}
      <div className="mt-6 bg-white p-4 sm:p-6 border border-slate-200 rounded-lg shadow-sm">
        <div className="space-y-4">
            <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 mb-1">{t('numQuestionsLabel')}</label>
                <div className="flex items-center gap-2">
                    <input id="numQuestions" type="number" value={questionCount} onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, Number(e.target.value))))} className="w-24 p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="1" max="20" />
                    <span className="text-sm text-slate-500">{t('questionCountMax')}</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('questionTypeLabel')}</label>
                <QuizTypeSelector selected={selectedQuizTypes} onChange={setSelectedQuizTypes} vocabRowCount={vocabRows.length} t={t} />
            </div>
            <button onClick={handleCreateQuiz} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
              disabled={vocabRows.length === 0 || selectedQuizTypes.size === 0}
            >
                <CreateQuizIcon className="w-5 h-5" />
                {t('createQuizButton')}
            </button>
        </div>
      </div>

      <section className="mt-6">
        {quiz ? (
          <QuizRunner quiz={quiz} onSubmit={handleSubmitAnswers} score={score} onReset={() => setScore(null)} t={t}/>
        ) : (
          <div className="text-center py-10 px-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <QuizIcon className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">{t('quizPlaceholderTitle')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('quizPlaceholderSubtitle')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
