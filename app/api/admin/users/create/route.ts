import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-simple'
import { createUser } from '@/lib/auth-simple'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Only admins can create users
    
    const { username, password, email, role } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const user = await createUser(username, password, email, role)

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error: unknown) {
    console.error('Create user error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred while creating the user' },
      { status: 500 }
    )
  }
}
