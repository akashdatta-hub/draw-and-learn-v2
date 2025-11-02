// Core Types for Draw & Learn MVP

export type DifficultyBand = 'very_easy' | 'easy' | 'medium' | 'hard';
export type Stage = 'understand' | 'try' | 'review' | 'retry' | 'challenge';
export type Modality = 'drawing' | 'listening' | 'reading' | 'writing' | 'speaking';
export type Mechanic =
  | 'draw_trace'
  | 'draw_free'
  | 'draw_plus_caption'
  | 'mcq_3'
  | 'mcq_4'
  | 'fill_blank'
  | 'match_pairs'
  | 'listen_choose'
  | 'sentence_build'
  | 'telugu_to_english'
  | 'english_to_telugu';

export type ChallengeResult = 'pass' | 'retry' | 'skip';

export interface Word {
  id: string;
  english: string;
  telugu: string;
  difficulty: DifficultyBand;
  category?: string;
  imageUrl?: string;
}

export interface Challenge {
  id: string;
  stage: Stage;
  framework: {
    bloom: string;
    nation?: string;
  };
  modality: Modality[];
  mechanic: Mechanic;
  difficulty_band: DifficultyBand;
  scoring: {
    xp: number;
    stars: number;
    badge?: string;
  };
  tts_required?: boolean;
  prompt?: string;
}

export interface ChallengeLog {
  id?: string;
  word_id: string;
  challenge_id: string;
  result: ChallengeResult;
  time_taken: number;
  hints_used: number;
  xp_earned: number;
  timestamp: Date;
}

export interface SpacedRepetitionState {
  word_id: string;
  next_due: Date;
  interval_days: number;
  mastery_score: number;
  review_count: number;
}

export interface Reflection {
  id?: string;
  user_id: string;
  week_number: number;
  text?: string;
  image_url?: string;
  word_id?: string;
  xp_awarded: number;
  timestamp: Date;
}

export interface UserProgress {
  user_id: string;
  total_xp: number;
  words_mastered: number;
  challenges_completed: number;
  current_streak: number;
  badges: string[];
}

export interface AnalyticsEvent {
  event_type: string;
  word_id?: string;
  challenge_id?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface PerformanceMetrics {
  pass_rate: number;
  avg_time: number;
  avg_hints: number;
  confidence_index: number;
  success_streak: number;
}
