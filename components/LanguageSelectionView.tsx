import React from 'react';
import { TargetLanguage } from '../types';
import { TranslationKey } from '../utils/translations';

interface LanguageSelectionViewProps {
  onSelect: (lang: TargetLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageSelectionView: React.FC<LanguageSelectionViewProps> = ({ onSelect, t }) => {
  
  const handleSelect = (lang: TargetLanguage) => {
    onSelect(lang);
  };

  return (
    <div className="text-center max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-bold text-slate-800">{t('languageSelectionTitle')}</h2>
      <p className="text-lg text-slate-600 mt-4 mb-10">{t('languageSelectionSubtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => handleSelect('en')}
          className="p-8 border-2 border-slate-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <span className="text-5xl">🇬🇧</span>
          <h3 className="text-2xl font-semibold text-slate-900 mt-4 group-hover:text-blue-600">{t('learnEnglishButton')}</h3>
        </button>
        <button
          onClick={() => handleSelect('zh')}
          className="p-8 border-2 border-slate-200 rounded-lg text-left hover:border-red-500 hover:bg-red-50 transition-all group"
        >
          <span className="text-5xl">🇨🇳</span>
          <h3 className="text-2xl font-semibold text-slate-900 mt-4 group-hover:text-red-600">{t('learnChineseButton')}</h3>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelectionView;