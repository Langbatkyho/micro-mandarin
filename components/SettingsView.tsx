
import React from 'react';
import { UserProfile, Dictionary } from '../types';
import { LogOut, Trash2, User, Clock, Target, ArrowRight, Edit2 } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile | null;
  t: Dictionary;
  onSignOut: () => void;
  onDeleteData: () => void;
  onEditProfile: () => void;
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  profile, t, onSignOut, onDeleteData, onEditProfile, onClearHistory 
}) => {
  
  const handleDeleteConfirm = () => {
    if (window.confirm(t.deleteDataConfirm)) {
      onDeleteData();
    }
  };

  const handleClearHistoryConfirm = () => {
    if (window.confirm("Are you sure you want to clear your local learning history?")) {
      onClearHistory();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 px-2">{t.settingsTitle}</h2>

      {/* Profile Summary Card */}
      {profile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <User size={20} className="text-red-600" />
              {profile.email || 'User'}
            </h3>
            <button 
              onClick={onEditProfile}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <Edit2 size={12} /> {t.editProfile}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-xl">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">{t.lblLevel}</div>
              <div className="font-medium text-slate-800 truncate">{profile.level}</div>
            </div>
             <div className="bg-slate-50 p-3 rounded-xl">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">{t.lblTime}</div>
              <div className="font-medium text-slate-800 flex items-center gap-1">
                <Clock size={14} /> {profile.timeSlot} min
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl">
             <div className="text-slate-400 text-xs uppercase font-bold mb-2">{t.lblGoals}</div>
             <div className="flex flex-wrap gap-2">
               {profile.goals.map((g, idx) => (
                 <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-slate-600">
                   {g}
                 </span>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">{t.accountActions}</h3>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          
          {/* Clear History */}
          <button 
            onClick={handleClearHistoryConfirm}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                 <Clock size={18} />
              </div>
              <div>
                <div className="font-medium text-slate-800">{t.clearHistory}</div>
                <div className="text-xs text-slate-500">Remove all local lesson logs</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </button>

          {/* Sign Out */}
          <button 
            onClick={onSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
          >
             <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                 <LogOut size={18} />
              </div>
              <div>
                <div className="font-medium text-slate-800">{t.signOut}</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-100 rounded-xl overflow-hidden">
           <button 
            onClick={handleDeleteConfirm}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors text-left group"
          >
             <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                 <Trash2 size={18} />
              </div>
              <div>
                <div className="font-medium text-red-600">{t.deleteData}</div>
                <div className="text-xs text-red-400">{t.deleteDataDesc}</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-red-200" />
          </button>
        </div>

      </div>
    </div>
  );
};
