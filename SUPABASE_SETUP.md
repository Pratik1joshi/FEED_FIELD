# Supabase Integration Setup

This guide walks you through setting up Supabase for authentication and file storage.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (or log in)
2. Click "New Project"
3. Enter a project name (e.g., "IHRR Expeditions")
4. Set a database password
5. Choose your region (closest to your users)
6. Click "Create new project" and wait for initialization

## Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings** (bottom left)
2. Click **API** in the sidebar
3. Copy these two values:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Create Environment Variables

1. Create a `.env.local` file in the project root (copy from `.env.local.example`)
2. Paste your Supabase URL and anon key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Create a Storage Bucket

1. In Supabase, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it `documents`
4. Enable **Public bucket** (so files can be downloaded)
5. Click **Create bucket**

## Step 5: Create Test Users

1. In Supabase, go to **Authentication** (left sidebar)
2. Click **Users** tab
3. Click **Add user** → **Create new user**
4. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
5. Click **Save user**
6. Repeat for additional test users

## Step 6: Test the Setup

1. Run `npm install` to install Supabase package
2. Run `npm run dev`
3. Open the app at `http://localhost:3000`
4. Click the footer "Admin Login" button
5. Sign in with your test account
6. Try uploading a PDF from the admin panel

## Step 7: Production Setup

For production, you'll need to:

1. Set up a proper authentication method (OAuth, Magic Links, etc.)
2. Create a database table to track uploads metadata
3. Set up proper access control policies
4. Configure CORS properly
5. Add email verification

## Database Setup (Optional but Recommended)

Create a table to track uploads:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  location_slug TEXT NOT NULL,
  document_type TEXT NOT NULL,
  format TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_location ON documents(location_slug);
```

## Troubleshooting

### Missing API Keys Error
- Check that your `.env.local` file exists in the root directory
- Verify the environment variable names match exactly (case-sensitive)
- Restart your dev server after adding/changing env variables

### Authentication Fails
- Verify the email/password match what you created in Supabase
- Check browser console for specific error messages
- Make sure the bucket exists in Supabase Storage

### File Upload Fails
- Check that the `documents` bucket exists and is public
- Verify your user is authenticated (footer shows email)
- Check browser console for error details

## Security Notes

⚠️ **Never** commit `.env.local` to git (it's in `.gitignore`)

⚠️ Keep your `NEXT_PUBLIC_SUPABASE_ANON_KEY` safe - it's public but tied to your project

⚠️ Use Row Level Security (RLS) policies to restrict file access in production

## Next Steps

- Add email verification
- Implement OAuth login (Google, GitHub, etc.)
- Create a database table for tracking uploads
- Set up proper access control policies
- Add file download limits and storage quotas
