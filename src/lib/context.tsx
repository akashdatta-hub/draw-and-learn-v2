import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackLanguageToggled, startSession } from './analytics';

/**
 * Global Application Context
 * Manages language preference, user ID, and global state
 */

export type LanguageType = 'en' | 'te';

interface AppContextType {
  language: LanguageType;
  toggleLanguage: () => void;
  userId: string;
  totalXP: number;
  addXP: (amount: number) => void;
  badges: string[];
  addBadge: (badge: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [language, setLanguage] = useState<LanguageType>('en');
  const [userId] = useState(() => {
    // Get or create anonymous user ID
    let id = localStorage.getItem('draw_learn_user_id');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('draw_learn_user_id', id);
    }
    return id;
  });
  const [totalXP, setTotalXP] = useState(() => {
    const saved = localStorage.getItem('draw_learn_total_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [badges, setBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('draw_learn_badges');
    return saved ? JSON.parse(saved) : [];
  });

  // Start session tracking
  useEffect(() => {
    startSession(userId);
  }, [userId]);

  // Save XP to localStorage
  useEffect(() => {
    localStorage.setItem('draw_learn_total_xp', totalXP.toString());
  }, [totalXP]);

  // Save badges to localStorage
  useEffect(() => {
    localStorage.setItem('draw_learn_badges', JSON.stringify(badges));
  }, [badges]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'te' : 'en';
      trackLanguageToggled(prev, newLang);
      return newLang;
    });
  };

  const addXP = (amount: number) => {
    setTotalXP((prev) => prev + amount);
  };

  const addBadge = (badge: string) => {
    if (!badges.includes(badge)) {
      setBadges((prev) => [...prev, badge]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        toggleLanguage,
        userId,
        totalXP,
        addXP,
        badges,
        addBadge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
