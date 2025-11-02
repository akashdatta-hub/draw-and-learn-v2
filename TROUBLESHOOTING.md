# Draw & Learn - Troubleshooting Guide

## 🔧 Common Issues and Solutions

---

## Issue: 404 Errors on Vercel ✅ FIXED

**Symptom:**
- Homepage loads fine
- Clicking navigation links (Challenge, Reflection, etc.) shows 404 errors
- Direct URL access to `/challenge` returns 404

**Root Cause:**
Single Page Applications (SPAs) using client-side routing need all routes to serve the main `index.html` file. By default, Vercel tries to serve static files for each route.

**Solution Applied:**

### 1. Updated `vercel.json` with rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel: "For any route, serve index.html and let React Router handle the routing."

### 2. Added `public/_redirects` as fallback:
```
/*    /index.html   200
```

### 3. Added Security Headers:
```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    }
  ]
}
```

**Status:** ✅ Fixed in commit `2ee1060` and `9f606ab`

---

## Issue: Environment Variables Not Working

**Symptom:**
- Supabase connection fails
- Console shows "Invalid API key" or undefined errors

**Solution:**

### 1. Check Environment Variables are Set:
```bash
vercel env ls
```

You should see:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLARITY_ID` (optional)

### 2. Add Missing Variables:
```bash
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted
```

### 3. Redeploy After Adding Env Vars:
```bash
vercel --prod
```

**Important:**
- All env vars for Vite MUST start with `VITE_`
- Add for all environments: Production, Preview, Development

---

## Issue: Supabase Connection Errors

**Symptom:**
- Challenges complete but don't save to database
- Dashboard shows no data
- Console error: "Failed to log challenge"

**Solution:**

### 1. Verify Supabase Setup:

#### Check Project is Running:
- Go to https://supabase.com/dashboard
- Ensure project status is "Active"
- Check database is not paused

#### Verify Schema Deployed:
```sql
-- Run this in Supabase SQL Editor
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('challenge_log', 'sr_state', 'reflections');
```

Should return 3 rows.

### 2. Check RLS Policies:

In Supabase → Authentication → Policies:

```sql
-- Should exist on challenge_log table:
CREATE POLICY "Allow anonymous access" ON challenge_log
FOR ALL USING (true);
```

If missing, run the schema again from `supabase/schema.sql`

### 3. Test Connection:

Open browser console on production site and run:
```javascript
// Should NOT show errors
fetch(import.meta.env.VITE_SUPABASE_URL)
  .then(r => console.log('Supabase reachable:', r.ok))
```

---

## Issue: TTS (Text-to-Speech) Not Working

**Symptom:**
- Speaker icon doesn't play audio
- Console error: "Speech synthesis not supported"

**Solutions:**

### 1. Check Browser Support:
TTS requires modern browsers:
- ✅ Chrome/Edge (best support)
- ✅ Safari (iOS/macOS)
- ⚠️ Firefox (limited Telugu support)

### 2. Check HTTPS:
- TTS only works on HTTPS or localhost
- Vercel automatically provides HTTPS ✅

### 3. Check Audio Permissions:
- Browser may block autoplay
- User must interact with page first
- Click anywhere, then try TTS

### 4. Telugu Voice Not Available:
If English works but Telugu doesn't:
```javascript
// Check available voices in console:
speechSynthesis.getVoices().forEach(v =>
  console.log(v.name, v.lang)
);
```

Workaround: App falls back to English if Telugu unavailable.

---

## Issue: Drawing Canvas Not Showing

**Symptom:**
- Canvas area is blank or very small
- Can't draw anything

**Solution:**

### 1. Check Canvas Dimensions:
In `DrawCanvas.tsx`, canvas size is set on mount. Hard refresh:
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 2. Check Browser Compatibility:
Canvas requires:
- HTML5 Canvas support (all modern browsers ✅)
- Touch events for mobile

### 3. Clear Browser Cache:
```bash
# Or in browser DevTools:
# Application → Clear Storage → Clear site data
```

---

## Issue: Trace Templates Not Showing

**Symptom:**
- Draw_trace challenge shows blank canvas
- No dotted lines visible

**Solution:**

✅ Fixed in commit `2d536fc`

If still not working:

### 1. Check Browser Console:
Look for errors like:
- "Failed to load SVG"
- "Blob URL creation failed"

### 2. Check SVG Support:
```javascript
// In console:
const svg = `<svg>...</svg>`;
const blob = new Blob([svg], {type: 'image/svg+xml'});
console.log(URL.createObjectURL(blob));
```

Should return a blob URL like `blob:https://...`

