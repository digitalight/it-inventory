// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner'; // Make sure this is imported
import { Home, Laptop, Users, Cable } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'School Laptop Inventory',
  description: 'Effortlessly track your school laptops and staff assignments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" passHref>
              <span className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors">Laptop Tracker</span>
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
              {/* You can add more navigation links here later, e.g., for staff */}
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 pb-10">{children}</main> {/* Added padding-bottom for content */}
        <Toaster /> {/* IMPORTANT: This renders your toast notifications */}
      </body>
    </html>
  );
}