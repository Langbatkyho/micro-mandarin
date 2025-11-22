import React from 'react';
import { HistoryEntry, Dictionary } from '../types';
import { Trophy, Calendar, Book } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryEntry[];
  t: Dictionary;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, t }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Trophy size={48} className="mb-4 opacity-20" />
        <p>{t.noHistory}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 px-2">{t.historyTitle}</h2>
      <div className="grid gap-4">
        {history.map((entry) => (
          <div key={entry.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{entry.topic}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Calendar size={12} />
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{entry.level}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full border font-bold text-sm ${getScoreColor(entry.bestScore)}`}>
                {entry.bestScore > 0 ? entry.bestScore : '-'}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
               <div className="flex items-center gap-2 mb-2 text-slate-500 font-semibold text-xs uppercase">
                  <Book size={12} />
                  {t.vocab}
               </div>
               <div className="flex flex-wrap gap-2">
                 {entry.vocabulary.slice(0, 3).map((vocab, idx) => (
                   <span key={idx} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
                     {vocab.hanzi} ({vocab.pinyin})
                   </span>
                 ))}
                 {entry.vocabulary.length > 3 && (
                   <span className="text-xs px-2 py-1 text-slate-400">+{entry.vocabulary.length - 3}</span>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
