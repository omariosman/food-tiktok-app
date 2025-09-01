# 🚨 URGENT: Fix Supabase Schema Error

## Problem
Error: `Could not find the table 'public.saved_dishes' in the schema cache`

This means the database tables haven't been created yet in your Supabase project.

## ✅ Quick Fix - Follow These Steps

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Execute Database Setup
1. Copy the entire content from `database/supabase-setup.sql`
2. Paste it into the Supabase SQL Editor
3. Click **RUN** to execute the script

### Step 3: Verify Tables Created
After running the script, check the **Table Editor** tab to verify these tables exist:
- ✅ `profiles`
- ✅ `restaurants` 
- ✅ `menu_items`
- ✅ `saved_dishes` ← This was missing!

### Step 4: Check Sample Data
You should see:
- 6 restaurants (Bella Italia, Burger House, etc.)
- 6 menu items with realistic pricing
- All tables have proper relationships

## 🔍 Alternative: Manual Verification

If you want to verify tables exist, run this in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- profiles
- restaurants  
- menu_items
- saved_dishes

## 🐛 Common Issues & Solutions

### Issue 1: "uuid-ossp extension not found"
**Solution:** Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue 2: "Permission denied for schema public"
**Solution:** Make sure you're using your project's service role key or have admin access.

### Issue 3: Tables exist but app still shows error
**Solution:** Clear cache and restart:
1. Stop the Expo server
2. Run `npx expo start --clear`
3. Try again

### Issue 4: RLS policies blocking access
**Solution:** Make sure you're logged in as a user. The policies only allow users to see their own saved dishes.

## 📱 Test After Setup

1. **Start the app:** `npm start`
2. **Login** with a test user
3. **Go to Saved tab** - should show empty state instead of error
4. **Try saving a dish** from Discover tab (this will require adding save buttons)

## 🔧 Environment Check

Make sure your `.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## ✨ What the Setup Script Does

1. **Creates all required tables** with proper relationships
2. **Sets up Row Level Security** so users only see their data  
3. **Creates triggers** to auto-update `times_saved` counters
4. **Inserts sample data** (6 restaurants, 6 menu items)
5. **Creates indexes** for better performance
6. **Verifies setup** with success message

## 🎯 Expected Result

After setup, your SavedScreen should:
- ✅ Load without "table not found" errors
- ✅ Show empty state message when no dishes are saved
- ✅ Allow searching (even with no results)
- ✅ Be ready for save/unsave functionality

## 🆘 Still Having Issues?

1. **Check Supabase logs** in Dashboard → Logs
2. **Verify authentication** - make sure user is logged in
3. **Check network** - ensure app can reach Supabase
4. **Clear cache** - restart Expo with `--clear` flag

The error should be completely resolved after running the setup script!