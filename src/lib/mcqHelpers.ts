/**
 * Helper functions for generating MCQ options with intelligent distractors
 */

import { Word } from '../types';
import words from '../data/words.json';

/**
 * Generates 2 distractor options for MCQ challenges
 * Distractors are selected from the same category or difficulty level
 * to make the challenge realistic but fair
 */
export function generateDistractors(
  correctWord: Word,
  targetLanguage: 'english' | 'telugu',
  count: number = 2
): string[] {
  const allWords = words as Word[];

  // Filter out the correct word
  const availableWords = allWords.filter(w => w.id !== correctWord.id);

  // Prioritize words from same category
  const sameCategoryWords = availableWords.filter(
    w => w.category === correctWord.category
  );

  // Prioritize words with same difficulty
  const sameDifficultyWords = availableWords.filter(
    w => w.difficulty === correctWord.difficulty
  );

  // Combine and deduplicate candidates (prefer same category)
  const candidates = [
    ...sameCategoryWords,
    ...sameDifficultyWords,
    ...availableWords
  ];

  // Remove duplicates while preserving order
  const uniqueCandidates = Array.from(
    new Map(candidates.map(w => [w.id, w])).values()
  );

  // Shuffle and select distractors
  const shuffled = uniqueCandidates.sort(() => Math.random() - 0.5);
  const selectedDistractors = shuffled.slice(0, count);

  // Return the appropriate language field
  return selectedDistractors.map(w =>
    targetLanguage === 'english' ? w.english : w.telugu
  );
}

/**
 * Generates complete MCQ options array with correct answer and distractors
 * Returns shuffled array of 3 options
 */
export function generateMCQOptions(
  correctWord: Word,
  challengeType: 'english_to_telugu' | 'telugu_to_english' | 'other'
): string[] {
  let correctAnswer: string;
  let targetLanguage: 'english' | 'telugu';

  if (challengeType === 'english_to_telugu') {
    correctAnswer = correctWord.telugu;
    targetLanguage = 'telugu';
  } else if (challengeType === 'telugu_to_english') {
    correctAnswer = correctWord.english;
    targetLanguage = 'english';
  } else {
    // Default to English for other challenge types
    correctAnswer = correctWord.english;
    targetLanguage = 'english';
  }

  // Generate 2 distractors
  const distractors = generateDistractors(correctWord, targetLanguage, 2);

  // Combine correct answer with distractors and shuffle
  const options = [correctAnswer, ...distractors];
  return options.sort(() => Math.random() - 0.5);
}

/**
 * Checks if the given answer is correct for the word and challenge type
 */
export function isCorrectMCQAnswer(
  selectedOption: string,
  correctWord: Word,
  challengeType: 'english_to_telugu' | 'telugu_to_english' | 'other'
): boolean {
  if (challengeType === 'english_to_telugu') {
    return selectedOption === correctWord.telugu;
  } else if (challengeType === 'telugu_to_english') {
    return selectedOption === correctWord.english;
  } else {
    // For other types, check both languages
    return selectedOption === correctWord.english || selectedOption === correctWord.telugu;
  }
}
