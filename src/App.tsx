import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './lib/context';
import { Home } from './pages/Home';
import { ChallengePage } from './pages/ChallengePage';
import { ReflectionPage } from './pages/ReflectionPage';
import { GalleryPage } from './pages/GalleryPage';
import { Dashboard } from './pages/Dashboard';
import { Globe } from 'lucide-react';
import { initializeClarity } from './lib/analytics';
import { useEffect } from 'react';

function Header() {
  const { language, toggleLanguage, totalXP } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
            DL
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {language === 'en' ? 'Draw & Learn' : 'గీయండి & నేర్చుకోండి'}
            </h1>
            <p className="text-xs text-gray-600">
              {language === 'en' ? 'English Vocabulary' : 'ఇంగ్లీష్ పదజాలం'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">XP:</span>
            <span className="text-lg font-bold text-primary-600">{totalXP}</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="btn-secondary p-3 rounded-lg flex items-center gap-2"
            title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
          >
            <Globe size={20} />
            <span className="hidden sm:inline font-medium">
              {language === 'en' ? 'తెలుగు' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  useEffect(() => {
    // Initialize Microsoft Clarity
    initializeClarity();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/reflection" element={<ReflectionPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
            <p>
              Draw & Learn MVP v2.0 - Built with ❤️ for Class 5 Telugu students
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Anonymous learning · Privacy-first · Confidence-building pedagogy
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
