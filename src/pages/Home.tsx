import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Image, BarChart3, Sparkles } from 'lucide-react';
import { useApp } from '../lib/context';
import words from '../data/words.json';
import { db } from '../lib/supabaseClient';
import { t, getGreeting } from '../lib/translations';

export function Home() {
  const { language, totalXP, badges, userId } = useApp();
  const [stats, setStats] = useState({
    wordsLearned: 0,
    challengesCompleted: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    // Load user stats
    db.getAnalyticsSummary(userId, 30).then((summary) => {
      if (summary) {
        setStats({
          wordsLearned: summary.unique_words,
          challengesCompleted: summary.total_challenges,
          currentStreak: 0, // Calculate from logs if needed
        });
      }
    });
  }, [userId]);

  const features = [
    {
      icon: BookOpen,
      title: t('startLearning', language),
      subtitle: language === 'en' ? 'Practice vocabulary' : 'పదాలు ప్రాక్టీస్ చేయి',
      link: '/challenge',
      color: 'bg-blue-500',
    },
    {
      icon: Image,
      title: t('gallery', language),
      subtitle: language === 'en' ? 'See your drawings' : 'నీ డ్రాయింగ్స్ చూడు',
      link: '/gallery',
      color: 'bg-purple-500',
    },
    {
      icon: Sparkles,
      title: t('reflection', language),
      subtitle: language === 'en' ? 'Weekly review' : 'వీక్లీ రివ్యూ',
      link: '/reflection',
      color: 'bg-green-500',
    },
    {
      icon: BarChart3,
      title: t('dashboard', language),
      subtitle: language === 'en' ? 'View analytics' : 'స్టాట్స్ చూడు',
      link: '/dashboard',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-xl text-primary-600 mb-3">{getGreeting(language)}</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            {t('welcomeTitle', language)}
          </h1>
          <p className="text-xl text-gray-600">
            {t('welcomeSubtitle', language)}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          >
            <div className="text-3xl font-bold">{totalXP}</div>
            <div className="text-sm opacity-90">
              {t('totalXP', language)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
          >
            <div className="text-3xl font-bold">{stats.wordsLearned}</div>
            <div className="text-sm opacity-90">
              {t('wordsLearned', language)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          >
            <div className="text-3xl font-bold">{stats.challengesCompleted}</div>
            <div className="text-sm opacity-90">
              {t('challengesCompleted', language)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white"
          >
            <div className="text-3xl font-bold">{badges.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Badges' : 'బ్యాడ్జ్‌లు'}
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Link to={feature.link}>
                <div className="card hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`${feature.color} p-4 rounded-xl text-white`}>
                      <feature.icon size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                      <p className="text-gray-600">{feature.subtitle}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Badges Display */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="card bg-gradient-to-r from-yellow-50 to-orange-50"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-yellow-600" size={24} />
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'en' ? 'Your Badges' : 'మీ బ్యాడ్జ్‌లు'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="badge bg-yellow-100 text-yellow-800 border border-yellow-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          {language === 'en'
            ? `${words.length} words available to learn`
            : `నేర్చుకోవడానికి ${words.length} పదాలు అందుబాటులో ఉన్నాయి`}
        </motion.div>
      </div>
    </div>
  );
}
