import { NextResponse } from 'next/server';
import { fetchDocumentsByUser, fetchAllDocuments } from '@/lib/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let result;
    if (userId) {
      result = await fetchDocumentsByUser(userId);
    } else {
      result = await fetchAllDocuments();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    // Return a minimal public shape
    const rows = (result.data || []).map((r) => ({
      id: r.id,
      title: r.title,
      location_slug: r.location_slug,
      document_type: r.document_type,
      format: r.format,
      file_path: r.file_path,
      file_url: r.file_url,
      uploaded_at: r.uploaded_at,
      user_id: r.user_id,
    }));

    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
