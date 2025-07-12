# SkillSwap Platform Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the project root:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Get Supabase Credentials**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or use existing one
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key
   - Paste them in your `.env` file

4. **Run Database Migration**
   ```bash
   # If you have Supabase CLI installed
   supabase db push
   
   # Or run the SQL manually in Supabase dashboard
   # Copy the contents of supabase/migrations/20250712051027_sweet_meadow.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### White Screen Issues

If you see a white screen:

1. **Check Console Errors**
   - Open browser developer tools (F12)
   - Look for error messages in the Console tab

2. **Missing Environment Variables**
   - Ensure `.env` file exists in project root
   - Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Restart the development server after adding `.env`

3. **Supabase Connection Issues**
   - Verify your Supabase project is active
   - Check that your API keys are correct
   - Ensure Row Level Security (RLS) is enabled on tables

### Development Mode

The app will work in development mode even without Supabase configured, but authentication won't function. You'll see console warnings about missing configuration.

## Features

- ✅ User registration and login
- ✅ Profile management
- ✅ Skill browsing and filtering
- ✅ Swap request system
- ✅ Admin panel
- ✅ Responsive design

## Next Steps

1. Configure Supabase with your credentials
2. Test user registration
3. Customize the UI and features as needed
4. Deploy to production 