import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Temporäres Debugging
    console.log('Eingegebenes Passwort:', password)
    console.log('Gespeichertes Passwort:', process.env.ADMIN_PASSWORD)
    
    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ 
      success: false,
      debug: process.env.ADMIN_PASSWORD ? 'Passwort ist gesetzt' : 'Passwort ist nicht gesetzt'
    }, { status: 401 })
  } catch (error) {
    console.error('Auth Error:', error)
    return NextResponse.json(
      { error: 'Authentifizierungsfehler' },
      { status: 500 }
    )
  }
} 