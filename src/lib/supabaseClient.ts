import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helpers
export const db = {
  // Challenge logs
  async logChallenge(log: any) {
    const { data, error } = await supabase
      .from('challenge_log')
      .insert(log);
    if (error) console.error('Error logging challenge:', error);
    return data;
  },

  async getChallengeHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('challenge_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) console.error('Error fetching challenge history:', error);
    return data || [];
  },

  // Spaced repetition state
  async updateSRState(state: any) {
    const { data, error } = await supabase
      .from('sr_state')
      .upsert(state, { onConflict: 'user_id,word_id' });
    if (error) console.error('Error updating SR state:', error);
    return data;
  },

  async getSRState(userId: string, wordId: string) {
    const { data, error } = await supabase
      .from('sr_state')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching SR state:', error);
    }
    return data;
  },

  async getDueWords(userId: string) {
    const { data, error } = await supabase
      .from('sr_state')
      .select('*')
      .eq('user_id', userId)
      .lte('next_due', new Date().toISOString());
    if (error) console.error('Error fetching due words:', error);
    return data || [];
  },

  // Reflections
  async saveReflection(reflection: any) {
    const { data, error } = await supabase
      .from('reflections')
      .insert(reflection);
    if (error) console.error('Error saving reflection:', error);
    return data;
  },

  async getReflections(userId: string, weekNumber?: number) {
    let query = supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (weekNumber) {
      query = query.eq('week_number', weekNumber);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching reflections:', error);
    return data || [];
  },

  // Analytics
  async logAnalyticsEvent(event: any) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event);
    if (error) console.error('Error logging analytics event:', error);
    return data;
  },

  async getAnalyticsSummary(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('challenge_log')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Error fetching analytics summary:', error);
      return null;
    }

    // Calculate metrics
    const total = data.length;
    const passed = data.filter(d => d.result === 'pass').length;
    const totalTime = data.reduce((sum, d) => sum + (d.time_taken || 0), 0);
    const totalHints = data.reduce((sum, d) => sum + (d.hints_used || 0), 0);

    return {
      total_challenges: total,
      pass_rate: total > 0 ? (passed / total) * 100 : 0,
      avg_time: total > 0 ? totalTime / total : 0,
      avg_hints: total > 0 ? totalHints / total : 0,
      total_xp: data.reduce((sum, d) => sum + (d.xp_earned || 0), 0),
      unique_words: new Set(data.map(d => d.word_id)).size,
    };
  },
};
