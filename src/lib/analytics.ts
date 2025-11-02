import { AnalyticsEvent } from '../types';
import { db } from './supabaseClient';

/**
 * Analytics Tracking System
 * Implements event tracking per analytics_v2.md specifications
 */

export type EventType =
  | 'challenge_start'
  | 'challenge_end'
  | 'challenge_hint_used'
  | 'challenge_feedback_shown'
  | 'reflection_submitted'
  | 'ai_hint_clicked'
  | 'word_selected'
  | 'tts_used'
  | 'language_toggled'
  | 'badge_earned'
  | 'gallery_viewed'
  | 'session_start'
  | 'session_end';

interface AnalyticsConfig {
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  enableSupabase: boolean;
}

const config: AnalyticsConfig = {
  enableConsoleLogging: import.meta.env.DEV,
  enableLocalStorage: true,
  enableSupabase: true,
};

/**
 * Tracks an analytics event
 */
export async function trackEvent(
  eventType: EventType,
  metadata?: Record<string, any>
): Promise<void> {
  const event: AnalyticsEvent = {
    event_type: eventType,
    word_id: metadata?.word_id,
    challenge_id: metadata?.challenge_id,
    metadata,
    timestamp: new Date(),
  };

  // Console logging in development
  if (config.enableConsoleLogging) {
    console.log('[Analytics]', eventType, metadata);
  }

  // Local storage for offline fallback
  if (config.enableLocalStorage) {
    saveToLocalStorage(event);
  }

  // Send to Supabase
  if (config.enableSupabase) {
    try {
      await db.logAnalyticsEvent(event);
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  // Microsoft Clarity custom event
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity('event', eventType, metadata);
  }
}

/**
 * Tracks challenge start
 */
export function trackChallengeStart(
  wordId: string,
  challengeId: string,
  stage: string
): void {
  trackEvent('challenge_start', {
    word_id: wordId,
    challenge_id: challengeId,
    stage,
  });
}

/**
 * Tracks challenge completion
 */
export function trackChallengeEnd(
  wordId: string,
  challengeId: string,
  result: string,
  timeTaken: number,
  hintsUsed: number,
  xpEarned: number
): void {
  trackEvent('challenge_end', {
    word_id: wordId,
    challenge_id: challengeId,
    result,
    time_taken: timeTaken,
    hints_used: hintsUsed,
    xp_earned: xpEarned,
  });
}

/**
 * Tracks hint usage
 */
export function trackHintUsed(
  wordId: string,
  challengeId: string,
  hintType: string
): void {
  trackEvent('challenge_hint_used', {
    word_id: wordId,
    challenge_id: challengeId,
    hint_type: hintType,
  });
}

/**
 * Tracks AI feedback display
 */
export function trackFeedback(
  wordId: string,
  challengeId: string,
  feedbackType: string
): void {
  trackEvent('challenge_feedback_shown', {
    word_id: wordId,
    challenge_id: challengeId,
    feedback_type: feedbackType,
  });
}

/**
 * Tracks reflection submission
 */
export function trackReflectionSubmitted(
  weekNumber: number,
  hasText: boolean,
  hasImage: boolean,
  xpAwarded: number
): void {
  trackEvent('reflection_submitted', {
    week_number: weekNumber,
    has_text: hasText,
    has_image: hasImage,
    xp_awarded: xpAwarded,
  });
}

/**
 * Tracks TTS usage
 */
export function trackTTSUsed(wordId: string, language: string): void {
  trackEvent('tts_used', {
    word_id: wordId,
    language,
  });
}

/**
 * Tracks language toggle
 */
export function trackLanguageToggled(fromLang: string, toLang: string): void {
  trackEvent('language_toggled', {
    from_language: fromLang,
    to_language: toLang,
  });
}

/**
 * Tracks badge earned
 */
export function trackBadgeEarned(badgeName: string, totalXP: number): void {
  trackEvent('badge_earned', {
    badge_name: badgeName,
    total_xp: totalXP,
  });
}

/**
 * Local storage management for offline analytics
 */
const STORAGE_KEY = 'draw_learn_analytics_queue';

function saveToLocalStorage(event: AnalyticsEvent): void {
  try {
    const queue = getLocalStorageQueue();
    queue.push(event);

    // Keep only last 100 events
    if (queue.length > 100) {
      queue.shift();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save analytics to localStorage:', error);
  }
}

function getLocalStorageQueue(): AnalyticsEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Syncs local analytics queue to Supabase
 */
export async function syncLocalAnalytics(): Promise<void> {
  const queue = getLocalStorageQueue();

  if (queue.length === 0) return;

  try {
    // Send all queued events
    for (const event of queue) {
      await db.logAnalyticsEvent(event);
    }

    // Clear queue after successful sync
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Analytics] Synced', queue.length, 'events');
  } catch (error) {
    console.error('Failed to sync local analytics:', error);
  }
}

/**
 * Session tracking
 */
let sessionStartTime: number | null = null;

export function startSession(userId: string): void {
  sessionStartTime = Date.now();
  trackEvent('session_start', { user_id: userId });
}

export function endSession(userId: string): void {
  if (sessionStartTime) {
    const sessionDuration = Date.now() - sessionStartTime;
    trackEvent('session_end', {
      user_id: userId,
      duration_ms: sessionDuration,
    });
    sessionStartTime = null;
  }
}

/**
 * Aggregated metrics calculation
 */
export interface SessionMetrics {
  totalChallenges: number;
  passRate: number;
  avgTime: number;
  totalXP: number;
  hintsUsed: number;
  wordsLearned: number;
}

export function calculateSessionMetrics(events: AnalyticsEvent[]): SessionMetrics {
  const challengeEndEvents = events.filter((e) => e.event_type === 'challenge_end');

  const totalChallenges = challengeEndEvents.length;
  const passed = challengeEndEvents.filter(
    (e) => e.metadata?.result === 'pass'
  ).length;
  const totalTime = challengeEndEvents.reduce(
    (sum, e) => sum + (e.metadata?.time_taken || 0),
    0
  );
  const totalXP = challengeEndEvents.reduce(
    (sum, e) => sum + (e.metadata?.xp_earned || 0),
    0
  );
  const totalHints = challengeEndEvents.reduce(
    (sum, e) => sum + (e.metadata?.hints_used || 0),
    0
  );
  const uniqueWords = new Set(challengeEndEvents.map((e) => e.word_id)).size;

  return {
    totalChallenges,
    passRate: totalChallenges > 0 ? (passed / totalChallenges) * 100 : 0,
    avgTime: totalChallenges > 0 ? totalTime / totalChallenges : 0,
    totalXP,
    hintsUsed: totalHints,
    wordsLearned: uniqueWords,
  };
}

/**
 * Initialize Microsoft Clarity
 */
export function initializeClarity(): void {
  const clarityId = import.meta.env.VITE_CLARITY_ID;

  if (!clarityId || typeof window === 'undefined') return;

  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);

  console.log('[Analytics] Microsoft Clarity initialized');
}

/**
 * Auto-sync analytics on page load and before unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    syncLocalAnalytics();
  });

  window.addEventListener('beforeunload', () => {
    syncLocalAnalytics();
  });
}
