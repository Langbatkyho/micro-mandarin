
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Dictionary } from '../types';
import { Lock, Key, LogIn, Mail, ExternalLink } from 'lucide-react';
import { Spinner } from './Spinner';

interface AuthProps {
  t: Dictionary;
  onAuthComplete: (userId: string, apiKey: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ t, onAuthComplete }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'API_KEY'>('LOGIN');
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

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
    setMessage(null);

    // 1. Try to Sign In
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 2. If Sign In fails, try to Sign Up
      // Important: Add emailRedirectTo to ensure verification link points to Render, not localhost
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (signUpError) {
        setMessage({ type: 'error', text: signUpError.message });
      } else if (signUpData.user) {
        // Check if email confirmation is required
        if (signUpData.user.identities?.length === 0) {
           setMessage({ type: 'error', text: "Tài khoản này đã tồn tại. Vui lòng thử mật khẩu khác." });
        } else if (!signUpData.session) {
           setMessage({ type: 'success', text: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập." });
        } else {
           // Auto logged in (if confirm email is disabled)
           setUser(signUpData.user);
           setMode('API_KEY');
        }
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
      alert(`Lỗi lưu Key: ${error.message}`);
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

        {message && (
          <div className={`p-3 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {message.text}
          </div>
        )}

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
             <p className="text-xs text-center text-slate-400 mt-2">
               If you don't have an account, one will be created for you.
             </p>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
              {t.apiKeyReq}
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
               {/* Instructions Link */}
               <div className="text-xs text-slate-500 mt-2 flex flex-col gap-1">
                 <span>{t.apiKeyHelp}</span>
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-red-600 hover:underline flex items-center gap-1 font-medium"
                 >
                   {t.getKeyLink} <ExternalLink size={12} />
                 </a>
               </div>
             </div>
             <button onClick={handleSaveKey} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex justify-center gap-2 items-center">
               <Lock size={18} /> {t.saveKey}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
