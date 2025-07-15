import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-simple'
import { toggleUserStatus } from '@/app/admin/users/actions'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Only admins can toggle user status
    
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const updatedUser = await toggleUserStatus(userId)

    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        isActive: updatedUser.isActive
      }
    })
  } catch (error: unknown) {
    console.error('Toggle user status error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred while updating user status' },
      { status: 500 }
    )
  }
}
