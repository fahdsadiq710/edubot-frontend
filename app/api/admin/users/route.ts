import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

function verifyToken(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token');
  return token === process.env.ADMIN_PASSWORD;
}

/* ── GET /api/admin/users — list all users ────────────────── */
export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('admin_user_overview')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data });
}

/* ── POST /api/admin/users — manually add a user ─────────── */
export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { telegram_id, full_name } = await req.json();
  if (!telegram_id || !full_name) {
    return NextResponse.json({ error: 'telegram_id and full_name are required.' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('users')
    .insert({ telegram_id: Number(telegram_id), full_name: full_name.trim(), is_active: true })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ user_id: data.id }, { status: 201 });
}

/* ── DELETE /api/admin/users — hard-delete a user ────────── */
export async function DELETE(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { telegram_id } = await req.json();
  if (!telegram_id) {
    return NextResponse.json({ error: 'telegram_id is required.' }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Step 1: soft-ban immediately so the bot stops responding right away
  await supabase.rpc('deactivate_user', { p_telegram_id: Number(telegram_id) });

  // Step 2: hard delete (progress rows cascade)
  const { error } = await supabase.rpc('delete_user', { p_telegram_id: Number(telegram_id) });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
