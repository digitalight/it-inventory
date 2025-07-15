"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Laptop, Users, Cable, ShoppingCart, LogOut, UserCog } from 'lucide-react'

interface NavBarProps {
  user?: {
    id: string
    username: string
    email?: string | null
    role: string
    isAuthenticated: boolean
  } | null
}

export default function NavBar({ user }: NavBarProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user?.isAuthenticated) {
    return null // Don't show nav if not authenticated
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" passHref>
          <span className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors">IT Inventory</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/laptops" passHref>
            <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              Laptops
            </Button>
          </Link>
          <Link href="/staff" passHref>
            <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff
            </Button>
          </Link>
          <Link href="/parts" passHref>
            <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
              <Cable className="h-4 w-4" />
              Parts
            </Button>
          </Link>
          <Link href="/orders" passHref>
            <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Button>
          </Link>
          {user.role === 'admin' && (
            <Link href="/admin/users" passHref>
              <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Users
              </Button>
            </Link>
          )}
          <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-blue-500">
            <div className="text-sm text-blue-200">
              <div>Welcome, {user.username}</div>
              <div className="text-xs text-blue-300 capitalize">{user.role}</div>
            </div>
            <Button 
              onClick={handleLogout}
              disabled={loggingOut}
              variant="ghost" 
              className="text-white hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
