# Supabase Row Level Security (RLS) Policies

If you created the `documents` table and are getting "violates row-level security policy" errors, follow these steps.

## Step 1: Enable RLS on the documents table

1. Go to Supabase dashboard → **SQL Editor**
2. Run this SQL:

```sql
-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
```

## Step 2: Create Policies

Run these policies one at a time in the SQL Editor:

### Policy 1: Allow users to insert their own documents

```sql
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Policy 2: Allow users to view their own documents

```sql
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy 3: Allow users to update their own documents

```sql
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Policy 4: Allow users to delete their own documents

```sql
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Verify RLS is Enabled

1. Go to **Authentication** → **Policies** in the Supabase dashboard
2. Click on the `documents` table
3. You should see all 4 policies listed
4. Make sure the table shows "RLS is ON"

## If You Don't Have a documents Table

If you haven't created a documents table yet, you can:

**Option A: Use Storage Only** (Simpler - recommended for MVP)
- Files are stored in Supabase Storage (public bucket)
- No database table needed
- This is what the current code does

**Option B: Track Metadata in Database** (Full version)
- Create the documents table with RLS policies
- Modify UploadPanel to insert metadata after file upload
- Sync the upload list from database instead of client state

## Current Code Status

The current `UploadPanel.js` only uploads files to Storage, not to a database table. If you want to use a database table, you'd need to:

1. Create the documents table with RLS policies (above)
2. Update UploadPanel to call a server action or API route that inserts the metadata
3. Update AppStateProvider to fetch documents from the database instead of keeping them in state

For now, if you don't need to track metadata in a database, you can skip the documents table entirely and just use Storage.

## Troubleshooting

### Still Getting RLS Error?
- Verify RLS is ON: `SELECT relrowsecurity FROM pg_class WHERE relname = 'documents';` (should return `t`)
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'documents';`
- Make sure you're signed in (check footer shows your email)
- Try signing out and signing back in

### Column Not Found?
- Make sure the documents table has all columns: `id, user_id, title, location_slug, document_type, format, file_path, file_url, created_at`
- Or create a simpler table that matches your needs
