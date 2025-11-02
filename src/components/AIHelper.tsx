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

    // Full hint with examples - ALL 50 words
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
      temple: {
        en: 'We visit the temple every Sunday.',
        te: 'మనం ప్రతి ఆదివారం గుడికి వెళ్తాం.'
      },
      market: {
        en: 'My mother goes to the market every morning.',
        te: 'మా అమ్మ ప్రతిరోజు ఉదయం మార్కెట్ కు వెళ్తుంది.'
      },
      friend: {
        en: 'My best friend helps me with homework.',
        te: 'నా బెస్ట్ ఫ్రెండ్ నాకు హోంవర్క్‌లో సహాయం చేస్తాడు.'
      },
      teacher: {
        en: 'Our teacher explains things very clearly.',
        te: 'మా టీచర్ చాలా క్లియర్‌గా చెప్తారు.'
      },
      student: {
        en: 'Every student should study regularly.',
        te: 'ప్రతి స్టూడెంట్ రెగ్యులర్‌గా చదవాలి.'
      },
      family: {
        en: 'I love spending time with my family.',
        te: 'నేను నా ఫ్యామిలీతో టైం గడపడం ఇష్టపడతాను.'
      },
      celebrate: {
        en: 'We celebrate birthdays with cake and songs.',
        te: 'మనం పుట్టిన రోజులను కేక్ మరియు పాటలతో జరుపుకుంటాం.'
      },
      tradition: {
        en: 'Our family follows many old traditions.',
        te: 'మా ఫ్యామిలీ చాలా పాత సంప్రదాయాలను ఫాలో చేస్తుంది.'
      },
      harvest: {
        en: 'Farmers are happy during harvest time.',
        te: 'పంట కాలంలో రైతులు సంతోషంగా ఉంటారు.'
      },
      agriculture: {
        en: 'Agriculture is very important for our country.',
        te: 'మన దేశానికి వ్యవసాయం చాలా ముఖ్యం.'
      },
      monsoon: {
        en: 'We get a lot of rain during monsoon season.',
        te: 'వానాకాలంలో చాలా వర్షం పడుతుంది.'
      },
      rainfall: {
        en: 'Good rainfall helps crops grow well.',
        te: 'మంచి వర్షపాతం పంటలు బాగా పెరగడానికి సహాయపడుతుంది.'
      },
      drought: {
        en: 'During drought, there is no water.',
        te: 'కరువు సమయంలో నీరు ఉండదు.'
      },
      flood: {
        en: 'Heavy rains can cause floods.',
        te: 'భారీ వర్షాలు వరదలకు కారణం అవుతాయి.'
      },
      journey: {
        en: 'Our journey to Delhi took six hours.',
        te: 'డిల్లీకి మా ప్రయాణం ఆరు గంటలు పట్టింది.'
      },
      adventure: {
        en: 'Reading books is a great adventure.',
        te: 'బుక్స్ చదవడం ఒక గొప్ప సాహసం.'
      },
      curious: {
        en: 'She is curious about everything.',
        te: 'అది ప్రతి విషయం గురించి ఆసక్తిగా ఉంటుంది.'
      },
      brave: {
        en: 'The soldier was very brave.',
        te: 'ఆ సైనికుడు చాలా ధైర్యవంతుడు.'
      },
      honest: {
        en: 'An honest person always tells the truth.',
        te: 'నిజాయితీగల వ్యక్తి ఎప్పుడూ నిజం చెబుతాడు.'
      },
      responsible: {
        en: 'We should be responsible students.',
        te: 'మనం బాధ్యతగల స్టూడెంట్స్ గా ఉండాలి.'
      },
      cooperation: {
        en: 'Teamwork needs good cooperation.',
        te: 'టీమ్‌వర్క్ కు మంచి సహకారం అవసరం.'
      },
      community: {
        en: 'Our community helps each other.',
        te: 'మా సమాజం ఒకరికొకరు సహాయం చేస్తుంది.'
      },
      environment: {
        en: 'We should protect our environment.',
        te: 'మన పర్యావరణాన్ని రక్షించాలి.'
      },
      pollution: {
        en: 'Air pollution is harmful to health.',
        te: 'గాలి కాలుష్యం ఆరోగ్యానికి హానికరం.'
      },
      cleanliness: {
        en: 'Cleanliness is very important.',
        te: 'పరిశుభ్రత చాలా ముఖ్యం.'
      },
      hygiene: {
        en: 'Good hygiene keeps us healthy.',
        te: 'మంచి హైజీన్ మనల్ని ఆరోగ్యంగా ఉంచుతుంది.'
      },
      health: {
        en: 'Exercise is good for your health.',
        te: 'ఎక్సర్‌సైజ్ నీ ఆరోగ్యానికి మంచిది.'
      },
      nutrition: {
        en: 'Fruits provide good nutrition.',
        te: 'పండ్లు మంచి పోషకాహారాన్ని అందిస్తాయి.'
      },
      exercise: {
        en: 'We should exercise every day.',
        te: 'మనం ప్రతిరోజు ఎక్సర్‌సైజ్ చేయాలి.'
      },
      independence: {
        en: 'We celebrate Independence Day on August 15th.',
        te: 'మనం ఆగస్టు 15న స్వాతంత్ర్య దినోత్సవం జరుపుకుంటాం.'
      },
      freedom: {
        en: 'Freedom is very precious.',
        te: 'స్వేచ్ఛ చాలా విలువైనది.'
      },
      republic: {
        en: 'India became a republic in 1950.',
        te: 'భారతదేశం 1950లో గణతంత్రం అయింది.'
      },
      democracy: {
        en: 'In a democracy, people choose their leaders.',
        te: 'ప్రజాస్వామ్యంలో ప్రజలు తమ లీడర్లను ఎంచుకుంటారు.'
      },
      constitution: {
        en: 'The constitution gives us our rights.',
        te: 'రాజ్యాంగం మనకు మన హక్కులను ఇస్తుంది.'
      },
      education: {
        en: 'Education helps us grow.',
        te: 'విద్య మనం పెరగడానికి సహాయపడుతుంది.'
      },
      knowledge: {
        en: 'Reading books gives us knowledge.',
        te: 'బుక్స్ చదవడం మనకు జ్ఞానం ఇస్తుంది.'
      },
      science: {
        en: 'Science helps us understand the world.',
        te: 'సైన్స్ ప్రపంచాన్ని అర్థం చేసుకోవడానికి సహాయపడుతుంది.'
      },
      mathematics: {
        en: 'Mathematics is useful in daily life.',
        te: 'రోజువారీ జీవితంలో మ్యాథమెటిక్స్ ఉపయోగపడుతుంది.'
      },
      language: {
        en: 'Telugu is our mother language.',
        te: 'తెలుగు మన మాతృభాష.'
      },
      geography: {
        en: 'Geography teaches us about places.',
        te: 'జియోగ్రఫీ మనకు ప్రదేశాల గురించి నేర్పుతుంది.'
      },
      history: {
        en: 'History tells us about the past.',
        te: 'హిస్టరీ మనకు గతం గురించి చెబుతుంది.'
      },
      nature: {
        en: 'We should protect nature.',
        te: 'మనం ప్రకృతిని రక్షించాలి.'
      },
      universe: {
        en: 'The universe is very big.',
        te: 'విశ్వం చాలా పెద్దది.'
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
