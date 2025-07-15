import { prisma } from '@/lib/prisma'
import { createUser } from '@/lib/auth-simple'
import bcrypt from 'bcryptjs'

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return users
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return []
  }
}

export async function createNewUser(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!username || !password) {
    throw new Error('Username and password are required')
  }

  try {
    const user = await createUser(username, password, email, role)
    return user
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('Username or email already exists')
    }
    throw new Error('Failed to create user')
  }
}

export async function toggleUserStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    throw new Error('Failed to update user status')
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Failed to reset password:', error)
    throw new Error('Failed to reset password')
  }
}
