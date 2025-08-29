import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, dan role diperlukan' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          username,
          password_hash: password,
          role,
          is_active: true
        }
      ])
      .select('id, username, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Gagal membuat user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, username, role, is_active, password } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID user diperlukan' },
        { status: 400 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (password) updateData.password_hash = password;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID user diperlukan' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}