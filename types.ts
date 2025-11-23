
export enum HSKLevel {
  HSK1 = 'HSK1 (Beginner)',
  HSK2 = 'HSK2 (Basic)',
  HSK3 = 'HSK3 (Intermediate)',
  HSK4 = 'HSK4 (Upper Intermediate)',
}

export interface VocabularyItem {
  hanzi: string;
  pinyin: string;
  translation: string;
  type: string;
}

export interface GrammarPoint {
  structure: string;
  explanation: string;
}

export interface DialogueLine {
  role: string;
  chinese: string;
  pinyin: string;
  translation: string;
}

export interface LessonData {
  lesson_title: string;
  context_intro: string;
  vocabulary: VocabularyItem[];
  dialogue: DialogueLine[];
  grammar_point: GrammarPoint;
}

export interface PronunciationError {
  word: string;
  expected_tone: string;
  heard_tone: string;
  comment: string;
}

export interface AudioAnalysisResult {
  heard_transcript: string;
  heard_pinyin: string;
  score: number;
  tone_accuracy: string;
  errors: PronunciationError[];
  overall_feedback: string;
}

export enum AppState {
  LESSON_GENERATION = 'LESSON_GENERATION',
  PRACTICE_MODE = 'PRACTICE_MODE',
}

export interface UserProfile {
  id?: string; // Supabase Auth ID
  email?: string;
  gemini_api_key?: string; // Stored key
  level: HSKLevel;
  goals: string[];
  timeSlot: number; // minutes
  isSetup: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  topic: string;
  level: HSKLevel;
  vocabulary: VocabularyItem[];
  bestScore: number;
}

export type View = 'HOME' | 'HISTORY' | 'PROFILE' | 'SETTINGS' | 'ONBOARDING' | 'AUTH';

export interface Dictionary {
  // General
  title: string;
  subtitle: string;
  // Nav
  navHome: string;
  navHistory: string;
  navSettings: string;
  navProfile: string;
  // Home
  placeholder: string;
  generate: string;
  lessonContent: string;
  vocab: string;
  grammar: string;
  practiceArena: string;
  emptyLesson: string;
  selectLine: string;
  target: string;
  practicing: string;
  analyzing: string;
  tapRecord: string;
  recording: string;
  analysisResult: string;
  score: string;
  aiHeard: string;
  toneAccuracy: string;
  improvements: string;
  expected: string;
  heard: string;
  perfect: string;
  errorMicrophone: string;
  errorGen: string;
  errorAnalysis: string;
  perfectMatch: string;
  // HSK
  hsk1: string;
  hsk2: string;
  hsk3: string;
  hsk4: string;
  // Onboarding
  welcome: string;
  setupTitle: string;
  lblLevel: string;
  lblGoals: string;
  lblTime: string;
  goalWork: string;
  goalTravel: string;
  goalHobby: string;
  min5: string;
  min10: string;
  min15: string;
  startJourney: string;
  // History
  historyTitle: string;
  noHistory: string;
  date: string;
  bestScore: string;
  // Auth
  signIn: string;
  signOut: string;
  apiKeyReq: string;
  apiKeyPlaceholder: string;
  saveKey: string;
  enterEmail: string;
  apiKeyHelp: string;
  getKeyLink: string;
  // Settings
  settingsTitle: string;
  editProfile: string;
  clearHistory: string;
  deleteData: string;
  deleteDataConfirm: string;
  deleteDataDesc: string;
  accountActions: string;
}
