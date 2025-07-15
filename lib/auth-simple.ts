import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface AuthUser {
  id: string
  username: string
  email?: string | null
  role: string
  isAuthenticated: boolean
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth-session')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    if (session.userId) {
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { 
          id: session.userId,
          isActive: true
        }
      })
      
      if (user) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isAuthenticated: true
        }
      }
    }
  } catch (error) {
    console.error('Invalid session cookie:', error)
  }

  return null
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    redirect('/')
  }
  
  return user
}

export async function validateCredentials(username: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        username,
        isActive: true
      }
    })

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAuthenticated: true
    }
  } catch (error) {
    console.error('Error validating credentials:', error)
    return null
  }
}

export async function createUser(username: string, password: string, email?: string, role: string = 'user'): Promise<AuthUser> {
  const hashedPassword = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
      role
    }
  })

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isAuthenticated: true
  }
}
