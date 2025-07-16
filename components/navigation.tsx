"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Laptop, Users, Cable, ShoppingCart, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email?: string | null;
  role: string;
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <div className="h-16 bg-gradient-to-r from-blue-700 to-indigo-800" />; // Loading placeholder
  }

  if (!user) {
    return null; // Don't show navigation if not authenticated
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" passHref>
          <span className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors">
            IT Inventory
          </span>
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
          
          {/* Show Users link only for admin */}
          {user.role === 'admin' && (
            <Link href="/admin/users" passHref>
              <Button variant="ghost" className="text-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                Users
              </Button>
            </Link>
          )}
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt={user.username} />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || 'No email'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
