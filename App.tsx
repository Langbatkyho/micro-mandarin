import React, { useState, useEffect } from 'react';
import { generateLesson, analyzeAudio } from './services/geminiService';
import { getProfile, saveProfile, getHistory, saveHistoryEntry, updateHistoryScore, clearAllData } from './services/storage';
import { HSKLevel, LessonData, DialogueLine, AudioAnalysisResult, Dictionary, View, UserProfile, HistoryEntry } from './types';
import { AudioRecorder } from './components/AudioRecorder';
import { FeedbackCard } from './components/FeedbackCard';
import { DialogueView } from './components/DialogueView';
import { Spinner } from './components/Spinner';
import { Onboarding } from './components/Onboarding';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { NavBar } from './components/NavBar';
import { Auth } from './components/Auth';
import { Sparkles, BookOpen, Mic, ChevronRight, Globe } from 'lucide-react';

export type Language = 'en' | 'vi';

export const TRANSLATIONS: Record<Language, Dictionary> = {
  en: {
    title: "Micro Mandarin",
    subtitle: "AI Powered",
    navHome: "Today",
    navHistory: "History",
    navSettings: "Settings",
    navProfile: "Profile",
    placeholder: "Enter topic (e.g., Football, Taxi)",
    generate: "Generate",
    lessonContent: "Lesson Content",
    vocab: "Vocabulary",
    grammar: "Grammar Point",
    practiceArena: "Practice Arena",
    emptyLesson: "Enter a topic above to generate a custom lesson.",
    selectLine: "Select a line from the dialogue to start practicing.",
    target: "Target",
    practicing: "PRACTICING",
    analyzing: "Analyzing Pronunciation...",
    tapRecord: "Tap to Record",
    recording: "Recording",
    analysisResult: "Analysis Result",
    score: "Score",
    aiHeard: "AI HEARD",
    toneAccuracy: "Tones",
    improvements: "Improvements Needed",
    expected: "Expected",
    heard: "Heard",
    perfect: "Perfect pronunciation! No errors detected.",
    errorMicrophone: "Could not access microphone. Please grant permission.",
    errorGen: "Failed to generate lesson. Please check network or try again.",
    errorAnalysis: "Analysis failed. Please try again.",
    perfectMatch: "Perfect pronunciation! No errors detected.",
    hsk1: "HSK1 (Beginner)",
    hsk2: "HSK2 (Basic)",
    hsk3: "HSK3 (Intermediate)",
    hsk4: "HSK4 (Upper Intermediate)",
    welcome: "Welcome!",
    setupTitle: "Let's personalize your learning path",
    lblLevel: "Current Level",
    lblGoals: "Goals",
    lblTime: "Daily Time Slot",
    goalWork: "Work",
    goalTravel: "Travel",
    goalHobby: "Hobby",
    min5: "5 mins",
    min10: "10 mins",
    min15: "15 mins",
    startJourney: "Start Learning",
    historyTitle: "Learning History",
    noHistory: "No lessons yet. Start practicing!",
    date: "Date",
    bestScore: "Best Score",
    signIn: "Sign In",
    signOut: "Reset App",
    apiKeyReq: "API Key Required",
    apiKeyPlaceholder: "Enter your Google Gemini API Key",
    saveKey: "Save Key",
    enterEmail: "Enter Email",
    apiKeyHelp: "Don't have a key? Get one for free from Google AI Studio.",
    getKeyLink: "Get Gemini API Key",
    settingsTitle: "Settings",
    editProfile: "Edit",
    clearHistory: "Clear History",
    deleteData: "Delete Personal Data",
    deleteDataConfirm: "Are you sure? This will delete your learning history and reset your profile settings on this device.",
    deleteDataDesc: "Wipe history and local profile",
    accountActions: "Actions"
  },
  vi: {
    title: "Micro Mandarin",
    subtitle: "Hỗ trợ bởi AI",
    navHome: "Bài học",
    navHistory: "Lịch sử",
    navSettings: "Cài đặt",
    navProfile: "Hồ sơ",
    placeholder: "Nhập chủ đề (vd: Bóng đá, Mua sắm)",
    generate: "Tạo bài học",
    lessonContent: "Nội dung bài học",
    vocab: "Từ vựng mới",
    grammar: "Điểm ngữ pháp",
    practiceArena: "Khu vực luyện tập",
    emptyLesson: "Nhập chủ đề bên trên để tạo bài học tùy chỉnh.",
    selectLine: "Chọn một câu thoại để bắt đầu luyện tập.",
    target: "Mục tiêu",
    practicing: "ĐANG TẬP",
    analyzing: "Đang phân tích phát âm...",
    tapRecord: "Chạm để ghi âm",
    recording: "Đang ghi âm",
    analysisResult: "Kết quả phân tích",
    score: "Điểm",
    aiHeard: "AI NGHE ĐƯỢC",
    toneAccuracy: "Thanh điệu",
    improvements: "Cần cải thiện",
    expected: "Chuẩn",
    heard: "Nghe",
    perfect: "Phát âm hoàn hảo! Không tìm thấy lỗi.",
    errorMicrophone: "Không thể truy cập micro. Vui lòng cấp quyền.",
    errorGen: "Không thể tạo bài học. Vui lòng kiểm tra mạng hoặc thử lại.",
    errorAnalysis: "Phân tích thất bại. Vui lòng thử lại.",
    perfectMatch: "Phát âm hoàn hảo! Không có lỗi.",
    hsk1: "HSK1 (Sơ cấp)",
    hsk2: "HSK2 (Cơ bản)",
    hsk3: "HSK3 (Trung cấp)",
    hsk4: "HSK4 (Trung cao cấp)",
    welcome: "Xin chào!",
    setupTitle: "Cá nhân hóa lộ trình học của bạn",
    lblLevel: "Trình độ hiện tại",
    lblGoals: "Mục tiêu",
    lblTime: "Thời gian rảnh mỗi lần",
    goalWork: "Công việc",
    goalTravel: "Du lịch",
    goalHobby: "Sở thích",
    min5: "5 phút",
    min10: "10 phút",
    min15: "15 phút",
    startJourney: "Bắt đầu học",
    historyTitle: "Lịch sử học tập",
    noHistory: "Chưa có bài học nào. Hãy bắt đầu ngay!",
    date: "Ngày",
    bestScore: "Điểm cao nhất",
    signIn: "Đăng nhập",
    signOut: "Đặt lại ứng dụng",
    apiKeyReq: "Yêu cầu API Key",
    apiKeyPlaceholder: "Nhập Google Gemini API Key của bạn",
    saveKey: "Lưu Key",
    enterEmail: "Nhập Email",
    apiKeyHelp: "Bạn chưa có Key? Lấy miễn phí từ Google AI Studio.",
    getKeyLink: "Lấy Gemini API Key",
    settingsTitle: "Cài đặt",
    editProfile: "Sửa",
    clearHistory: "Xóa lịch sử",
    deleteData: "Xóa dữ liệu cá nhân",
    deleteDataConfirm: "Bạn có chắc chắn không? Hành động này sẽ xóa toàn bộ lịch sử học tập và cài đặt hồ sơ trên thiết bị này.",
    deleteDataDesc: "Xóa lịch sử và đặt lại hồ sơ",
    accountActions: "Tác vụ"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const t = TRANSLATIONS[lang];

  // Application View State
  const [view, setView] = useState<View>('AUTH'); // Start with Auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState<string>(''); // Store API Key
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Lesson State
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<HSKLevel>(HSKLevel.HSK1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Practice State
  const [selectedLine, setSelectedLine] = useState<DialogueLine | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null);

  // Check local setup on load
  useEffect(() => {
    const localProfile = getProfile();
    // Only proceed to home if we have a profile AND a Key
    if (localProfile?.gemini_api_key) {
      setUserProfile(localProfile);
      setApiKey(localProfile.gemini_api_key);
      setLevel(localProfile.level);
      setHistory(getHistory());
      setView('HOME');
    } else {
      setView('AUTH');
    }
  }, []);

  const handleResetApp = async () => {
    clearAllData();
    setHistory([]);
    setUserProfile(null);
    setApiKey('');
    setView('AUTH');
  };

  const handleDeleteData = async () => {
    clearAllData();
    setHistory([]);
    setUserProfile(null);
    setApiKey('');
    setView('AUTH');
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'vi' : 'en');
  };

  // Called when Auth component finishes (login + key entry)
  const handleAuthComplete = (userId: string, key: string) => {
    setApiKey(key);
    
    // Check if we have an existing profile for this user ID in local storage or need to create new
    const existing = getProfile();
    let profile: UserProfile;
    
    if (existing && existing.id === userId) {
       profile = { ...existing, gemini_api_key: key };
    } else {
       // New or different user
       profile = {
         id: userId,
         email: 'user', // Simplified
         gemini_api_key: key,
         level: HSKLevel.HSK1,
         goals: [],
         timeSlot: 10,
         isSetup: false
       };
    }
    
    saveProfile(profile);
    setUserProfile(profile);
    
    if (profile.isSetup) {
      setLevel(profile.level);
      setHistory(getHistory());
      setView('HOME');
    } else {
      setView('ONBOARDING');
    }
  };

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile = { 
      ...userProfile, 
      ...data, 
      isSetup: true 
    };
    
    saveProfile(updatedProfile);
    setUserProfile(updatedProfile);
    setLevel(updatedProfile.level);
    setView('HOME');
  };

  const handleGenerateLesson = async () => {
    if (!topic || !apiKey) return;
    setIsGenerating(true);
    setAnalysisResult(null);
    setSelectedLine(null);
    try {
      // Pass apiKey here
      const lesson = await generateLesson(topic, level, lang, apiKey);
      setCurrentLesson(lesson);
      
      const newId = Date.now().toString();
      setCurrentLessonId(newId);
      
      const newEntry: HistoryEntry = {
        id: newId,
        date: new Date().toISOString(),
        topic: topic,
        level: level,
        vocabulary: lesson.vocabulary,
        bestScore: 0
      };
      
      saveHistoryEntry(newEntry);
      setHistory(getHistory());

      if (lesson.dialogue.length > 0) {
        setSelectedLine(lesson.dialogue[0]);
      }
    } catch (err) {
      alert(t.errorGen + " " + err);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    if (!selectedLine || !apiKey) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Pass apiKey here
      const result = await analyzeAudio(audioBlob, selectedLine.chinese, selectedLine.pinyin, lang, apiKey);
      setAnalysisResult(result);

      if (currentLessonId && result.score > 0) {
        updateHistoryScore(currentLessonId, result.score);
        setHistory(getHistory());
      }

    } catch (err) {
      alert(t.errorAnalysis + " " + err);
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHSKLabel = (l: HSKLevel) => {
    switch(l) {
      case HSKLevel.HSK1: return t.hsk1;
      case HSKLevel.HSK2: return t.hsk2;
      case HSKLevel.HSK3: return t.hsk3;
      case HSKLevel.HSK4: return t.hsk4;
      default: return l;
    }
  };

  // Rendering Logic
  const renderContent = () => {
    if (view === 'AUTH') {
      return <Auth t={t} onAuthComplete={handleAuthComplete} />;
    }

    if (view === 'ONBOARDING') {
      // Pass current profile data to pre-fill
      return <Onboarding onComplete={handleOnboardingComplete} t={t} initialProfile={userProfile} />;
    }

    if (view === 'PROFILE') {
      // Profile view acts as onboarding editor
      return <Onboarding onComplete={handleOnboardingComplete} t={t} initialProfile={userProfile} />;
    }

    if (view === 'HISTORY') {
      return <HistoryView history={history} t={t} />;
    }

    if (view === 'SETTINGS') {
      return (
        <SettingsView 
          profile={userProfile} 
          t={t} 
          onSignOut={handleResetApp} 
          onDeleteData={handleDeleteData}
          onEditProfile={() => setView('PROFILE')}
          onClearHistory={() => {
            clearAllData(); 
            setHistory([]);
            // Don't reset user profile fully, just history
            // Actually clearAllData clears everything in storage.ts
            // Let's re-save profile minus history
            if (userProfile) saveProfile(userProfile);
          }}
        />
      );
    }

    // Default HOME view
    return (
      <>
        {/* Generator Section */}
        <section className="mb-8 animate-in fade-in duration-700">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap sm:flex-nowrap gap-1 mb-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.placeholder}
              className="flex-grow px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 text-slate-800 placeholder-slate-400 font-medium bg-slate-100"
            />
            <div className="h-px w-full sm:w-px sm:h-auto bg-slate-100 mx-1"></div>
            <div className="flex gap-1 w-full sm:w-auto">
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value as HSKLevel)}
                className="flex-grow px-3 py-3 bg-transparent rounded-xl text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
              >
                {Object.values(HSKLevel).map((l) => (
                  <option key={l} value={l}>{getHSKLabel(l)}</option>
                ))}
              </select>
              <button
                onClick={handleGenerateLesson}
                disabled={isGenerating || !topic}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-slate-200"
              >
                {isGenerating ? <Spinner className="w-5 h-5" /> : <><Sparkles size={18} /> {t.generate}</>}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lesson Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2">
              <BookOpen size={16} />
              {t.lessonContent}
            </div>
            
            {currentLesson ? (
              <DialogueView 
                lesson={currentLesson} 
                onSelectLine={(line) => {
                  setSelectedLine(line);
                  setAnalysisResult(null); 
                }}
                selectedLine={selectedLine}
                t={t}
              />
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                   <Sparkles size={32} />
                 </div>
                 <p>{t.emptyLesson}</p>
              </div>
            )}
          </div>

          {/* Practice Column */}
          <div className="space-y-6 relative">
             <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm uppercase tracking-wider mb-2">
              <Mic size={16} />
              {t.practiceArena}
            </div>

            <div className={`sticky top-24 transition-all duration-300 ${!selectedLine ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center space-y-6">
                
                {!selectedLine ? (
                  <div className="py-10 text-slate-400 flex flex-col items-center">
                     <ChevronRight size={40} className="text-slate-200 mb-2" />
                     <p>{t.selectLine}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{t.target}</p>
                      <h3 className="text-3xl chinese-text font-bold text-slate-800">{selectedLine.chinese}</h3>
                      <p className="text-lg text-slate-500 font-mono">{selectedLine.pinyin}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <AudioRecorder 
                        onRecordingComplete={handleAudioRecorded}
                        isAnalyzing={isAnalyzing}
                        t={t}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Results Area */}
              {analysisResult && (
                <div className="mt-6">
                  <FeedbackCard result={analysisResult} t={t} />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <h1 className="font-bold text-xl tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-colors"
            >
              <Globe size={16} />
              <span>{lang === 'en' ? 'EN' : 'VI'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Only show if authenticated and not in Auth flow */}
      {view !== 'AUTH' && view !== 'ONBOARDING' && view !== 'PROFILE' && (
        <NavBar currentView={view} onChangeView={setView} t={t} />
      )}
    </div>
  );
};

export default App;