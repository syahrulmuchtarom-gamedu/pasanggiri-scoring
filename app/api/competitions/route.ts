import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { desa, kelas, golongan, kategori } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('competitions')
      .insert([
        {
          desa,
          kelas,
          golongan,
          kategori,
          status: 'ACTIVE'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pertandingan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    const kelas = request.nextUrl.searchParams.get('kelas');

    let query = supabaseAdmin.from('competitions').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (kelas) {
      query = query.eq('kelas', kelas);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const response = NextResponse.json(data);
    
    // Add caching headers for better mobile performance
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=30');
    
    return response;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pertandingan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID pertandingan diperlukan' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('competitions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competition:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pertandingan' },
      { status: 500 }
    );
  }
}