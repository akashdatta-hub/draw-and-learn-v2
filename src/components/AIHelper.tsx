import React, { useState } from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '../lib/tts';
import { useApp } from '../lib/context';
import { trackHintUsed, trackTTSUsed } from '../lib/analytics';
import { t } from '../lib/translations';

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
        ? "You're doing great! Think about what you already know about this word."
        : "బాగా చేస్తున్నావు! ఈ పదం గురించి నీకు తెలిసిన విషయాల గురించి ఆలోచించు.";
    }

    if (hintLevel === 'partial') {
      return language === 'en'
        ? `In Telugu, this word means: ${word.telugu}`
        : `తెలుగులో ఈ పదం అర్థం: ${word.telugu}`;
    }

    // Full hint with examples
    const examples: Record<string, { en: string; te: string }> = {
      festival: {
        en: 'We celebrate the Diwali festival with lights.',
        te: 'మనం దీపావళి పండుగను దీపాలతో జరుపుకుంటాం.'
      },
      village: {
        en: 'My grandparents live in a village.',
        te: 'మా తాతయ్య అమ్మమ్మ గ్రామంలో ఉంటారు.'
      },
      river: {
        en: 'The Godavari river flows through Telangana.',
        te: 'గోదావరి నది తెలంగాణా గుండా ప్రవహిస్తుంది.'
      },
      mountain: {
        en: 'We can see mountains from our village.',
        te: 'మా గ్రామం నుండి కొండలు కనిపిస్తాయి.'
      },
      tree: {
        en: 'We planted a tree in our school.',
        te: 'మా స్కూల్లో మేము ఒక చెట్టు నాటాం.'
      },
      flower: {
        en: 'The flower smells very nice.',
        te: 'పువ్వుకు చాలా మంచి వాసన వస్తుంది.'
      },
      friend: {
        en: 'My best friend helps me with homework.',
        te: 'నా బెస్ట్ ఫ్రెండ్ నాకు హోంవర్క్‌లో సహాయం చేస్తాడు.'
      },
      teacher: {
        en: 'Our teacher explains things very clearly.',
        te: 'మా టీచర్ చాలా క్లియర్‌గా చెప్తారు.'
      },
      family: {
        en: 'I love spending time with my family.',
        te: 'నేను నా ఫ్యామిలీతో టైం గడపడం ఇష్టపడతాను.'
      },
      celebrate: {
        en: 'We celebrate birthdays with cake and songs.',
        te: 'మనం పుట్టిన రోజులను కేక్ మరియు పాటలతో జరుపుకుంటాం.'
      }
    };

    const exampleObj = examples[word.english];
    const example = exampleObj
      ? (language === 'en' ? exampleObj.en : exampleObj.te)
      : (language === 'en' ? `This is a ${word.english}.` : `ఇది ${word.telugu}.`);

    return language === 'en'
      ? `Telugu: ${word.telugu}\n\nExample: ${example}`
      : `తెలుగు: ${word.telugu}\n\nఉదాహరణ: ${example}`;
  };

  return (
    <div className="card bg-blue-50 border-2 border-blue-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-primary-500" size={20} />
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'AI Helper' : 'AI హెల్పర్'}
            </h3>
          </div>

          {!showHint && (
            <button onClick={handleHintClick} className="btn-secondary text-sm">
              {t('needHelp', language)}
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
          title={language === 'en' ? 'Listen to pronunciation' : 'ఉచ్ఛారణ విను'}
        >
          <Volume2 size={20} />
        </button>
      </div>

      {showHint && (
        <div className="mt-3 text-xs text-gray-600">
          {language === 'en'
            ? `Hints used: ${hintCount}`
            : `హింట్స్ వాడినవి: ${hintCount}`}
        </div>
      )}
    </div>
  );
}
