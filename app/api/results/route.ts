import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get('kelas');
    const golongan = searchParams.get('golongan');
    const kategori = searchParams.get('kategori');

    // Get all competitions with scores
    let query = `
      SELECT 
        c.id,
        c.desa,
        c.kelas,
        c.golongan,
        c.kategori,
        c.status,
        COALESCE(
          (SELECT SUM(s.total_score) 
           FROM scores s 
           WHERE s.competition_id = c.id), 0
        ) as total_score,
        COALESCE(
          (SELECT COUNT(*) 
           FROM scores s 
           WHERE s.competition_id = c.id), 0
        ) as juri_count
      FROM competitions c
      WHERE c.status = 'COMPLETED'
    `;

    const params = [];
    if (kelas) {
      query += ` AND c.kelas = $${params.length + 1}`;
      params.push(kelas);
    }
    if (golongan) {
      query += ` AND c.golongan = $${params.length + 1}`;
      params.push(golongan);
    }
    if (kategori) {
      query += ` AND c.kategori = $${params.length + 1}`;
      params.push(kategori);
    }

    query += ` ORDER BY c.desa, c.kategori`;

    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: query,
      params: params
    });

    if (error) throw error;

    // Group by desa and calculate totals
    const desaResults: any = {};
    
    data.forEach((row: any) => {
      const key = `${row.desa}-${row.kelas}-${row.golongan}`;
      if (!desaResults[key]) {
        desaResults[key] = {
          desa: row.desa,
          kelas: row.kelas,
          golongan: row.golongan,
          categories: {},
          total_score: 0
        };
      }
      
      desaResults[key].categories[row.kategori] = row.total_score;
      desaResults[key].total_score += row.total_score;
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