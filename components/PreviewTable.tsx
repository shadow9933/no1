import React from 'react';
import { VocabRow } from '../types';
import { TranslationKey } from '../utils/translations';

interface PreviewTableProps {
  rows: VocabRow[];
  t: (key: TranslationKey) => string;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ rows, t }) => {
  const hasRows = rows.length > 0;
  return (
    <div className="bg-white p-4 sm:p-6 border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-slate-700">
          {t('previewTitle')}
        </h2>
        <span className="text-sm text-slate-500">{rows.length} {t('itemsSuffix')}</span>
      </div>
      
      <div className="overflow-auto flex-grow mt-2 border-t border-slate-200">
        {hasRows ? (
          <div className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <div key={i} className="flex justify-between items-start text-sm py-3 px-1">
                <span className="font-medium text-slate-800 w-2/5 break-words pr-2">{row.word}</span>
                <span className="text-slate-600 w-3/5 break-words text-right">
                  {row.ipa && `(${row.ipa}) `}{row.meaning}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <p>{t('previewPlaceholder')}</p>
          </div>
        )}
      </div>
       {hasRows && (
         <div className="mt-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
            {t('previewTip')}
         </div>
       )}
    </div>
  );
};

export default PreviewTable;