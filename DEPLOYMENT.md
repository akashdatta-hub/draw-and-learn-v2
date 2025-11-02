# Draw & Learn MVP v2 - Deployment Guide

Complete step-by-step guide to deploy the Draw & Learn MVP to production.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free tier)
- [ ] Supabase account (free tier)
- [ ] Microsoft Clarity account (optional, for analytics)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name:** `draw-and-learn-prod`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., Mumbai for India)
   - **Pricing Plan:** Free
6. Click "Create new project" (takes ~2 minutes)

### 1.2 Run Database Schema

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from the project
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. Verify: Check "Table Editor" - you should see tables like:
   - `challenge_log`
   - `sr_state`
   - `reflections`
   - `analytics_events`
   - `user_progress`

### 1.3 Get API Credentials

1. In Supabase dashboard, click "Settings" (gear icon)
2. Click "API" in left sidebar
3. Under "Project API keys", copy:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJxxx...` (long string)
4. Save these - you'll need them for Vercel

---

## Step 2: Microsoft Clarity Setup (Optional)

1. Go to [https://clarity.microsoft.com](https://clarity.microsoft.com)
2. Sign in with Microsoft account
3. Click "Add new project"
4. Fill in:
   - **Name:** Draw & Learn MVP
   - **Website URL:** (leave blank for now, add after Vercel deployment)
5. Copy the **Project ID** (looks like: `abc123xyz`)
6. Save this for Vercel environment variables

---

## Step 3: GitHub Repository

### 3.1 Create GitHub Repo

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name:** `draw-and-learn-v2`
   - **Description:** "AI-powered English vocabulary game for Class 5 Telugu students"
   - **Visibility:** Public or Private (your choice)
3. **Do NOT** initialize with README (we already have one)
4. Click "Create repository"

### 3.2 Push Code to GitHub

```bash
# In your project directory (draw-and-learn-v2)
git remote add origin https://github.com/YOUR_USERNAME/draw-and-learn-v2.git
git branch -M main
git push -u origin main
```

Verify: Refresh GitHub page - you should see all your files

---

## Step 4: Vercel Deployment

### 4.1 Import Project

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Find your `draw-and-learn-v2` repo
5. Click "Import"

### 4.2 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4.3 Add Environment Variables

Click "Environment Variables" section and add:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase → Settings → API |
| `VITE_CLARITY_ID` | `abc123xyz` | Microsoft Clarity (optional) |

**Important:** Make sure to select "Production", "Preview", and "Development" for each variable.

### 4.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Your site is live at: `https://your-project-name.vercel.app`

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Clarity with Domain

If you added Microsoft Clarity:
1. Go back to Clarity dashboard
2. Edit your project
3. Add your Vercel URL: `https://your-project-name.vercel.app`
4. Save

### 5.2 Test Production Site

Visit your Vercel URL and test:

1. **Home Page**
   - [ ] Page loads successfully
   - [ ] Stats cards display (XP, Words Learned, etc.)
   - [ ] Language toggle works (English ↔ Telugu)

2. **Challenge Flow**
   - [ ] Click "Start Learning"
   - [ ] Challenge loads with word and instructions
   - [ ] AI Helper button works
   - [ ] TTS (speaker icon) plays audio
   - [ ] Can complete challenge and see feedback
   - [ ] XP increases after completion

3. **Reflection Page**
   - [ ] Weekly summary generates
   - [ ] Can select word from dropdown
   - [ ] Can write text
   - [ ] Can draw (if enabled)
   - [ ] Submit works and awards XP

4. **Gallery Page**
   - [ ] Loads without errors
   - [ ] Shows placeholder content

5. **Dashboard**
   - [ ] Analytics load
   - [ ] Metrics display (pass rate, avg time, etc.)
   - [ ] Progress bars animate

### 5.3 Verify Supabase Integration

1. Complete a few challenges on production site
2. Go to Supabase dashboard → Table Editor
3. Click on `challenge_log` table
4. You should see new rows with your challenge attempts

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain to Vercel

1. In Vercel project dashboard, click "Settings"
2. Click "Domains" in sidebar
3. Click "Add"
4. Enter your domain (e.g., `drawandlearn.com`)
5. Follow Vercel's DNS instructions

### 6.2 Update Clarity Domain

- Go to Clarity → Edit Project → Update website URL

---

## Troubleshooting

### Build Fails on Vercel

**Error:** `Module not found` or `Cannot resolve`

**Solution:**
```bash
# Locally, run:
npm install
npm run build

# If it works locally, commit and push:
git add -A
git commit -m "Fix: dependencies"
git push
```

Vercel will auto-redeploy.

### Supabase Connection Error

**Error:** `supabase: Invalid API key`

**Solution:**
1. Verify environment variables in Vercel:
   - Settings → Environment Variables
   - Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. Redeploy: Deployments → ... → Redeploy

### Analytics Not Showing

**Error:** No data in `challenge_log` table

**Possible causes:**
1. Supabase env vars not set correctly
2. RLS policies blocking inserts
3. Browser blocking requests (check console)

**Solution:**
- In Supabase, temporarily disable RLS:
  - Table Editor → challenge_log → ... → Disable RLS
- Test again, then re-enable with proper policies

### TTS Not Working

**Error:** "Speech synthesis not supported"

**Solution:**
- TTS requires HTTPS (works on Vercel automatically)
- Some browsers don't support Telugu TTS
- Test in Chrome/Edge (best support)

---

## Performance Optimization (Post-MVP)

After deployment, consider these improvements:

### Code Splitting

Edit `vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
```

### Image Optimization

- Add `vite-imagetools` for automatic image compression
- Use WebP format for drawings

### Caching

Add `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Monitoring & Maintenance

### Weekly Checks

- [ ] Check Supabase dashboard for errors
- [ ] Review Clarity heatmaps for UX issues
- [ ] Monitor Vercel analytics for uptime
- [ ] Check `challenge_log` for unusual patterns

### Monthly Review

- [ ] Analyze pass rates per word/challenge
- [ ] Review reflection submissions
- [ ] Identify words needing better challenges
- [ ] Update Challenge Bank based on educator feedback

---

## Rollback Procedure

If something breaks in production:

1. In Vercel dashboard, go to "Deployments"
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Site reverts instantly

---

## Security Checklist

- [x] No hardcoded secrets in code
- [x] Environment variables in Vercel only
- [x] Supabase RLS enabled
- [x] Anonymous user IDs (no PII)
- [x] HTTPS enforced (automatic on Vercel)
- [x] No sensitive data in client-side logs

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project Issues:** Create issue on GitHub repo
- **Vite Docs:** https://vitejs.dev

---

## Deployment Checklist Summary

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Supabase credentials saved
- [ ] Microsoft Clarity setup (optional)
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variables configured
- [ ] Initial deployment successful
- [ ] Production site tested (all features work)
- [ ] Supabase integration verified
- [ ] Analytics tracking confirmed

---

**Status:** Ready for production use
**Last Updated:** November 2025
**Deployment Time:** ~30 minutes (first time)
