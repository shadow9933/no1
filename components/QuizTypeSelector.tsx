import React from 'react';
import { TranslationKey } from '../utils/translations';
import { MCQIcon, FillIcon } from './icons';

type QuizType = 'mcq' | 'tf' | 'fill';

interface QuizTypeSelectorProps {
    selected: Set<QuizType>;
    onChange: (selected: Set<QuizType>) => void;
    vocabRowCount: number;
    t: (key: TranslationKey) => string;
}

const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({ selected, onChange, vocabRowCount, t }) => {
    
    const options: { id: QuizType, labelKey: TranslationKey, icon: React.ReactNode, minRequired: number }[] = [
        { id: 'mcq', labelKey: 'mcqCheckboxLabel', icon: <MCQIcon className="w-5 h-5"/>, minRequired: 4 },
        { id: 'fill', labelKey: 'fillCheckboxLabel', icon: <FillIcon className="w-5 h-5"/>, minRequired: 1 },
    ];

    const handleToggle = (type: QuizType) => {
        const newSet = new Set(selected);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        onChange(newSet);
    };

    return (
        <div className="space-y-1">
            {options.map(opt => {
                const isDisabled = vocabRowCount < opt.minRequired;
                return (
                    <label 
                        key={opt.id} 
                        className={`flex items-center gap-2 p-1 rounded-md ${isDisabled ? 'text-slate-400 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}
                        title={isDisabled && opt.id === 'mcq' ? t('quizDisabledNoteMCQ') : ''}
                    >
                        <input
                            type="checkbox"
                            checked={selected.has(opt.id) && !isDisabled}
                            disabled={isDisabled}
                            onChange={() => handleToggle(opt.id)}
                            className="h-4 w-4 rounded bg-white border-slate-400 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="w-5 h-5 text-slate-600">{opt.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{t(opt.labelKey)}</span>
                    </label>
                )
            })}
        </div>
    );
};

export default QuizTypeSelector;
