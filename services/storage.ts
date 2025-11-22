import { UserProfile, HistoryEntry, HSKLevel } from '../types';

const PROFILE_KEY = 'mm_user_profile';
const HISTORY_KEY = 'mm_user_history';

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHistoryEntry = (entry: HistoryEntry) => {
  const history = getHistory();
  // Check if an entry for this lesson (by ID or Topic+Date) exists to update score
  // For simplicity, we append new generated lessons. 
  // If we wanted to update the score of the *current* session, we'd need to track Session ID.
  // Here we will prepend so newest is first.
  const updatedHistory = [entry, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const updateHistoryScore = (entryId: string, newScore: number) => {
  const history = getHistory();
  const updatedHistory = history.map(item => {
    if (item.id === entryId) {
      return { ...item, bestScore: Math.max(item.bestScore, newScore) };
    }
    return item;
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const createInitialProfile = (): UserProfile => ({
  level: HSKLevel.HSK1,
  goals: [],
  timeSlot: 10,
  isSetup: false
});
