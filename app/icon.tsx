import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default async function Icon() {
  try {
    const logoPath = join(process.cwd(), 'public', 'images', 'logo.png')
    const logoBuffer = await readFile(logoPath)
    return new Response(logoBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    // Fallback jika logo.png tidak ditemukan
    return new Response(
      '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#000"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="20" font-family="Arial">P</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    )
  }
}