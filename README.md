# Draw & Learn MVP v2

An AI-powered English vocabulary learning game for Class 5 Telugu-speaking students. Built with confidence-first pedagogy, creative expression, and adaptive learning logic.

## 🎯 Purpose

Build confidence, creativity, and English comprehension through:
- Interactive visual, audio, and drawing challenges
- Adaptive difficulty based on performance
- Spaced repetition for long-term retention
- Anonymous, privacy-first data tracking
- Bilingual (English ↔ Telugu) interface

## 🏗️ Architecture

Built following the v2 specification documents:
- `build_plan_v2.md` - System architecture and challenge logic
- `governance_v2.md` - Pedagogical principles and ethical AI guidelines
- `analytics_v2.md` - Learning quality metrics and privacy controls

### Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Analytics:** Microsoft Clarity + Custom tracking
- **TTS:** Browser-native Web Speech API
- **Hosting:** Vercel

## 📦 Project Structure

```
src/
├── data/
│   ├── words.json                  # 50 SCERT syllabus words
│   └── challenge_bank.json         # Challenge templates by stage
├── components/
│   ├── ChallengeCard.tsx           # Main challenge renderer
│   ├── DrawCanvas.tsx              # Drawing interface
│   └── AIHelper.tsx                # Hint system
├── lib/
│   ├── supabaseClient.ts           # Database client
│   ├── adaptiveLogic.ts            # Challenge selection algorithm
│   ├── spacedRepetition.ts         # SR scheduling
│   ├── analytics.ts                # Event tracking
│   ├── tts.ts                      # Text-to-speech
│   └── context.tsx                 # Global state
├── pages/
│   ├── Home.tsx                    # Landing page
│   ├── ChallengePage.tsx           # Challenge flow
│   ├── ReflectionPage.tsx          # Weekly review
│   ├── GalleryPage.tsx             # Peer showcase
│   └── Dashboard.tsx               # Analytics view
└── types/
    └── index.ts                    # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Microsoft Clarity account (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Copy your project URL and anon key

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_CLARITY_ID=your-clarity-id (optional)
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎮 Features

### Learning Flow

1. **Understand Stage** - Visual and audio introduction
2. **Try Stage** - Simple application challenges
3. **Review Stage** - Spaced repetition practice
4. **Retry Stage** - Supportive re-attempt (no penalties)
5. **Challenge Stage** - Creative expression tasks

### Challenge Types

- **Drawing:** Trace, free draw, draw + caption
- **MCQ:** 3 or 4 options, English ↔ Telugu
- **Fill in the blank:** Context-based
- **Sentence building:** Word arrangement
- **Listen & choose:** Audio + visual matching

### Gamification

- XP for effort (not just accuracy)
- Badges: Listener, Writer, Artist, Creator
- Weekly reflection bonus (+50 XP)
- Peer gallery with anonymous sharing

### Analytics

Tracks learning quality metrics:
- Pass rate
- Average time per challenge
- Hint usage patterns
- Confidence index
- Word retention rate

All data is anonymous and stored securely per `governance_v2.md`.

## 📊 Database Schema

See `supabase/schema.sql` for full schema. Key tables:

- `challenge_log` - Performance tracking
- `sr_state` - Spaced repetition intervals
- `reflections` - Weekly creative tasks
- `analytics_events` - Interaction tracking
- `user_progress` - Aggregate metrics

## 🎨 Design Principles

Following `governance_v2.md`:

1. **Confidence before correctness** - No negative scoring
2. **Learning through creation** - Drawing and writing encouraged
3. **Supportive tutoring** - Positive AI feedback only
4. **Multimodal inclusion** - Visual, audio, text, drawing
5. **Cultural relevance** - Telangana context and examples
6. **Privacy-first** - Anonymous user IDs, no personal data

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🧪 Testing

```bash
# Run dev server and test flows
npm run dev

# Test challenge flow: Home → Challenge → Feedback → Next
# Test reflection: Home → Reflection → Submit
# Test analytics: Home → Dashboard → View metrics
```

## 📝 TODO (Post-MVP)

- [ ] AI drawing recognition (Teachable Machine)
- [ ] Real-time AI feedback (Claude/GPT integration)
- [ ] Educator admin panel
- [ ] Offline mode with service workers
- [ ] Voice input challenges
- [ ] Collaborative challenges

## 🤝 Contributing

This is an educational prototype. Contributions welcome for:
- Additional challenge types
- Better Telugu translations
- Accessibility improvements
- Performance optimizations

## 📄 License

MIT License

## 👥 Credits

Built for Class 5 students in Telangana, India.
Based on SCERT English textbook vocabulary.

Powered by:
- React + Vite
- Supabase
- TailwindCSS
- Framer Motion
- Anthropic Claude (planning & design)

---

**Version:** 2.0.0
**Last Updated:** November 2025
**Status:** MVP Ready for Testing
