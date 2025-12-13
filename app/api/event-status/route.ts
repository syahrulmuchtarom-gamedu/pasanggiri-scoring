import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get('kelas');

  try {
    let query = supabase.from('event_status').select('*');
    
    if (kelas) {
      query = query.eq('kelas', kelas);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kelas, is_locked, locked_by } = body;

    const { data, error } = await supabase
      .from('event_status')
      .upsert({
        kelas,
        is_locked,
        locked_at: is_locked ? new Date().toISOString() : null,
        locked_by: is_locked ? locked_by : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'kelas' })
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
