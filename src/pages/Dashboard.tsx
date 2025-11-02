import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Clock, Lightbulb, Target, Award } from 'lucide-react';
import { useApp } from '../lib/context';
import { db } from '../lib/supabaseClient';

export function Dashboard() {
  const navigate = useNavigate();
  const { language, userId } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    const summary = await db.getAnalyticsSummary(userId, 30);
    setAnalytics(summary);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  const metrics = [
    {
      icon: Target,
      label: language === 'en' ? 'Pass Rate' : 'విజయ రేటు',
      value: analytics ? `${Math.round(analytics.pass_rate)}%` : '0%',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      label: language === 'en' ? 'Avg. Time' : 'సగటు సమయం',
      value: analytics ? `${Math.round(analytics.avg_time / 1000)}s` : '0s',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Lightbulb,
      label: language === 'en' ? 'Hints Used' : 'ఉపయోగించిన సూచనలు',
      value: analytics ? analytics.avg_hints.toFixed(1) : '0',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Award,
      label: language === 'en' ? 'Total XP' : 'మొత్తం XP',
      value: analytics ? analytics.total_xp : '0',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          {language === 'en' ? 'Back' : 'వెనుకకు'}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">
              {language === 'en' ? 'Learning Analytics' : 'అభ్యాస విశ్లేషణలు'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Track your progress and growth'
              : 'మీ పురోగతి మరియు ఎదుగుదలను ట్రాక్ చేయండి'}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-4">
                <div className={`${metric.bgColor} p-4 rounded-xl ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {language === 'en' ? 'Learning Progress' : 'అభ్యాస పురోగతి'}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {language === 'en' ? 'Words Learned' : 'నేర్చుకున్న పదాలు'}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {analytics ? `${analytics.unique_words}/50` : '0/50'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: analytics ? `${(analytics.unique_words / 50) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {language === 'en' ? 'Challenges Completed' : 'పూర్తి చేసిన సవాళ్లు'}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {analytics ? analytics.total_challenges : 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: analytics ? `${Math.min((analytics.total_challenges / 100) * 100, 100)}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {language === 'en' ? 'Insights' : 'అంతర్దృష్టులు'}
            </h3>
            <div className="space-y-3">
              {analytics && analytics.pass_rate >= 70 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-green-800">
                      {language === 'en' ? 'Great Performance!' : 'గొప్ప పనితీరు!'}
                    </p>
                    <p className="text-sm text-green-700">
                      {language === 'en'
                        ? 'Your pass rate shows strong understanding'
                        : 'మీ విజయ రేటు బలమైన అవగాహనను చూపుతుంది'}
                    </p>
                  </div>
                </div>
              )}

              {analytics && analytics.avg_hints > 2 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-yellow-800">
                      {language === 'en' ? 'Practice More' : 'మరింత అభ్యసించండి'}
                    </p>
                    <p className="text-sm text-yellow-700">
                      {language === 'en'
                        ? 'Try using fewer hints to build confidence'
                        : 'ఆత్మవిశ్వాసం పెంచుకోవడానికి తక్కువ సూచనలను ఉపయోగించండి'}
                    </p>
                  </div>
                </div>
              )}

              {!analytics || analytics.total_challenges === 0 && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">
                      {language === 'en' ? 'Start Your Journey' : 'మీ ప్రయాణం ప్రారంభించండి'}
                    </p>
                    <p className="text-sm text-blue-700">
                      {language === 'en'
                        ? 'Complete challenges to see your progress here'
                        : 'మీ పురోగతిని ఇక్కడ చూడటానికి సవాళ్లను పూర్తి చేయండి'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Educator Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-gradient-to-r from-indigo-50 to-purple-50 mt-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {language === 'en' ? 'For Educators' : 'ఉపాధ్యాయుల కోసం'}
          </h3>
          <p className="text-sm text-gray-700">
            {language === 'en'
              ? 'This dashboard shows anonymized learning metrics to help track progress. All data is stored securely and used only for educational improvement.'
              : 'ఈ డాష్‌బోర్డ్ పురోగతిని ట్రాక్ చేయడంలో సహాయపడే అనామక అభ్యాస మెట్రిక్‌లను చూపిస్తుంది. అన్ని డేటా సురక్షితంగా నిల్వ చేయబడుతుంది మరియు విద్యా మెరుగుదల కోసం మాత్రమే ఉపయోగించబడుతుంది.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
