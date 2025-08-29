import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateFinalScore } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const kelas = request.nextUrl.searchParams.get('kelas');
    const golongan = request.nextUrl.searchParams.get('golongan');
    const kategori = request.nextUrl.searchParams.get('kategori');

    // Get competitions
    let competitionsQuery = supabaseAdmin
      .from('competitions')
      .select('*')
      .eq('status', 'COMPLETED');

    if (kelas) competitionsQuery = competitionsQuery.eq('kelas', kelas);
    if (golongan) competitionsQuery = competitionsQuery.eq('golongan', golongan);
    if (kategori) competitionsQuery = competitionsQuery.eq('kategori', kategori);

    const { data: competitions, error: compError } = await competitionsQuery;
    if (compError) throw compError;

    // Get all scores
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from('scores')
      .select('*');
    if (scoresError) throw scoresError;

    // Group by desa and calculate totals
    const desaResults: any = {};
    
    competitions.forEach((comp: any) => {
      const key = `${comp.desa}-${comp.kelas}-${comp.golongan}`;
      if (!desaResults[key]) {
        desaResults[key] = {
          desa: comp.desa,
          kelas: comp.kelas,
          golongan: comp.golongan,
          categories: {},
          total_score: 0
        };
      }
      
      // Calculate total score for this competition using new scoring system
      const competitionScores = scores.filter((score: any) => score.competition_id === comp.id);
      const totalScore = calculateFinalScore(competitionScores);
      
      desaResults[key].categories[comp.kategori] = totalScore;
      desaResults[key].total_score += totalScore;
    });

    // Convert to array and sort by total score
    const results = Object.values(desaResults).sort((a: any, b: any) => b.total_score - a.total_score);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil hasil' },
      { status: 500 }
    );
  }
}