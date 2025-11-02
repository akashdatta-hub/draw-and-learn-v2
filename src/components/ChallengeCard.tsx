import React, { useState } from 'react';
import { Challenge, Word } from '../types';
import { DrawCanvas } from './DrawCanvas';
import { AIHelper } from './AIHelper';
import { motion } from 'framer-motion';
import { useApp } from '../lib/context';

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
    // Mock options - in real implementation, these would be generated
    const options =
      challenge.mechanic === 'english_to_telugu'
        ? [word.telugu, 'తప్పు సమాధానం 1', 'తప్పు సమాధానం 2']
        : challenge.mechanic === 'telugu_to_english_mcq3'
        ? [word.english, 'wrong answer 1', 'wrong answer 2']
        : [word.english, 'option 2', 'option 3'];

    const shuffled = [...options].sort(() => Math.random() - 0.5);

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {challenge.mechanic === 'telugu_to_english_mcq3' ? word.telugu : word.english}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? challenge.prompt
              : challenge.prompt?.replace('Choose', 'ఎంచుకోండి')}
          </p>
        </div>

        <div className="space-y-3">
          {shuffled.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAnswer(option);
                const isCorrect =
                  challenge.mechanic === 'english_to_telugu'
                    ? option === word.telugu
                    : option === word.english;
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
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{word.english}</h2>
          <p className="text-lg text-gray-600">{word.telugu}</p>
          <p className="text-sm text-gray-500 mt-2">
            {language === 'en' ? challenge.prompt : 'ఈ పదాన్ని గీయండి'}
          </p>
        </div>

        <DrawCanvas
          onComplete={(dataUrl) => {
            // Simple validation - if drawing has content, pass
            handleSubmit(true);
          }}
          traceImage={challenge.mechanic === 'draw_trace' ? undefined : undefined}
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
            {language === 'en'
              ? 'Fill in the blank:'
              : 'ఖాళీని పూరించండి:'}
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
          placeholder={language === 'en' ? 'Type your answer...' : 'మీ సమాధానం టైప్ చేయండి...'}
        />

        <button
          onClick={() => {
            const isCorrect = answer.toLowerCase().trim() === word.english.toLowerCase();
            handleSubmit(isCorrect);
          }}
          className="btn-primary w-full"
          disabled={!answer.trim()}
        >
          {language === 'en' ? 'Submit' : 'సమర్పించండి'}
        </button>
      </div>
    );
  };

  const renderChallenge = () => {
    const mechanic = challenge.mechanic;

    if (mechanic.includes('draw')) {
      return renderDrawing();
    } else if (mechanic.includes('mcq') || mechanic.includes('listen_choose')) {
      return renderMCQ();
    } else if (mechanic === 'fill_blank') {
      return renderFillBlank();
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
