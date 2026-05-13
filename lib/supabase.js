import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function insertDocumentRecord(record) {
  const { data, error } = await supabase
    .from("documents")
    .insert(record)
    .select()
    .single();
  return { data, error };
}

export async function fetchDocumentsForUser(userId) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });
  return { data, error };
}

export async function uploadFileToBucket(
  bucketName,
  fileName,
  fileData,
  contentType,
) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileData, {
      contentType,
      upsert: true,
    });
  return { data, error };
}

export async function getPublicUrl(bucketName, fileName) {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteFile(bucketName, fileName) {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);
  return { error };
}
