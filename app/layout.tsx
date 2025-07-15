// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { getUser } from '@/lib/auth-simple';
import NavBar from '@/components/nav-bar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'School Laptop Inventory',
  description: 'Effortlessly track your school laptops and staff assignments.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar user={user} />
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 pb-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}