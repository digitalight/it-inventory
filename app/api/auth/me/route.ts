import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-simple'

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(null, { status: 401 })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(null, { status: 500 })
  }
}
