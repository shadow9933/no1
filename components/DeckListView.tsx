import React from 'react';
import { Deck } from '../types';
import { TranslationKey } from '../utils/translations';
import { PlusIcon, TrashIcon } from './icons';

interface DeckListViewProps {
  decks: Deck[];
  onSelectDeck: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onCreateNew: () => void;
  t: (key: TranslationKey) => string;
}

const DeckListView: React.FC<DeckListViewProps> = ({ decks, onSelectDeck, onDeleteDeck, onCreateNew, t }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">{t('deckListTitle')}</h2>
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5"/>
          {t('createNewDeckButton')}
        </button>
      </div>

      {decks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {decks.map(deck => (
            <div key={deck.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 truncate">{deck.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{deck.rows.length} {t('deckCardWords')}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectDeck(deck.id)}
                  className="w-full px-4 py-2 text-sm rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50"
                >
                  {t('deckCardOpenButton')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete "${deck.title}"?`)) {
                      onDeleteDeck(deck.id);
                    }
                  }}
                  className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600"
                  title={t('deckCardDeleteButton')}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-700">{t('deckListEmptyState')}</h3>
        </div>
      )}
    </div>
  );
};

export default DeckListView;