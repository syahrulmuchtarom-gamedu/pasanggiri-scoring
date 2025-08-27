import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(username: string, password: string, role: string): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        { username, password_hash: hashedPassword, role }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;

    // Direct password comparison (no hash)
    if (data.password_hash !== password) return null;

    const { password_hash, ...user } = data;
    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}