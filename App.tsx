import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { VocabRow, Quiz, Score, Language, Answer, DialogueLine, TargetLanguage, Deck } from './types';
import { parseTextToVocabRows, download } from './utils/fileUtils';
import { generateQuiz } from './utils/quizUtils';
import { LanguageIcon, SpinnerIcon, HomeIcon } from './components/icons';
import { useTranslation } from './utils/translations';

import LanguageSelectionView from './components/LanguageSelectionView';
import HomeView from './components/HomeView';
import DeckView from './components/DeckView';
import QuizView from './components/QuizView';
import DialogueView from './components/DialogueView';
import DeckListView from './components/DeckListView';


type View = 'deck-list' | 'language-select' | 'home' | 'deck' | 'quiz' | 'dialogue';
type QuizType = 'mcq' | 'fill';

const APP_STORAGE_KEY = 'vocabQuizMakerDecks';

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [score, setScore] = useState<Score>(null);
  const [uiLanguage, setUiLanguage] = useState<Language>('en');
  const [generatedDialogue, setGeneratedDialogue] = useState<DialogueLine[] | null>(null);
  const [dialogueTitle, setDialogueTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('deck-list');
  const [newDeckTargetLanguage, setNewDeckTargetLanguage] = useState<TargetLanguage | null>(null);
  
  const t = useTranslation(uiLanguage);

  // Load decks from localStorage on initial render
  useEffect(() => {
    try {
      const savedDecks = localStorage.getItem(APP_STORAGE_KEY);
      if (savedDecks) {
        setDecks(JSON.parse(savedDecks));
      }
    } catch (error) {
      console.error("Failed to load decks from localStorage", error);
    }
  }, []);

  // Save decks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
      console.error("Failed to save decks to localStorage", error);
    }
  }, [decks]);

  const currentDeck = decks.find(d => d.id === currentDeckId) || null;

  const toggleLanguage = () => {
    setUiLanguage(prev => prev === 'vi' ? 'en' : 'vi');
  };
  
  const handleGoToDeckList = () => {
    setCurrentDeckId(null);
    setQuiz(null);
    setScore(null);
    setGeneratedDialogue(null);
    setDialogueTitle('');
    setNewDeckTargetLanguage(null);
    setCurrentView('deck-list');
  };

  const handleGoToDeck = () => {
    setScore(null);
    setCurrentView('deck');
  };

  const handleCreateNew = () => {
    setNewDeckTargetLanguage(null);
    setCurrentView('language-select');
  };

  const handleSelectDeck = (deckId: string) => {
    setCurrentDeckId(deckId);
    // Reset any generated content from other decks
    setQuiz(null);
    setScore(null);
    setGeneratedDialogue(null);
    setDialogueTitle('');
    setCurrentView('deck');
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
    if (currentDeckId === deckId) {
      handleGoToDeckList();
    }
  };
  
  const handleViewQuiz = () => {
    setCurrentView('quiz');
  };

  const handleViewDialogue = () => {
    setCurrentView('dialogue');
  };

  const handleSelectTargetLanguage = (lang: TargetLanguage) => {
    setNewDeckTargetLanguage(lang);
    setCurrentView('home');
  };

  const handleParseAndAnalyze = useCallback(async (
    text: string, 
    title: string, 
    ipa: 'us' | 'uk' | 'pinyin', 
    thinkingMode: boolean,
    targetLanguage: TargetLanguage
  ) => {
    setQuiz(null);
    setScore(null);
    
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
      return;
    }
    
    const isSingleColumn = lines.every(line => !line.includes('\t') && !line.includes(','));
    let newRows: VocabRow[] = [];

    if (isSingleColumn) {
      setIsAnalyzing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const uiTargetLanguage = uiLanguage === 'vi' ? 'Vietnamese' : 'English';
        const wordsList = lines.join(', ');

        let transcriptionType: string;
        if (targetLanguage === 'zh') {
            transcriptionType = 'Chinese Pinyin transcription (with tone marks)';
        } else {
            transcriptionType = ipa === 'uk' ? 'British English IPA transcription' : 'American English IPA transcription';
        }

        const prompt = `For the following list of words, provide their ${transcriptionType} and their meaning in ${uiTargetLanguage}. Return the result as a valid JSON array of objects, where each object has the keys "word", "ipa", and "meaning". The words are: ${wordsList}`;

        const responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              ipa: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
            required: ['word', 'ipa', 'meaning'],
          },
        };

        const model = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        const config: any = {
          responseMimeType: "application/json",
          responseSchema,
        };
        if (thinkingMode) {
          config.thinkingConfig = { thinkingBudget: 32768 };
        }
        
        const response = await ai.models.generateContent({ model, contents: prompt, config });
        
        newRows = JSON.parse(response.text);

      } catch (error) {
        console.error("Error analyzing words with AI:", error);
        alert(t('errorAnalyzing'));
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      newRows = parseTextToVocabRows(text);
    }
    
    if (newRows.length > 0) {
      const newDeck: Deck = {
        id: Date.now().toString(),
        title,
        rows: newRows,
        targetLanguage,
        ipa: ipa,
      };
      setDecks(prev => [...prev, newDeck]);
      setCurrentDeckId(newDeck.id);
      setCurrentView('deck');
    }

  }, [uiLanguage, t]);
  
  const exportCSV = () => {
    if (!currentDeck) return;
    const header = ["word", "ipa", "meaning"];
    const lines = currentDeck.rows.map((row) => `"${row.word.replace(/"/g, '""')}","${row.ipa.replace(/"/g, '""')}","${row.meaning.replace(/"/g, '""')}"`);
    const csv = [header.join(","), ...lines].join("\n");
    download(`${currentDeck.title.replace(/\s+/g, '_')}.csv`, csv, 'text/csv');
  };

  const exportJSON = () => {
    if (!currentDeck) return;
    const payload = currentDeck.rows.map(({ word, ipa, meaning }) => ({ word, ipa, meaning }));
    download(`${currentDeck.title.replace(/\s+/g, '_')}.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const handleCreateQuiz = (quizTypes: Set<QuizType>, qCount: number) => {
    if (!currentDeck) return;
    const newQuiz = generateQuiz(currentDeck.rows, [...quizTypes], qCount);
    setQuiz(newQuiz);
    setScore(null);
    setCurrentView('quiz');
  };
  
  const handleSubmitAnswers = (answers: Answer[]) => {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q, i) => {
      const userAnswer = answers[i];
      if (userAnswer === null || userAnswer === undefined) return;
      if (q.type === 'mcq' && userAnswer === q.answer) correct++;
      if (q.type === 'fill' && String(userAnswer).trim().toLowerCase() === q.answer.trim().toLowerCase()) correct++;
    });
    setScore({ correct, total: quiz.length });
  };
  
  const handleGenerateDialogue = async (thinkingMode: boolean) => {
    if (!currentDeck) return;
    const wordsForContext = currentDeck.rows.filter(row => row.word && row.meaning);
    if (wordsForContext.length === 0) {
        alert(t('alertNoMeaningsForAI'));
        return;
    }
    setIsGenerating(true);
    setGeneratedDialogue(null);
    setDialogueTitle('');
    setCurrentView('dialogue');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const model = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

        const vocabContext = wordsForContext.map(r => `${r.word} (meaning: ${r.meaning})`).join('; ');
        const uiTargetLanguage = uiLanguage === 'vi' ? 'Vietnamese' : 'English';
        
        const isChinese = currentDeck.targetLanguage === 'zh';
        
        const dialogueLanguage = isChinese ? 'Chinese' : 'English';
        const transcriptionType = isChinese 
            ? 'Pinyin transcription (with tone marks)' 
            : (currentDeck.ipa === 'us' ? 'American English IPA transcription' : 'British English IPA transcription');
        
        const exampleText = isChinese ? '你好' : 'Hello';
        const exampleTranscription = isChinese ? 'nǐ hǎo' : '/həˈloʊ/';
        const exampleMeaning = isChinese ? 'Hello' : (uiLanguage === 'vi' ? 'Xin chào' : 'Greeting');
        const exampleLine = `{ "character": "A", "text": "${exampleText}", "transcription": "${exampleTranscription}", "meaning": "${exampleMeaning}" }`;

        const prompt = `You are an expert language teacher creating learning materials.
Task: Create a short, natural dialogue in ${dialogueLanguage} between two speakers (e.g., A and B).
Vocabulary to include: You MUST use the following ${dialogueLanguage} words in the dialogue: ${vocabContext}.
Output format: The dialogue must be returned as a single, valid JSON object that adheres to the provided schema. Each line of dialogue must have the ${dialogueLanguage} text, the correct ${transcriptionType}, and a translation into ${uiTargetLanguage}.
Example of a line: ${exampleLine}
Do not include any text or explanations outside of the JSON object.`;
        
        const dialogueSchemaProperties = {
            character: { type: Type.STRING, description: "The speaker, e.g., 'A' or 'B'." },
            text: { type: Type.STRING, description: `The dialogue line in ${dialogueLanguage}.` },
            transcription: { type: Type.STRING, description: `The ${transcriptionType}.` },
            meaning: { type: Type.STRING, description: `The translation of the dialogue line into ${uiTargetLanguage}.` },
        };
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: `A short, creative title for the dialogue in ${uiTargetLanguage}.` },
                dialogue: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: dialogueSchemaProperties,
                        required: ['character', 'text', 'transcription', 'meaning'],
                    }
                }
            },
            required: ['title', 'dialogue'],
        };

        const config: any = { responseMimeType: "application/json", responseSchema };
        if (thinkingMode) {
          config.thinkingConfig = { thinkingBudget: 32768 };
        }

        const response = await ai.models.generateContent({ model, contents: prompt, config });
        const parsedResponse = JSON.parse(response.text);

        if (parsedResponse.title && parsedResponse.dialogue) {
            setDialogueTitle(parsedResponse.title);
            setGeneratedDialogue(parsedResponse.dialogue);
        } else {
            throw new Error("Invalid JSON structure from AI.");
        }

    } catch (error) {
        console.error("Error generating dialogue:", error);
        setGeneratedDialogue([]);
        setDialogueTitle(t('errorGenerating'));
    } finally {
        setIsGenerating(false);
    }
  };


  const renderView = () => {
    switch(currentView) {
      case 'deck':
        return currentDeck ? <DeckView
          deck={currentDeck}
          t={t}
          onCreateQuiz={handleCreateQuiz}
          onGenerateDialogue={handleGenerateDialogue}
          onExportCSV={exportCSV}
          onExportJSON={exportJSON}
          hasQuiz={!!quiz}
          hasDialogue={!!generatedDialogue}
          onViewQuiz={handleViewQuiz}
          onViewDialogue={handleViewDialogue}
        /> : null;
      case 'quiz':
        return quiz ? <QuizView
          quiz={quiz}
          onSubmit={handleSubmitAnswers}
          score={score}
          onReset={() => setScore(null)}
          onBackToDeck={handleGoToDeck}
          t={t}
        /> : null;
      case 'dialogue':
        return <DialogueView
          title={dialogueTitle}
          dialogue={generatedDialogue}
          isLoading={isGenerating}
          onBackToDeck={handleGoToDeck}
          t={t}
        />;
      case 'home':
        return newDeckTargetLanguage ? <HomeView
          onAnalyze={handleParseAndAnalyze}
          isAnalyzing={isAnalyzing}
          t={t}
          targetLanguage={newDeckTargetLanguage}
        /> : null;
      case 'language-select':
        return <LanguageSelectionView onSelect={handleSelectTargetLanguage} t={t} />;
      case 'deck-list':
      default:
        return <DeckListView
          decks={decks}
          onSelectDeck={handleSelectDeck}
          onDeleteDeck={handleDeleteDeck}
          onCreateNew={handleCreateNew}
          t={t}
        />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto font-sans">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
              {currentView !== 'deck-list' && (
                <button 
                  onClick={handleGoToDeckList} 
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  title={t('backToDeckListTooltip')}
                >
                  <HomeIcon className="w-6 h-6" />
                </button>
              )}
              <div>
                  <h1 className="text-3xl font-bold text-slate-900">{t('appTitle')}</h1>
                  <p className="text-slate-600 mt-1">{t('appSubtitle')}</p>
              </div>
          </div>
          <button 
              onClick={toggleLanguage} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Toggle Language"
          >
              <LanguageIcon className="w-6 h-6" />
          </button>
      </header>
      <main>
        {renderView()}
      </main>
    </div>
  );
};

export default App;