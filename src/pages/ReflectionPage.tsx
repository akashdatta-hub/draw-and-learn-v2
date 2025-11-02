import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import { DrawCanvas } from '../components/DrawCanvas';
import { useApp } from '../lib/context';
import { db } from '../lib/supabaseClient';
import { trackReflectionSubmitted } from '../lib/analytics';
import words from '../data/words.json';

export function ReflectionPage() {
  const navigate = useNavigate();
  const { userId, addXP, language } = useApp();
  const [weekNumber, setWeekNumber] = useState(1);
  const [summary, setSummary] = useState('');
  const [selectedWord, setSelectedWord] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [showDrawing, setShowDrawing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    generateSummary();
  }, [userId]);

  const generateSummary = async () => {
    // Get user's analytics for the past week
    const analytics = await db.getAnalyticsSummary(userId, 7);

    if (analytics) {
      const summaryText =
        language === 'en'
          ? `This week, you practiced ${analytics.unique_words} words and completed ${analytics.total_challenges} challenges! Your pass rate is ${Math.round(analytics.pass_rate)}%. You're getting better at vocabulary!`
          : `ఈ వారం, మీరు ${analytics.unique_words} పదాలను అభ్యసించారు మరియు ${analytics.total_challenges} సవాళ్లను పూర్తి చేశారు! మీ విజయ రేటు ${Math.round(analytics.pass_rate)}%. మీరు పదజాలంలో మెరుగుపడుతున్నారు!`;

      setSummary(summaryText);
    } else {
      setSummary(
        language === 'en'
          ? "Welcome! Start your learning journey and come back here to reflect on your progress."
          : "స్వాగతం! మీ అభ్యాస ప్రయాణం ప్రారంభించండి మరియు మీ పురోగతిని ప్రతిబింబించడానికి ఇక్కడకు తిరిగి రండి."
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedWord && !reflectionText && !drawingData) {
      return;
    }

    const xpAwarded = 50; // Bonus XP for reflection

    const reflection = {
      user_id: userId,
      week_number: weekNumber,
      text: reflectionText || null,
      image_url: drawingData || null,
      word_id: selectedWord || null,
      xp_awarded: xpAwarded,
      timestamp: new Date(),
      sentiment: 'positive',
      moderated: false,
    };

    await db.saveReflection(reflection);
    trackReflectionSubmitted(
      weekNumber,
      !!reflectionText,
      !!drawingData,
      xpAwarded
    );

    addXP(xpAwarded);
    setIsSubmitted(true);

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-2xl text-center p-12"
        >
          <Sparkles className="mx-auto text-yellow-500 mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Amazing!' : 'అద్భుతం!'}
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            {language === 'en'
              ? 'Your reflection has been saved!'
              : 'మీ ప్రతిబింబం సేవ్ చేయబడింది!'}
          </p>
          <p className="text-2xl font-bold text-primary-600">+50 XP</p>
        </motion.div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Section */}
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'en' ? 'Weekly Summary' : 'వారపు సారాంశం'}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">{summary}</p>
          </div>

          {/* Reflection Form */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {language === 'en'
                ? 'Share Your Learning'
                : 'మీ అభ్యాసాన్ని పంచుకోండి'}
            </h3>

            {/* Word Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en'
                  ? 'Choose one word you liked most:'
                  : 'మీకు ఎక్కువ నచ్చిన ఒక పదాన్ని ఎంచుకోండి:'}
              </label>
              <select
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="">
                  {language === 'en' ? 'Select a word...' : 'ఒక పదాన్ని ఎంచుకోండి...'}
                </option>
                {words.slice(0, 10).map((word: any) => (
                  <option key={word.id} value={word.id}>
                    {word.english} - {word.telugu}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Reflection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en'
                  ? 'Write about what you learned:'
                  : 'మీరు ఏమి నేర్చుకున్నారో వ్రాయండి:'}
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder={
                  language === 'en'
                    ? 'I learned that...'
                    : 'నేను నేర్చుకున్నది...'
                }
              />
            </div>

            {/* Drawing Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en'
                  ? 'Or draw something about your favorite word:'
                  : 'లేదా మీకు ఇష్టమైన పదం గురించి ఏదైనా గీయండి:'}
              </label>
              {!showDrawing ? (
                <button
                  onClick={() => setShowDrawing(true)}
                  className="btn-secondary"
                >
                  {language === 'en' ? 'Start Drawing' : 'గీయడం ప్రారంభించండి'}
                </button>
              ) : (
                <DrawCanvas onComplete={(dataUrl) => setDrawingData(dataUrl)} />
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedWord && !reflectionText && !drawingData}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {language === 'en' ? 'Submit Reflection' : 'ప్రతిబింబాన్ని సమర్పించండి'}
            </button>

            <p className="text-sm text-gray-500 text-center mt-4">
              {language === 'en'
                ? 'Earn +50 XP for completing your weekly reflection!'
                : 'మీ వారపు ప్రతిబింబాన్ని పూర్తి చేసినందుకు +50 XP సంపాదించండి!'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
