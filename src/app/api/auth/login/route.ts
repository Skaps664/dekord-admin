import { NextResponse, NextRequest } from 'next/server'

const ADMIN_CREDENTIALS = {
  email: "sudais@dekord.online",
  password: "YOutuber123!@#",
  twoFA: "456456"
}

// Generate a secure session token
const SESSION_TOKEN = process.env.ADMIN_SESSION_SECRET || 'dekord_admin_secure_session_2025'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, twoFA } = body

    // Verify credentials
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password &&
      twoFA === ADMIN_CREDENTIALS.twoFA
    ) {
      // Create response with session cookie (no maxAge = expires when browser closes)
      const response = NextResponse.json({ success: true })
      
      // Set secure HTTP-only session cookie (deleted when browser closes)
      response.cookies.set({
        name: 'admin_session',
        value: SESSION_TOKEN,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        // No maxAge = session cookie (deleted when browser/tab closes)
        path: '/',
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
