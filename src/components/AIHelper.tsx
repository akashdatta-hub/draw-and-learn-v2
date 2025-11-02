import React, { useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '../lib/tts';
import { useApp } from '../lib/context';
import { trackHintUsed, trackTTSUsed } from '../lib/analytics';

interface AIHelperProps {
  word: { english: string; telugu: string };
  challengeId: string;
  hintLevel?: 'full' | 'partial' | 'minimal';
  onHintUsed?: () => void;
}

export function AIHelper({ word, challengeId, hintLevel = 'full', onHintUsed }: AIHelperProps) {
  const { language } = useApp();
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const handleHintClick = () => {
    setShowHint(true);
    setHintCount((prev) => prev + 1);
    trackHintUsed(word.english, challengeId, hintLevel);
    if (onHintUsed) onHintUsed();
  };

  const handleTTS = () => {
    speak(word.english, { language: 'en' });
    trackTTSUsed(word.english, 'en');

    setTimeout(() => {
      speak(word.telugu, { language: 'te' });
      trackTTSUsed(word.english, 'te');
    }, 1500);
  };

  const getHintText = () => {
    if (hintLevel === 'minimal') {
      return language === 'en'
        ? "You're doing great! Think about what you know about this word."
        : "మీరు బాగా చేస్తున్నారు! ఈ పదం గురించి మీకు తెలిసినదాన్ని ఆలోచించండి.";
    }

    if (hintLevel === 'partial') {
      return language === 'en'
        ? `In Telugu, this word means: ${word.telugu}`
        : `తెలుగులో, ఈ పదం అర్థం: ${word.telugu}`;
    }

    // Full hint
    const examples: Record<string, string> = {
      festival: 'We celebrate Diwali festival with lights.',
      village: 'My grandparents live in a village.',
      river: 'The Godavari river flows through Telangana.',
    };

    const example = examples[word.english] || `This is a ${word.english}.`;

    return language === 'en'
      ? `Telugu: ${word.telugu}\nExample: ${example}`
      : `తెలుగు: ${word.telugu}\nఉదాహరణ: ${example}`;
  };

  return (
    <div className="card bg-blue-50 border-2 border-blue-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-primary-500" size={20} />
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'AI Helper' : 'AI సహాయకుడు'}
            </h3>
          </div>

          {!showHint && (
            <button onClick={handleHintClick} className="btn-secondary text-sm">
              {language === 'en' ? 'Need a hint?' : 'సూచన కావాలా?'}
            </button>
          )}

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-white rounded-lg text-sm leading-relaxed whitespace-pre-line"
              >
                {getHintText()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleTTS}
          className="btn-secondary p-3 rounded-full"
          title={language === 'en' ? 'Listen to pronunciation' : 'ఉచ్ఛారణ వినండి'}
        >
          <Volume2 size={20} />
        </button>
      </div>

      {showHint && (
        <div className="mt-3 text-xs text-gray-600">
          {language === 'en'
            ? `Hints used: ${hintCount}`
            : `ఉపయోగించిన సూచనలు: ${hintCount}`}
        </div>
      )}
    </div>
  );
}
