import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  known: boolean;
}

export interface FlashcardSet {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: Date;
  missedQuestions: QuizQuestion[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Summary {
  id: string;
  topic: string;
  shortSummary: string;
  detailedSummary: string;
  createdAt: Date;
}

interface StudyState {
  // Progress
  streak: number;
  lastStudyDate: string | null;
  totalStudyTime: number;
  dailyGoal: number;
  dailyProgress: number;
  
  // Data
  flashcardSets: FlashcardSet[];
  quizResults: QuizResult[];
  summaries: Summary[];
  badges: Badge[];
  
  // Theme
  isDarkMode: boolean;
  reducedMotion: boolean;
  
  // Actions
  updateStreak: () => void;
  addStudyTime: (minutes: number) => void;
  setDailyGoal: (minutes: number) => void;
  addFlashcardSet: (set: FlashcardSet) => void;
  updateFlashcard: (setId: string, cardId: string, updates: Partial<Flashcard>) => void;
  deleteFlashcardSet: (setId: string) => void;
  addQuizResult: (result: QuizResult) => void;
  addSummary: (summary: Summary) => void;
  unlockBadge: (badgeId: string) => void;
  toggleDarkMode: () => void;
  toggleReducedMotion: () => void;
  resetDailyProgress: () => void;
}

const defaultBadges: Badge[] = [
  { id: 'first-summary', name: 'First Summary', description: 'Created your first summary', icon: '📝' },
  { id: 'first-flashcards', name: 'Card Creator', description: 'Created your first flashcard set', icon: '🎴' },
  { id: 'first-quiz', name: 'Quiz Taker', description: 'Completed your first quiz', icon: '✅' },
  { id: 'streak-3', name: '3-Day Streak', description: 'Studied for 3 days in a row', icon: '🔥' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Studied for 7 days in a row', icon: '⚡' },
  { id: 'cards-100', name: 'Card Master', description: 'Reviewed 100 flashcards', icon: '🏆' },
  { id: 'perfect-quiz', name: 'Perfect Score', description: 'Got 100% on a quiz', icon: '🌟' },
  { id: 'study-hour', name: 'Hour of Power', description: 'Studied for 60 minutes total', icon: '⏰' },
];

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastStudyDate: null,
      totalStudyTime: 0,
      dailyGoal: 30,
      dailyProgress: 0,
      flashcardSets: [],
      quizResults: [],
      summaries: [],
      badges: defaultBadges,
      isDarkMode: false,
      reducedMotion: false,

      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastStudyDate, streak } = get();
        
        if (lastStudyDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudyDate === yesterday.toDateString()) {
          set({ streak: streak + 1, lastStudyDate: today });
        } else {
          set({ streak: 1, lastStudyDate: today });
        }
      },

      addStudyTime: (minutes) => {
        const { totalStudyTime, dailyProgress } = get();
        set({
          totalStudyTime: totalStudyTime + minutes,
          dailyProgress: dailyProgress + minutes,
        });
        get().updateStreak();
      },

      setDailyGoal: (minutes) => set({ dailyGoal: minutes }),

      addFlashcardSet: (newSet) => {
        set((state) => ({
          flashcardSets: [...state.flashcardSets, newSet],
        }));
      },

      updateFlashcard: (setId, cardId, updates) => {
        set((state) => ({
          flashcardSets: state.flashcardSets.map((s) =>
            s.id === setId
              ? {
                  ...s,
                  cards: s.cards.map((c) =>
                    c.id === cardId ? { ...c, ...updates } : c
                  ),
                }
              : s
          ),
        }));
      },

      deleteFlashcardSet: (setId) => {
        set((state) => ({
          flashcardSets: state.flashcardSets.filter((s) => s.id !== setId),
        }));
      },

      addQuizResult: (result) => {
        set((state) => ({
          quizResults: [...state.quizResults, result],
        }));
      },

      addSummary: (summary) => {
        set((state) => ({
          summaries: [...state.summaries, summary],
        }));
      },

      unlockBadge: (badgeId) => {
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badgeId && !b.unlockedAt
              ? { ...b, unlockedAt: new Date() }
              : b
          ),
        }));
      },

      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      resetDailyProgress: () => set({ dailyProgress: 0 }),
    }),
    {
      name: 'study-ai-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
