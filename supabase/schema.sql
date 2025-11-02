-- Draw & Learn MVP Database Schema
-- This schema supports anonymous learning analytics and adaptive challenge logic

-- Challenge Log Table
-- Tracks all challenge attempts with performance metrics
CREATE TABLE IF NOT EXISTS challenge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  result TEXT CHECK (result IN ('pass', 'retry', 'skip')),
  time_taken INTEGER, -- milliseconds
  hints_used INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_challenge_log_user ON challenge_log(user_id);
CREATE INDEX idx_challenge_log_word ON challenge_log(word_id);
CREATE INDEX idx_challenge_log_timestamp ON challenge_log(timestamp DESC);

-- Spaced Repetition State Table
-- Manages word review scheduling and mastery tracking
CREATE TABLE IF NOT EXISTS sr_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  next_due TIMESTAMPTZ NOT NULL,
  interval_days INTEGER DEFAULT 1,
  mastery_score DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_sr_state_user ON sr_state(user_id);
CREATE INDEX idx_sr_state_due ON sr_state(next_due);

-- Reflections Table
-- Stores weekly creative reflections and learning summaries
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  text TEXT,
  image_url TEXT,
  word_id TEXT,
  xp_awarded INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sentiment TEXT, -- AI-generated positive feedback
  moderated BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_week ON reflections(week_number);

-- Analytics Events Table
-- Captures interaction events for behavioral analysis
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  word_id TEXT,
  challenge_id TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Analytics Summary Table (Materialized View Alternative)
-- Pre-computed metrics for dashboard performance
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_challenges INTEGER DEFAULT 0,
  avg_pass_rate DECIMAL(5,2),
  avg_time_ms INTEGER,
  avg_hints DECIMAL(3,2),
  total_xp_earned INTEGER,
  unique_words_practiced INTEGER,
  reflection_completion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_summary_date ON analytics_summary(date DESC);

-- User Progress Table (Optional - for persistent user tracking)
-- Stores aggregate user progress metrics
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  words_mastered INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peer Gallery Table
-- Stores moderated reflections for peer showcase
CREATE TABLE IF NOT EXISTS peer_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID REFERENCES reflections(id),
  likes_count INTEGER DEFAULT 0,
  display_order INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functions and Triggers

-- Auto-update last_active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, last_active)
  VALUES (NEW.user_id, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_active
AFTER INSERT ON challenge_log
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Calculate pass rate for analytics
CREATE OR REPLACE FUNCTION calculate_pass_rate(days INTEGER DEFAULT 7)
RETURNS DECIMAL AS $$
DECLARE
  pass_rate DECIMAL;
BEGIN
  SELECT
    COALESCE(
      (COUNT(*) FILTER (WHERE result = 'pass')::DECIMAL /
       NULLIF(COUNT(*), 0) * 100),
      0
    ) INTO pass_rate
  FROM challenge_log
  WHERE timestamp >= NOW() - INTERVAL '1 day' * days;

  RETURN pass_rate;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
-- Note: Since we're using anonymous user IDs, RLS is simplified

ALTER TABLE challenge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sr_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (refine based on auth strategy)
CREATE POLICY "Allow anonymous access" ON challenge_log FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON sr_state FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON reflections FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON user_progress FOR ALL USING (true);
CREATE POLICY "Allow read access" ON peer_gallery FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON analytics_events FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE challenge_log IS 'Stores all challenge attempts with performance metrics for analytics and adaptive logic';
COMMENT ON TABLE sr_state IS 'Manages spaced repetition scheduling for optimal word retention';
COMMENT ON TABLE reflections IS 'Weekly creative reflections that build confidence and ownership';
COMMENT ON TABLE peer_gallery IS 'Moderated showcase of student work for peer recognition';
COMMENT ON COLUMN challenge_log.time_taken IS 'Time spent on challenge in milliseconds';
COMMENT ON COLUMN sr_state.mastery_score IS 'Score from 0.00 to 1.00 indicating word mastery level';
