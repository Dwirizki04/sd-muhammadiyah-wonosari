"use client";
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/admin') || 
                     pathname === '/logout' || 
                     pathname === '/login';

  return (
    <>
      {!isAuthPage && <Navbar />}
      
      <main style={{ 
        minHeight: '100vh', 
        width: '100%', 
        maxWidth: '100vw', 
        // PERBAIKAN DI SINI: Gunakan satuan terpisah (longhand)
        paddingTop: isAuthPage ? '0px' : '140px', 
        paddingRight: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        margin: 0,
        overflowX: 'hidden',
        display: 'block' 
      }}>
        {children}
      </main>
      
      {!isAuthPage && <Footer />}
    </>
  );
}