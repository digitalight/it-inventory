import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-simple'
import { resetUserPassword } from '@/app/admin/users/actions'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Only admins can reset passwords
    
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      )
    }

    await resetUserPassword(userId, newPassword)

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error: unknown) {
    console.error('Reset password error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred while resetting password' },
      { status: 500 }
    )
  }
}
