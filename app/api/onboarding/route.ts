import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, goal, level, daily_time } = body;

    if (!full_name || !goal || !level || !daily_time) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Create a placeholder user without a real telegram_id yet.
    // The bot will claim this record on /start using the returned user_id.
    // We use a temporary negative ID derived from timestamp to keep UNIQUE constraint.
    const tempTelegramId = -(Date.now());

    const { data, error } = await supabase
      .from('users')
      .insert({
        telegram_id: tempTelegramId,
        full_name:   full_name.trim(),
        goal:        goal.trim(),
        level,
        daily_time:  Number(daily_time),
        is_active:   false,   // becomes true when bot deep-link is triggered
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ user_id: data.id }, { status: 201 });
  } catch (err: any) {
    console.error('[onboarding]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
