import React, { useState, useRef, useEffect } from 'react';
import { TranslationKey } from '../utils/translations';
import { TargetLanguage } from '../types';
import Accordion from './Accordion';
import { UploadIcon, ParseIcon, SpinnerIcon } from './icons';

interface HomeViewProps {
  onAnalyze: (text: string, title: string, ipa: 'us' | 'uk' | 'pinyin', thinkingMode: boolean, targetLanguage: TargetLanguage) => void;
  isAnalyzing: boolean;
  t: (key: TranslationKey) => string;
  targetLanguage: TargetLanguage;
}

const HomeView: React.FC<HomeViewProps> = ({ onAnalyze, isAnalyzing, t, targetLanguage }) => {
  const [rawText, setRawText] = useState<string>('');
  const [deckTitle, setDeckTitle] = useState<string>('');
  const [ipaDialect, setIpaDialect] = useState<'us' | 'uk' | 'pinyin'>('us');
  const [useThinkingMode, setUseThinkingMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetLanguage === 'zh') {
        setIpaDialect('pinyin');
        setDeckTitle(t('initialDeckTitleDefaultChinese'));
    } else {
        setIpaDialect('us');
        setDeckTitle(t('initialDeckTitleDefaultEnglish'));
    }
  }, [targetLanguage, t]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const textContent = String(e.target?.result || '');
      setRawText(textContent);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAnalyzeClick = () => {
    onAnalyze(rawText, deckTitle, ipaDialect, useThinkingMode, targetLanguage);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        <Accordion title={t('vocabInputTitle')} defaultOpen>
          <div className="space-y-4">
            <div>
              <label htmlFor="deckTitle" className="block text-sm font-medium text-slate-700 mb-1">{t('deckTitleLabel')}</label>
              <input id="deckTitle" value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="pasteArea" className="block text-sm font-medium text-slate-700 mb-1">{t('pasteListLabel')}</label>
              <p className="text-xs text-slate-500 mb-2">{t('pasteListHelper')}</p>
              <textarea id="pasteArea" value={rawText} onChange={(e) => setRawText(e.target.value)} rows={10} className="w-full p-2 border rounded-md bg-white text-slate-900 border-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={t('pasteListPlaceholder')} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <input type="file" accept=".csv,.txt,.tsv" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50">
                <UploadIcon className="w-5 h-5" />
                {t('uploadFileButton')}
              </button>
            </div>
          </div>
        </Accordion>
        
        <Accordion title={t('settingsTitle')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('ipaDialectLabel')}</label>
               {targetLanguage === 'en' && (
                <div className="flex rounded-md border border-slate-300">
                  <button onClick={() => setIpaDialect('us')} className={`px-4 py-2 text-sm font-medium rounded-l-md w-1/2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${ipaDialect === 'us' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                    {t('ipaUS')}
                  </button>
                  <button onClick={() => setIpaDialect('uk')} className={`px-4 py-2 text-sm font-medium rounded-r-md w-1/2 -ml-px transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${ipaDialect === 'uk' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                    {t('ipaUK')}
                  </button>
                </div>
              )}
              {targetLanguage === 'zh' && (
                <div className="p-2 bg-slate-100 rounded-md text-sm text-slate-700 border border-slate-200">
                  {t('ipaPinyin')}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={useThinkingMode} onChange={(e) => setUseThinkingMode(e.target.checked)} className="h-4 w-4 mt-0.5 rounded bg-white border-slate-400 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="font-medium text-slate-800">{t('thinkingModeLabel')}</span>
                  <p className="text-xs text-slate-500">{t('thinkingModeHelper')}</p>
                </div>
              </label>
            </div>
          </div>
        </Accordion>

        <div className="pt-4">
           <button onClick={handleAnalyzeClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed text-lg" disabled={isAnalyzing || !rawText}>
              {isAnalyzing ? <SpinnerIcon className="w-6 h-6" /> : <ParseIcon className="w-6 h-6" />}
              {isAnalyzing ? t('analyzingButton') : t('analyzeButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;