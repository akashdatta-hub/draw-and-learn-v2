import { Challenge, ChallengeLog, Stage, DifficultyBand, PerformanceMetrics } from '../types';
import challengeBank from '../data/challenge_bank.json';

/**
 * Adaptive Challenge Selection Logic
 * Implements the stage progression system: Understand → Try → Review → Retry → Challenge
 */

export interface UserPerformance {
  wordId: string;
  recentAttempts: ChallengeLog[];
  successStreak: number;
  failureCount: number;
  avgHints: number;
  avgTime: number;
  lastStage?: Stage;
}

/**
 * Determines the next appropriate stage based on user performance
 */
export function selectNextStage(performance: UserPerformance): Stage {
  const { recentAttempts, successStreak, failureCount, lastStage } = performance;

  // First time seeing this word → Understand
  if (!lastStage || recentAttempts.length === 0) {
    return 'understand';
  }

  // Failed recent challenges → Retry
  if (failureCount > 0 && successStreak === 0) {
    return 'retry';
  }

  // Stage progression logic based on build_plan_v2.md
  switch (lastStage) {
    case 'understand':
      // Two correct attempts → advance to Try
      if (successStreak >= 2) {
        return 'try';
      }
      return 'understand';

    case 'try':
      // One correct with low hints → advance to Review
      const lastAttempt = recentAttempts[0];
      if (successStreak >= 1 && lastAttempt.hints_used <= 1) {
        return 'review';
      }
      return 'try';

    case 'review':
      // Missed review → Retry
      if (failureCount > 0) {
        return 'retry';
      }
      // Consistent success → Challenge
      if (successStreak >= 2) {
        return 'challenge';
      }
      return 'review';

    case 'retry':
      // Success in retry → back to Try
      if (successStreak >= 1) {
        return 'try';
      }
      return 'retry';

    case 'challenge':
      // Stay in challenge for creative expression
      return 'challenge';

    default:
      return 'understand';
  }
}

/**
 * Adjusts difficulty based on performance metrics
 */
export function adjustDifficulty(performance: UserPerformance): DifficultyBand {
  const { successStreak, avgHints, avgTime } = performance;

  // High performance → increase difficulty
  if (successStreak >= 3 && avgHints <= 0.5 && avgTime < 30000) {
    return 'hard';
  }

  // Good performance → medium difficulty
  if (successStreak >= 2 && avgHints <= 1) {
    return 'medium';
  }

  // Struggling → easier difficulty
  if (avgHints >= 2 || successStreak === 0) {
    return 'easy';
  }

  // Default → very easy for new learners
  return 'very_easy';
}

/**
 * Selects the next challenge using weighted random selection
 */
export function selectNextChallenge(
  wordId: string,
  performance: UserPerformance
): Challenge | null {
  const targetStage = selectNextStage(performance);
  const targetDifficulty = adjustDifficulty(performance);

  // Filter challenges by stage and difficulty
  const candidates = (challengeBank as Challenge[]).filter(
    (c) => c.stage === targetStage && c.difficulty_band === targetDifficulty
  );

  // If no exact match, relax difficulty constraint
  if (candidates.length === 0) {
    const relaxedCandidates = (challengeBank as Challenge[]).filter(
      (c) => c.stage === targetStage
    );
    if (relaxedCandidates.length > 0) {
      return weightedRandomSelection(relaxedCandidates, performance);
    }
    return null;
  }

  return weightedRandomSelection(candidates, performance);
}

/**
 * Weighted random selection that favors unexplored modalities
 */
function weightedRandomSelection(
  candidates: Challenge[],
  performance: UserPerformance
): Challenge {
  // Calculate modality coverage
  const usedModalities = new Set(
    performance.recentAttempts.flatMap((a) => {
      const challenge = challengeBank.find((c) => c.id === a.challenge_id);
      return challenge?.modality || [];
    })
  );

  // Assign weights (higher for unused modalities)
  const weights = candidates.map((c) => {
    const unusedModalityCount = c.modality.filter(
      (m) => !usedModalities.has(m)
    ).length;
    return unusedModalityCount > 0 ? unusedModalityCount + 1 : 1;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return candidates[i];
    }
  }

  return candidates[candidates.length - 1];
}

/**
 * Calculates performance metrics from recent challenge logs
 */
export function calculatePerformance(logs: ChallengeLog[]): PerformanceMetrics {
  if (logs.length === 0) {
    return {
      pass_rate: 0,
      avg_time: 0,
      avg_hints: 0,
      confidence_index: 0,
      success_streak: 0,
    };
  }

  const passCount = logs.filter((l) => l.result === 'pass').length;
  const totalTime = logs.reduce((sum, l) => sum + l.time_taken, 0);
  const totalHints = logs.reduce((sum, l) => sum + l.hints_used, 0);

  // Calculate success streak
  let successStreak = 0;
  for (const log of logs) {
    if (log.result === 'pass') {
      successStreak++;
    } else {
      break;
    }
  }

  // Confidence index: success rate minus hint dependency
  const passRate = passCount / logs.length;
  const avgHints = totalHints / logs.length;
  const confidenceIndex = Math.max(0, passRate - avgHints * 0.1);

  return {
    pass_rate: passRate * 100,
    avg_time: totalTime / logs.length,
    avg_hints: avgHints,
    confidence_index: confidenceIndex * 100,
    success_streak: successStreak,
  };
}

/**
 * Determines if user is ready for challenge stage
 */
export function isReadyForChallenge(performance: UserPerformance): boolean {
  const metrics = calculatePerformance(performance.recentAttempts);
  return (
    metrics.success_streak >= 3 &&
    metrics.avg_hints <= 1 &&
    metrics.confidence_index >= 70
  );
}

/**
 * Provides hint level based on performance
 * Returns: 'full' | 'partial' | 'minimal'
 */
export function getHintLevel(performance: UserPerformance): string {
  const { successStreak, avgHints } = performance;

  if (successStreak === 0 && avgHints >= 2) {
    return 'full'; // Telugu translation + example sentence
  }

  if (successStreak <= 1 && avgHints >= 1) {
    return 'partial'; // Telugu translation only
  }

  return 'minimal'; // Encouragement only
}
