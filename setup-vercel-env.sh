#!/bin/bash
# Setup script for Vercel environment variables
# Run this after creating your Supabase project

echo "🚀 Draw & Learn - Vercel Environment Setup"
echo "=========================================="
echo ""
echo "This script will help you set up environment variables in Vercel."
echo ""
echo "Prerequisites:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL schema from supabase/schema.sql"
echo "3. Get your Project URL and anon key from Settings > API"
echo ""

read -p "Enter your SUPABASE_URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Enter your SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "Enter your CLARITY_ID (optional, press Enter to skip): " CLARITY_ID

echo ""
echo "Adding environment variables to Vercel..."
echo ""

# Add Supabase URL
vercel env add VITE_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add VITE_SUPABASE_URL preview <<< "$SUPABASE_URL"
vercel env add VITE_SUPABASE_URL development <<< "$SUPABASE_URL"

# Add Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
vercel env add VITE_SUPABASE_ANON_KEY preview <<< "$SUPABASE_ANON_KEY"
vercel env add VITE_SUPABASE_ANON_KEY development <<< "$SUPABASE_ANON_KEY"

# Add Clarity ID if provided
if [ -n "$CLARITY_ID" ]; then
  vercel env add VITE_CLARITY_ID production <<< "$CLARITY_ID"
  vercel env add VITE_CLARITY_ID preview <<< "$CLARITY_ID"
  vercel env add VITE_CLARITY_ID development <<< "$CLARITY_ID"
fi

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "Next steps:"
echo "1. Redeploy to apply env vars: vercel --prod"
echo "2. Test your production site"
echo "3. Verify Supabase connection by completing a challenge"
echo ""
echo "Production URL: $(vercel ls --prod | grep https | head -1)"
echo ""
