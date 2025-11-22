import React, { useState } from 'react';
import { HSKLevel, UserProfile, Dictionary } from '../types';
import { Sparkles, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  t: Dictionary;
  initialProfile?: UserProfile | null;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, t, initialProfile }) => {
  const [level, setLevel] = useState<HSKLevel>(initialProfile?.level || HSKLevel.HSK1);
  const [goals, setGoals] = useState<string[]>(initialProfile?.goals || []);
  const [timeSlot, setTimeSlot] = useState<number>(initialProfile?.timeSlot || 10);

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleSubmit = () => {
    onComplete({
      level,
      goals,
      timeSlot,
      isSetup: true
    });
  };

  const GOAL_OPTIONS = [
    { id: 'work', label: t.goalWork, icon: '💼' },
    { id: 'travel', label: t.goalTravel, icon: '✈️' },
    { id: 'hobby', label: t.goalHobby, icon: '🎨' },
  ];

  const TIME_OPTIONS = [
    { val: 5, label: t.min5 },
    { val: 10, label: t.min10 },
    { val: 15, label: t.min15 },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-red-200">
            M
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t.welcome}</h2>
          <p className="text-slate-500">{t.setupTitle}</p>
        </div>

        {/* 1. Level */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">{t.lblLevel}</label>
          <select 
            value={level}
            onChange={(e) => setLevel(e.target.value as HSKLevel)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
          >
            {Object.values(HSKLevel).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 2. Goals */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">{t.lblGoals}</label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map(opt => {
              const isSelected = goals.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleGoal(opt.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    isSelected 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Time Slot */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">{t.lblTime}</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {TIME_OPTIONS.map(opt => {
              const isSelected = timeSlot === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => setTimeSlot(opt.val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          {t.startJourney}
        </button>
      </div>
    </div>
  );
};
