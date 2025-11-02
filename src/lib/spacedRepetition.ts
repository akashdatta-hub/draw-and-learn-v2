import { SpacedRepetitionState } from '../types';

/**
 * Spaced Repetition Algorithm
 * Implements a simplified SM-2 algorithm adapted for confidence-based learning
 */

export interface ReviewResult {
  quality: number; // 0-5 rating (0=complete fail, 5=perfect recall)
  wasHintUsed: boolean;
  timeSpent: number;
}

/**
 * Calculates the next review date and interval
 * Based on SM-2 algorithm with modifications for young learners
 */
export function calculateNextReview(
  currentState: SpacedRepetitionState | null,
  reviewResult: ReviewResult
): SpacedRepetitionState {
  const { quality, wasHintUsed, timeSpent } = reviewResult;

  // Penalize quality if hints were used
  const adjustedQuality = wasHintUsed ? Math.max(0, quality - 1) : quality;

  // Initialize or update mastery score (0.0 - 1.0)
  let masteryScore = currentState?.mastery_score || 0;
  let intervalDays = currentState?.interval_days || 1;
  let reviewCount = (currentState?.review_count || 0) + 1;

  // Update mastery score based on performance
  // Good performance increases mastery, poor performance decreases it
  if (adjustedQuality >= 4) {
    masteryScore = Math.min(1.0, masteryScore + 0.15);
  } else if (adjustedQuality >= 3) {
    masteryScore = Math.min(1.0, masteryScore + 0.08);
  } else if (adjustedQuality >= 2) {
    masteryScore = Math.max(0, masteryScore - 0.05);
  } else {
    masteryScore = Math.max(0, masteryScore - 0.15);
  }

  // Calculate next interval using modified SM-2
  if (adjustedQuality < 3) {
    // Reset interval on poor performance
    intervalDays = 1;
  } else {
    // Increase interval based on mastery
    if (reviewCount === 1) {
      intervalDays = 1;
    } else if (reviewCount === 2) {
      intervalDays = 3;
    } else {
      // Exponential growth with mastery multiplier
      const masteryMultiplier = 0.5 + masteryScore * 0.5; // 0.5-1.0
      intervalDays = Math.round(intervalDays * 2 * masteryMultiplier);
    }
  }

  // Cap intervals for young learners (max 14 days)
  intervalDays = Math.min(intervalDays, 14);

  // Calculate next due date
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + intervalDays);

  return {
    word_id: currentState?.word_id || '',
    next_due: nextDue,
    interval_days: intervalDays,
    mastery_score: masteryScore,
    review_count: reviewCount,
  };
}

/**
 * Converts challenge result to review quality score
 */
export function resultToQuality(
  result: string,
  hintsUsed: number,
  timeSpent: number,
  expectedTime: number = 45000 // 45 seconds
): number {
  if (result === 'skip') return 0;

  if (result === 'retry') return 1;

  // Base score for passing
  let quality = 4;

  // Adjust based on hints
  if (hintsUsed === 0) quality = 5;
  else if (hintsUsed === 1) quality = 4;
  else if (hintsUsed >= 2) quality = 3;

  // Penalize if took too long (indicates struggle)
  if (timeSpent > expectedTime * 2) {
    quality = Math.max(1, quality - 1);
  }

  return quality;
}

/**
 * Determines if a word is due for review
 */
export function isDue(state: SpacedRepetitionState): boolean {
  const now = new Date();
  const dueDate = new Date(state.next_due);
  return dueDate <= now;
}

/**
 * Gets priority score for word selection (higher = more urgent)
 */
export function getPriority(state: SpacedRepetitionState): number {
  const now = new Date();
  const dueDate = new Date(state.next_due);
  const daysPastDue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);

  // Priority increases with days overdue and decreases with mastery
  const urgency = Math.max(0, daysPastDue);
  const masteryPenalty = 1 - state.mastery_score;

  return urgency * 10 + masteryPenalty * 5;
}

/**
 * Selects next words to review based on SR algorithm
 */
export function selectWordsToReview(
  states: SpacedRepetitionState[],
  limit: number = 5
): SpacedRepetitionState[] {
  return states
    .filter(isDue)
    .sort((a, b) => getPriority(b) - getPriority(a))
    .slice(0, limit);
}

/**
 * Calculates retention rate for analytics
 */
export function calculateRetentionRate(states: SpacedRepetitionState[]): number {
  if (states.length === 0) return 0;

  const masteryThreshold = 0.6;
  const masteredWords = states.filter((s) => s.mastery_score >= masteryThreshold).length;

  return (masteredWords / states.length) * 100;
}

/**
 * Generates study schedule recommendation
 */
export function generateStudySchedule(
  states: SpacedRepetitionState[]
): { today: number; thisWeek: number; nextWeek: number } {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const twoWeeksEnd = new Date(now);
  twoWeeksEnd.setDate(twoWeeksEnd.getDate() + 14);

  let today = 0;
  let thisWeek = 0;
  let nextWeek = 0;

  states.forEach((state) => {
    const dueDate = new Date(state.next_due);

    if (dueDate.toDateString() === now.toDateString()) {
      today++;
    } else if (dueDate <= weekEnd) {
      thisWeek++;
    } else if (dueDate <= twoWeeksEnd) {
      nextWeek++;
    }
  });

  return { today, thisWeek, nextWeek };
}
