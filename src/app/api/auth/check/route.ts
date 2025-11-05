import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_TOKEN = process.env.ADMIN_SESSION_SECRET || 'dekord_admin_secure_session_2025'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  
  const isAuthenticated = session?.value === SESSION_TOKEN
  
  return NextResponse.json({ authenticated: isAuthenticated })
}
