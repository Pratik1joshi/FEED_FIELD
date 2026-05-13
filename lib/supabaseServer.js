import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  // In server environments we will fail loudly if keys are missing
  throw new Error('Missing Supabase server environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false },
});

export async function fetchDocumentsByUser(userId) {
  const { data, error } = await supabaseServer
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });

  return { data, error };
}

export async function fetchAllDocuments() {
  const { data, error } = await supabaseServer
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  return { data, error };
}
