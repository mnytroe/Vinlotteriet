import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const passwordHash = process.env.SITE_PASSWORD_HASH
    
    if (!passwordHash) {
      console.error('SITE_PASSWORD_HASH is not set in environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const isValid = await bcrypt.compare(password, passwordHash)
    
    if (isValid) {
      // Sett en auth cookie
      cookies().set('auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dager
        path: '/',
      })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Feil passord' }, { status: 401 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Logg ut - fjern cookie
export async function DELETE() {
  cookies().delete('auth')
  return NextResponse.json({ success: true })
}