### 3. Hard Refresh Page:
Templates are generated dynamically. Clear cache and reload.

---

## Issue: Build Failures on Vercel

**Symptom:**
- Deployment fails during build
- "Module not found" errors

**Solution:**

### 1. Check package.json Dependencies:
```bash
# Locally, ensure all deps are in package.json:
npm install
npm run build
```

### 2. Clear Vercel Cache:
In Vercel Dashboard:
- Settings → General
- Scroll to "Build & Development Settings"
- Clear build cache

### 3. Check Node Version:
Vercel uses Node 18 by default. Ensure compatibility.

---

## Issue: Slow Loading Times

**Symptom:**
- App takes >5 seconds to load
- Large bundle size warnings

**Solutions:**

### 1. Enable Code Splitting:

Update `vite.config.ts`:
```typescript
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

### 2. Optimize Images:
- Convert PNGs to WebP
- Use lazy loading for images

### 3. Check Network Tab:
- Identify large files
- Consider CDN for static assets

---

## Issue: Analytics Not Tracking

**Symptom:**
- Microsoft Clarity not showing data
- Supabase analytics_events table empty

**Solution:**

### 1. Check Clarity Setup:
```javascript
// In browser console:
console.log(window.clarity);
// Should be a function, not undefined
```

### 2. Verify VITE_CLARITY_ID:
```bash
vercel env ls | grep CLARITY
```

### 3. Check Supabase Logs:
In Supabase → Logs → API:
- Look for INSERT requests to analytics_events
- Check for errors

### 4. Test Locally:
```javascript
// In browser console on production:
import { trackEvent } from './lib/analytics';
trackEvent('test_event', { test: true });
```

Check Supabase table for new row.

---

## Issue: Bilingual Toggle Not Working

**Symptom:**
- Clicking language toggle doesn't change text
- Telugu text not displaying

**Solution:**

### 1. Check Font Loading:
Telugu requires Noto Sans Telugu font.

In browser DevTools → Network:
- Filter: "noto-sans-telugu"
- Should see 200 OK

### 2. Hard Refresh:
Fonts are cached. Clear cache and reload.

### 3. Check Component Re-renders:
Language state is in Context. Components must use `useApp()` hook.

---

## Debugging Tools

### Vercel Logs:
```bash
# Get deployment URL from vercel ls
vercel logs https://your-deployment-url.vercel.app
```

### Local Development:
```bash
npm run dev
# App runs on http://localhost:5173
```

### Browser DevTools:
- **Console:** Check for JavaScript errors
- **Network:** Monitor API calls to Supabase
- **Application:** Check LocalStorage for user data
- **Elements:** Inspect DOM and styles

### Supabase Dashboard:
- **Logs → API:** See all API requests
- **Table Editor:** View data directly
- **SQL Editor:** Run queries

---

## Getting Help

### 1. Check Existing Issues:
https://github.com/akashdatta-hub/draw-and-learn-v2/issues

### 2. Create New Issue:
Include:
- Browser and version
- Error messages (console + network)
- Steps to reproduce
- Screenshots if applicable

### 3. Check Documentation:
- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) - Current status

---

## Quick Fixes Checklist

Before reporting an issue, try:

- [ ] Hard refresh (Ctrl+F5 / Cmd+Shift+R)
- [ ] Clear browser cache
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Test in incognito/private mode
- [ ] Try different browser
- [ ] Check Vercel deployment status
- [ ] Verify Supabase project is active

---

## Status

**Last Updated:** November 3, 2025

**Known Issues:**
- None currently

**Recent Fixes:**
- ✅ 404 routing errors (commit 2ee1060)
- ✅ Trace templates missing (commit 2d536fc)

**Platform Versions:**
- Node: 18.x
- React: 18.x
- Vite: 7.x
- Vercel CLI: 48.x

---

**Need more help?** Open an issue on GitHub with detailed information about your problem.
