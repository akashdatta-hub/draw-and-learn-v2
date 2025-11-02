import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../lib/context';
import { db } from '../lib/supabaseClient';

export function GalleryPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [reflections, setReflections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    // In production, this would load from peer_gallery table with moderated content
    // For MVP, we'll show a placeholder
    setReflections([
      {
        id: '1',
        text: 'I learned about festivals! My favorite is Diwali.',
        image_url: null,
        likes_count: 5,
        word: 'festival',
      },
      {
        id: '2',
        text: 'Rivers are important for our villages.',
        image_url: null,
        likes_count: 3,
        word: 'river',
      },
      {
        id: '3',
        text: 'I drew a picture of my village temple.',
        image_url: null,
        likes_count: 8,
        word: 'temple',
      },
    ]);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Peer Gallery' : 'తోటివారి గ్యాలరీ'}
          </h1>
          <p className="text-gray-600">
            {language === 'en'
              ? 'See what others are learning and creating'
              : 'ఇతరులు ఏమి నేర్చుకుంటున్నారో మరియు సృష్టిస్తున్నారో చూడండి'}
          </p>
        </motion.div>

        {reflections.length === 0 ? (
          <div className="card text-center py-12">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {language === 'en' ? 'No reflections yet' : 'ఇంకా ప్రతిబింబాలు లేవు'}
            </h3>
            <p className="text-gray-500">
              {language === 'en'
                ? 'Be the first to share your learning!'
                : 'మీ అభ్యాసాన్ని పంచుకునే మొదటి వ్యక్తి అవ్వండి!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reflections.map((reflection, idx) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:shadow-2xl transition-shadow"
              >
                {reflection.image_url ? (
                  <img
                    src={reflection.image_url}
                    alt="Student creation"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}

                <div className="space-y-3">
                  <span className="badge bg-primary-100 text-primary-700">
                    {reflection.word}
                  </span>

                  <p className="text-gray-700">{reflection.text}</p>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
                      <ThumbsUp size={18} />
                      <span className="text-sm">{reflection.likes_count}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button onClick={() => navigate('/reflection')} className="btn-primary">
            {language === 'en' ? 'Share Your Reflection' : 'మీ ప్రతిబింబాన్ని పంచుకోండి'}
          </button>
        </div>
      </div>
    </div>
  );
}
