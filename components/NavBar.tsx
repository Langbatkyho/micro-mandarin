import React from 'react';
import { View, Dictionary } from '../types';
import { Home, History } from 'lucide-react';

interface NavBarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  t: Dictionary;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView, t }) => {
  const navItems = [
    { id: 'HOME' as View, icon: Home, label: t.navHome },
    { id: 'HISTORY' as View, icon: History, label: t.navHistory },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
      <div className="max-w-3xl mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};