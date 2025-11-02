import React, { useState } from 'react';
import { Challenge, Word } from '../types';
import { DrawCanvas } from './DrawCanvas';
import { AIHelper } from './AIHelper';
import { motion } from 'framer-motion';
import { useApp } from '../lib/context';
import { getTraceTemplate } from '../lib/traceTemplates';
import { generateMCQOptions, isCorrectMCQAnswer } from '../lib/mcqHelpers';
import { t } from '../lib/translations';
import words from '../data/words.json';

interface ChallengeCardProps {
  challenge: Challenge;
  word: Word;
  onComplete: (result: 'pass' | 'retry', hintsUsed: number, timeTaken: number) => void;
}

export function ChallengeCard({ challenge, word, onComplete }: ChallengeCardProps) {
  const { language } = useApp();
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleHintUsed = () => {
    setHintsUsed((prev) => prev + 1);
  };

  const handleSubmit = (isCorrect: boolean) => {
    const timeTaken = Date.now() - startTime;
    onComplete(isCorrect ? 'pass' : 'retry', hintsUsed, timeTaken);
  };

  const renderMCQ = () => {
    // Determine challenge type for MCQ generation
    const challengeType = challenge.id.includes("english_to_telugu")
      ? 'english_to_telugu'
      : challenge.id.includes("telugu_to_english")
      ? 'telugu_to_english'
      : 'other';

    // Generate intelligent MCQ options with proper distractors
    const options = generateMCQOptions(word, challengeType);

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {challenge.id.includes("telugu_to_english") ? word.telugu : word.english}
          </h2>
          <p className="text-gray-600">
            {t('chooseCorrectAnswer', language)}
          </p>
        </div>

        <div className="space-y-3">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAnswer(option);
                const isCorrect = isCorrectMCQAnswer(option, word, challengeType);
                setTimeout(() => handleSubmit(isCorrect), 500);
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === option
                  ? option === word.english || option === word.telugu
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                  : 'bg-white border-gray-300 hover:border-primary-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDrawing = () => {
    // Generate trace template for draw_trace challenges
    const traceTemplate = challenge.mechanic === 'draw_trace'
      ? getTraceTemplate(word.english)
      : undefined;

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{word.english}</h2>
          <p className="text-lg text-gray-600">{word.telugu}</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('drawWord', language)}
          </p>
          {challenge.mechanic === 'draw_trace' && (
            <p className="text-xs text-primary-600 mt-1 font-medium">
              {t('traceOverLines', language)}
            </p>
          )}
        </div>

        <DrawCanvas
          onComplete={() => {
            // Simple validation - if drawing has content, pass
            handleSubmit(true);
          }}
          traceImage={traceTemplate}
        />
      </div>
    );
  };

  const renderFillBlank = () => {
    const [answer, setAnswer] = useState('');

    const sentence = `The children are going to the ${word.english}.`;

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700">
            {t('fillBlank', language)}
          </p>
          <p className="text-xl font-medium text-gray-800 mt-4">
            {sentence.replace(word.english, '______')}
          </p>
        </div>

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
          placeholder={t('typeAnswer', language)}
        />

        <button
          onClick={() => {
            const isCorrect = answer.toLowerCase().trim() === word.english.toLowerCase();
            handleSubmit(isCorrect);
          }}
          className="btn-primary w-full"
          disabled={!answer.trim()}
        >
          {t('submit', language)}
        </button>
      </div>
    );
  };

  const renderMatchPairs = () => {
    const [pairs, setPairs] = useState<Array<{ id: string; english: string; telugu: string; matched: boolean }>>([]);
    const [selected, setSelected] = useState<{ type: 'english' | 'telugu'; id: string } | null>(null);

    // Initialize pairs on mount
    React.useEffect(() => {
      const allWords = words as Word[];
      const otherWords = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 2);
      const pairsList = [word, ...otherWords].map((w, idx) => ({
        id: `pair_${idx}`,
        english: w.english,
        telugu: w.telugu,
        matched: false
      }));
      setPairs(pairsList.sort(() => Math.random() - 0.5));
    }, [word.id]);

    const handleSelect = (type: 'english' | 'telugu', id: string) => {
      if (!selected) {
        setSelected({ type, id });
      } else {
        const pair1 = pairs.find(p => p.id === selected.id);
        const pair2 = pairs.find(p => p.id === id);

        if (pair1 && pair2 && pair1.id === pair2.id && selected.type !== type) {
          setPairs(prev => prev.map(p => p.id === id ? { ...p, matched: true } : p));
          setSelected(null);

          if (pairs.filter(p => !p.matched).length === 1) {
            setTimeout(() => handleSubmit(true), 500);
          }
        } else {
          setSelected({ type, id });
        }
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Match the pairs!' : 'జతలు కలపండి!'}
          </h2>
          <p className="text-gray-600">
            {language === 'en' ? 'Match English words with their Telugu meanings' : 'ఇంగ్లీష్ పదాలను తెలుగు అర్థాలతో కలపండి'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map(pair => (
              <button
                key={`en_${pair.id}`}
                onClick={() => handleSelect('english', pair.id)}
                disabled={pair.matched}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  pair.matched
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : selected?.type === 'english' && selected.id === pair.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-primary-400'
                }`}
              >
                {pair.english}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {pairs.sort(() => Math.random() - 0.5).map(pair => (
              <button
                key={`te_${pair.id}`}
                onClick={() => handleSelect('telugu', pair.id)}
                disabled={pair.matched}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  pair.matched
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : selected?.type === 'telugu' && selected.id === pair.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-primary-400'
                }`}
              >
                {pair.telugu}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSentenceBuild = () => {
    const [sentence, setSentence] = useState('');

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{word.english}</h2>
          <p className="text-lg text-gray-600">{word.telugu}</p>
          <p className="text-sm text-gray-500 mt-2">
            {language === 'en'
              ? 'Write a sentence using this word'
              : 'ఈ పదాన్ని ఉపయోగించి ఒక వాక్యం రాయండి'}
          </p>
        </div>

        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          rows={4}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg resize-none"
          placeholder={language === 'en' ? 'Write your sentence here...' : 'నీ వాక్యం ఇక్కడ రాయి...'}
        />

        <button
          onClick={() => {
            const hasWord = sentence.toLowerCase().includes(word.english.toLowerCase());
            handleSubmit(hasWord && sentence.trim().length > 10);
          }}
          className="btn-primary w-full"
          disabled={!sentence.trim() || sentence.length < 10}
        >
          {t('submit', language)}
        </button>
      </div>
    );
  };

  const renderDrawPlusCaption = () => {
    const [caption, setCaption] = useState('');
    const [drawn, setDrawn] = useState(false);

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{word.english}</h2>
          <p className="text-lg text-gray-600">{word.telugu}</p>
          <p className="text-sm text-gray-500 mt-2">
            {language === 'en'
              ? 'Draw a picture and write a sentence about it!'
              : 'ఒక పిక్చర్ గీసి దాని గురించి ఒక వాక్యం రాయి!'}
          </p>
        </div>

        <DrawCanvas
          onComplete={() => setDrawn(true)}
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg resize-none"
          placeholder={language === 'en' ? 'Write about your drawing...' : 'నీ డ్రాయింగ్ గురించి రాయి...'}
        />

        <button
          onClick={() => {
            const hasWord = caption.toLowerCase().includes(word.english.toLowerCase());
            handleSubmit(drawn && hasWord && caption.trim().length > 15);
          }}
          className="btn-primary w-full"
          disabled={!drawn || !caption.trim() || caption.length < 15}
        >
          {t('submit', language)}
        </button>
      </div>
    );
  };

  const renderEnglishToTelugu = () => {
    const [answer, setAnswer] = useState('');

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{word.english}</h2>
          <p className="text-lg text-gray-700">
            {language === 'en'
              ? 'What is this word in Telugu?'
              : 'ఈ పదం తెలుగులో ఏమిటి?'}
          </p>
        </div>

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-lg font-telugu"
          placeholder={language === 'en' ? 'Type the Telugu word...' : 'తెలుగు పదం టైప్ చేయి...'}
        />

        <button
          onClick={() => {
            const isCorrect = answer.trim() === word.telugu;
            handleSubmit(isCorrect);
          }}
          className="btn-primary w-full"
          disabled={!answer.trim()}
        >
          {t('submit', language)}
        </button>
      </div>
    );
  };

  const renderChallenge = () => {
    const mechanic = challenge.mechanic;

    // Debug logging
    console.log('🎨 Rendering Challenge:', {
      challengeId: challenge.id,
      mechanic: mechanic,
      stage: challenge.stage,
      word: word.english
    });

    if (mechanic.includes('draw')) {
      return renderDrawing();
    } else if (mechanic.includes('mcq') || mechanic.includes('listen_choose')) {
      return renderMCQ();
    } else if (mechanic === 'fill_blank') {
      return renderFillBlank();
    } else if (mechanic === 'match_pairs') {
      return renderMatchPairs();
    } else if (mechanic === 'sentence_build') {
      return renderSentenceBuild();
    } else if (mechanic === 'draw_plus_caption') {
      return renderDrawPlusCaption();
    } else if (mechanic === 'english_to_telugu') {
      return renderEnglishToTelugu();
    } else {
      return renderMCQ(); // Default fallback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card max-w-3xl mx-auto"
    >
      <div className="mb-4">
        <span className="badge bg-primary-100 text-primary-700">
          {challenge.stage.toUpperCase()}
        </span>
        <span className="badge bg-gray-100 text-gray-700 ml-2">
          {challenge.difficulty_band.replace('_', ' ')}
        </span>
      </div>

      {renderChallenge()}

      <div className="mt-6">
        <AIHelper
          word={word}
          challengeId={challenge.id}
          hintLevel="full"
          onHintUsed={handleHintUsed}
        />
      </div>
    </motion.div>
  );
}
