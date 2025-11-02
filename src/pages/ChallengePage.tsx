import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ChallengeCard } from '../components/ChallengeCard';
import { useApp } from '../lib/context';
import { selectNextChallenge, UserPerformance } from '../lib/adaptiveLogic';
import { calculateNextReview, resultToQuality } from '../lib/spacedRepetition';
import { trackChallengeStart, trackChallengeEnd } from '../lib/analytics';
import { db } from '../lib/supabaseClient';
import words from '../data/words.json';
import challengeBank from '../data/challenge_bank.json';
import type { Word, Challenge, ChallengeLog } from '../types';
import { t, getRandomEncouragement } from '../lib/translations';

export function ChallengePage() {
  const navigate = useNavigate();
  const { userId, addXP, addBadge, language } = useApp();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'retry'>('success');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNextChallenge();
  }, []);

  const loadNextChallenge = async () => {
    setIsLoading(true);

    // Select random word (in production, use SR algorithm)
    const randomWord = words[Math.floor(Math.random() * words.length)] as Word;

    // Get user performance for this word
    const logs = await db.getChallengeHistory(userId, 10);
    const wordLogs = logs.filter((log: any) => log.word_id === randomWord.id);

    const performance: UserPerformance = {
      wordId: randomWord.id,
      recentAttempts: wordLogs as ChallengeLog[],
      successStreak: calculateSuccessStreak(wordLogs),
      failureCount: wordLogs.filter((log: any) => log.result === 'retry').length,
      avgHints: wordLogs.length > 0
        ? wordLogs.reduce((sum: number, log: any) => sum + log.hints_used, 0) / wordLogs.length
        : 0,
      avgTime: wordLogs.length > 0
        ? wordLogs.reduce((sum: number, log: any) => sum + log.time_taken, 0) / wordLogs.length
        : 0,
      lastStage: wordLogs.length > 0 ? wordLogs[0].stage : undefined,
    };

    const nextChallenge = selectNextChallenge(randomWord.id, performance);

    if (nextChallenge) {
      setCurrentWord(randomWord);
      setCurrentChallenge(nextChallenge as Challenge);
      trackChallengeStart(randomWord.id, nextChallenge.id, nextChallenge.stage);
    }

    setIsLoading(false);
  };

  const calculateSuccessStreak = (logs: any[]): number => {
    let streak = 0;
    for (const log of logs) {
      if (log.result === 'pass') streak++;
      else break;
    }
    return streak;
  };

  const handleChallengeComplete = async (
    result: 'pass' | 'retry',
    hintsUsed: number,
    timeTaken: number
  ) => {
    if (!currentWord || !currentChallenge) return;

    const xpEarned = result === 'pass' ? currentChallenge.scoring.xp : Math.floor(currentChallenge.scoring.xp / 2);

    // Log to Supabase
    const log: ChallengeLog = {
      word_id: currentWord.id,
      challenge_id: currentChallenge.id,
      result,
      time_taken: timeTaken,
      hints_used: hintsUsed,
      xp_earned: xpEarned,
      timestamp: new Date(),
    };

    await db.logChallenge({ ...log, user_id: userId, stage: currentChallenge.stage });

    // Track analytics
    trackChallengeEnd(
      currentWord.id,
      currentChallenge.id,
      result,
      timeTaken,
      hintsUsed,
      xpEarned
    );

    // Update SR state
    const quality = resultToQuality(result, hintsUsed, timeTaken);
    const currentSRState = await db.getSRState(userId, currentWord.id);
    const newSRState = calculateNextReview(currentSRState, {
      quality,
      wasHintUsed: hintsUsed > 0,
      timeSpent: timeTaken,
    });
    await db.updateSRState({ ...newSRState, user_id: userId, word_id: currentWord.id });

    // Award XP and badges
    addXP(xpEarned);

    if (currentChallenge.scoring.badge && result === 'pass') {
      addBadge(currentChallenge.scoring.badge);
    }

    // Show feedback
    setFeedbackType(result === 'pass' ? 'success' : 'retry');
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      loadNextChallenge();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  if (!currentWord || !currentChallenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">
            {language === 'en' ? 'No challenges available' : 'సవాళ్లు అందుబాటులో లేవు'}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            {language === 'en' ? 'Go Home' : 'హోమ్‌కి వెళ్లండి'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          {language === 'en' ? 'Back' : 'వెనుకకు'}
        </button>

        <AnimatePresence mode="wait">
          {!showFeedback && currentWord && currentChallenge && (
            <ChallengeCard
              key={currentChallenge.id}
              challenge={currentChallenge}
              word={currentWord}
              onComplete={handleChallengeComplete}
            />
          )}

          {showFeedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card max-w-2xl mx-auto text-center p-12"
            >
              {feedbackType === 'success' ? (
                <>
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {getRandomEncouragement(language)}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('youEarned', language)} +{currentChallenge.scoring.xp} XP
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto text-orange-500 mb-4" size={64} />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {t('encouragement.keepPracticing', language)}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('encouragement.almostThere', language)}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
