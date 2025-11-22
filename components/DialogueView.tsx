import React from 'react';
import { LessonData, DialogueLine, Dictionary } from '../types';
import { Volume2, ArrowRight, Book, Lightbulb } from 'lucide-react';

interface DialogueViewProps {
  lesson: LessonData;
  onSelectLine: (line: DialogueLine) => void;
  selectedLine: DialogueLine | null;
  t: Dictionary;
}

export const DialogueView: React.FC<DialogueViewProps> = ({ lesson, onSelectLine, selectedLine, t }) => {
  
  const handlePlayAudio = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Browser does not support Text-to-Speech");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Context */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">{lesson.lesson_title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{lesson.context_intro}</p>
      </div>

      {/* Vocabulary Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <Book size={14} />
          {t.vocab}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lesson.vocabulary.map((word, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
              <span className="chinese-text font-bold text-slate-800">{word.hanzi}</span>
              <span className="text-xs text-slate-500 font-mono">[{word.pinyin}]</span>
              <span className="text-xs text-slate-400">-</span>
              <span className="text-sm text-slate-600 truncate">{word.translation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogue Section */}
      <div className="space-y-3">
        {lesson.dialogue.map((line, idx) => {
          const isSelected = selectedLine === line;
          return (
            <div 
              key={idx}
              onClick={() => onSelectLine(line)}
              className={`relative group cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
                isSelected 
                  ? 'bg-white border-red-500 ring-1 ring-red-500 shadow-md' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{line.role}</span>
                      {isSelected && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">{t.practicing}</span>}
                   </div>
                   <p className="text-xl chinese-text font-medium text-slate-800 leading-relaxed">{line.chinese}</p>
                   <p className="text-sm text-slate-500 font-mono">{line.pinyin}</p>
                   <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-slate-50">{line.translation}</p>
                </div>
                
                <button 
                  onClick={(e) => {
                    if (isSelected) {
                      handlePlayAudio(line.chinese, e);
                    }
                  }}
                  className={`mt-2 p-2 rounded-full transition-all ${
                    isSelected 
                      ? 'text-red-500 hover:bg-red-50 active:scale-95' 
                      : 'text-slate-300 group-hover:text-slate-400'
                  }`}
                  title={isSelected ? "Listen" : "Select to practice"}
                >
                   {isSelected ? <Volume2 size={20} /> : <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grammar Section */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-yellow-700 font-semibold text-xs uppercase tracking-wider">
          <Lightbulb size={14} />
          {t.grammar}
        </div>
        <div className="space-y-1">
          <p className="font-mono text-sm font-bold text-slate-800 bg-white/50 inline-block px-2 py-1 rounded border border-yellow-200/50">
            {lesson.grammar_point.structure}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {lesson.grammar_point.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};