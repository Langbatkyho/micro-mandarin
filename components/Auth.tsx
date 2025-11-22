import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Dictionary } from '../types';
import { Lock, Key, LogIn } from 'lucide-react';
import { Spinner } from './Spinner';

interface AuthProps {
  t: Dictionary;
  onAuthComplete: (userId: string, apiKey: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ t, onAuthComplete }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Use magic link in prod, simple password for now
  const [mode, setMode] = useState<'LOGIN' | 'API_KEY'>('LOGIN');
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        checkProfile(session.user.id);
      }
    };
    checkSession();
  }, []);

  const checkProfile = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', userId)
      .single();

    setLoading(false);
    
    if (data?.gemini_api_key) {
      onAuthComplete(userId, data.gemini_api_key);
    } else {
      setMode('API_KEY');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // For simplicity, using sign up if sign in fails or implementing a basic flow
    // In production, split Sign In / Sign Up
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Try Sign Up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        alert(signUpError.message);
      } else if (signUpData.user) {
        setUser(signUpData.user);
        setMode('API_KEY');
      }
    } else if (data.user) {
      setUser(data.user);
      checkProfile(data.user.id);
    }
    setLoading(false);
  };

  const handleSaveKey = async () => {
    if (!user || !apiKey) return;
    setLoading(true);

    console.log("Attempting to save key for user:", user.id);

    // Upsert profile
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        gemini_api_key: apiKey,
        email: user.email 
      });

    setLoading(false);

    if (error) {
      console.error("Supabase Save Error:", error);
      // Show specific error message to user
      alert(`Lỗi lưu Key: ${error.message || JSON.stringify(error)}`);
    } else {
      onAuthComplete(user.id, apiKey);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-red-200">
            M
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Micro Mandarin</h2>
        </div>

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Email</label>
               <input 
                 type="email" 
                 required 
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                 placeholder="name@example.com"
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Password</label>
               <input 
                 type="password" 
                 required 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                 placeholder="******"
               />
             </div>
             <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center gap-2 items-center">
               <LogIn size={18} /> Sign In / Sign Up
             </button>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
              Please provide your Google Gemini API Key. It will be stored securely and used only for your lessons.
            </div>
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Gemini API Key</label>
               <div className="relative">
                 <Key className="absolute left-3 top-3.5 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   required 
                   value={apiKey}
                   onChange={e => setApiKey(e.target.value)}
                   className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                   placeholder="AIzaSy..."
                 />
               </div>
             </div>
             <button onClick={handleSaveKey} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex justify-center gap-2 items-center">
               <Lock size={18} /> Save Securely
             </button>
          </div>
        )}
      </div>
    </div>
  );
};