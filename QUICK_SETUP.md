# Quick Supabase Setup - 5 Minutes

## What Changed?
Your app now uses **real cloud database** instead of localStorage. Data persists even after uninstalling the app!

## Step-by-Step Setup

### 1. Sign Up at Supabase
- Go to **supabase.com**
- Click "Start your project"
- Sign up with GitHub or email

### 2. Create Project
- Click "New Project"
- **Name**: `atmos-app`
- **Password**: Generate & save it
- **Region**: Mumbai (for India) or nearest to you
- Wait 2-3 minutes for setup

### 3. Get API Keys
- Go to **Project Settings** (⚙️ icon)
- Click **API**
- Copy:
  - Project URL (looks like: `https://xyz.supabase.co`)
  - `anon public` key (long string)

### 4. Update Environment File

Open `.env` file in your project root and replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Don't** include quotes, just paste the values.

### 5. Run Database Setup

In Supabase dashboard:
1. Click **SQL Editor** (left sidebar)
2. Copy ALL the SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#5-set-up-database-tables)
3. Paste in SQL Editor
4. Click **Run**
5. Wait until you see "Success" for all queries

### 6. Test It

```bash
# In your project folder
npm run dev
```

Open browser → Sign up → Create group → Add tasks

### 7. Test on Android (Important!)

```bash
# Build the app
npm run build

# Sync with Android
npx cap sync

# Open Android Studio
npx cap open android

# In Android Studio: Build → Build APK
# Install APK on your phone
```

**Test uninstall/reinstall:**
1. Sign up on APK → Create some groups/tasks
2. Close app → Uninstall from phone
3. Reinstall APK
4. Login with same email/password
5. ✅ **ALL DATA SHOULD BE THERE!**

## Common Issues

### "supabase is not defined" or build errors
Make sure you installed the package:
```bash
cd /home/engine/project && npm install @supabase/supabase-js
```

### "Failed to fetch"
- Check internet connection
- Verify API keys in `.env`
- Restart dev server: `Ctrl+C` then `npm run dev`

### "RLS violation"
Make sure you ran ALL SQL queries in the SQL Editor

## That's It! 🎉

Your data now:
- ✅ Persists across app uninstalls
- ✅ Syncs across devices
- ✅ Is backed up in the cloud
- ✅ Secure with proper authentication

## Need Help?

- Full detailed guide: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Database schema details: See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Supabase dashboard can show you all your data in real-time