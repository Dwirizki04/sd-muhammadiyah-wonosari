"use client";
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Logika sembunyikan Navbar & Footer di halaman Admin, Logout, dan Login
  const isAuthPage = pathname.startsWith('/admin') || 
                     pathname === '/logout' || 
                     pathname === '/login';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}