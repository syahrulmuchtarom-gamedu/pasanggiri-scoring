import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { competition_id, juri_name, criteria_scores, total_score } = await request.json();

    // Check if juri already scored this competition
    const { data: existingScore } = await supabaseAdmin
      .from('scores')
      .select('id')
      .eq('competition_id', competition_id)
      .eq('juri_name', juri_name)
      .single();

    if (existingScore) {
      return NextResponse.json(
        { error: 'Anda sudah memberikan nilai untuk pertandingan ini' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert([
        {
          competition_id,
          juri_name,
          criteria_scores,
          total_score
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan nilai' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competition_id = searchParams.get('competition_id');

    let query = supabaseAdmin
      .from('scores')
      .select(`
        *,
        competitions (
          desa,
          kelas,
          golongan,
          kategori
        )
      `);

    if (competition_id) {
      query = query.eq('competition_id', competition_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data nilai' },
      { status: 500 }
    );
  }
}