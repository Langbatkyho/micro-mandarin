import React from 'react';
import { AudioAnalysisResult, Dictionary } from '../types';
import { CheckCircle, AlertTriangle, Volume2 } from 'lucide-react';

interface FeedbackCardProps {
  result: AudioAnalysisResult;
  t: Dictionary;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ result, t }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getToneAccuracyColor = (acc: string) => {
    switch (acc) {
      case 'Perfect': return 'bg-green-100 text-green-700';
      case 'Good': return 'bg-blue-100 text-blue-700';
      case 'Needs Work': return 'bg-yellow-100 text-yellow-700';
      case 'Bad': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8; // Slow down slightly for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">{t.analysisResult}</h3>
        <div className={`px-3 py-1 rounded-full border font-bold text-sm ${getScoreColor(result.score)}`}>
          {t.score}: {result.score}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Heard Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-xs font-uppercase tracking-wider text-slate-400 font-semibold uppercase">{t.aiHeard}</div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getToneAccuracyColor(result.tone_accuracy)}`}>
               {t.toneAccuracy}: {result.tone_accuracy}
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl chinese-text font-medium text-slate-800">{result.heard_transcript}</span>
            <span className="text-slate-500 font-mono">{result.heard_pinyin}</span>
          </div>
          <p className="text-sm text-slate-600 italic">"{result.overall_feedback}"</p>
        </div>

        {/* Errors Section */}
        {result.errors.length > 0 ? (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3 text-orange-800 font-medium">
              <AlertTriangle size={18} />
              <span>{t.improvements}</span>
            </div>
            <div className="space-y-3">
              {result.errors.map((err, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded border border-orange-100/50 shadow-sm">
                  {/* Error Word & Play Button */}
                  <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <div className="chinese-text text-lg font-bold text-slate-700 text-center">
                      {err.word}
                    </div>
                    <button 
                      onClick={() => handlePlayAudio(err.word)}
                      className="p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  <div className="text-sm text-slate-600 flex-1 pt-0.5">
                    <div className="flex gap-2 mb-1.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">{t.expected}: {err.expected_tone}</span>
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium">{t.heard}: {err.heard_tone}</span>
                    </div>
                    <p className="leading-snug text-slate-700">{err.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-center gap-3 text-green-800">
            <CheckCircle size={20} />
            <span className="font-medium">{t.perfectMatch}</span>
          </div>
        )}
      </div>
    </div>
  );
};