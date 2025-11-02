/**
 * Text-to-Speech Utility
 * Uses browser-native Web Speech API for TTS functionality
 */

export type Language = 'en' | 'te';

interface TTSOptions {
  language: Language;
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
}

/**
 * Speaks text using browser TTS
 */
export function speak(text: string, options: TTSOptions = { language: 'en' }): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Set language
  utterance.lang = options.language === 'te' ? 'te-IN' : 'en-IN';

  // Set voice parameters
  utterance.rate = options.rate || 0.9; // Slightly slower for learners
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Try to find appropriate voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => {
    if (options.language === 'te') {
      return voice.lang.startsWith('te');
    }
    return voice.lang.startsWith('en-IN') || voice.lang.startsWith('en');
  });

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing speech
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if TTS is supported
 */
export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Gets available voices for a language
 */
export function getVoicesForLanguage(language: Language): SpeechSynthesisVoice[] {
  if (!isTTSSupported()) return [];

  const voices = window.speechSynthesis.getVoices();
  const langCode = language === 'te' ? 'te' : 'en';

  return voices.filter((voice) => voice.lang.startsWith(langCode));
}

/**
 * Preload voices (needed for some browsers)
 */
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTTSSupported()) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

/**
 * Speaks word in both languages (for understanding stage)
 */
export async function speakBilingual(
  englishWord: string,
  teluguWord: string,
  delay: number = 1000
): Promise<void> {
  speak(englishWord, { language: 'en' });

  await new Promise((resolve) => setTimeout(resolve, delay));

  speak(teluguWord, { language: 'te' });
}
