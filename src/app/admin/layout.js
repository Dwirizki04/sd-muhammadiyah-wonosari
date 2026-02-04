// src/app/admin/layout.js
"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Jika TIDAK login dan mencoba masuk ke halaman selain login (/admin)
        if (pathname !== '/admin') {
          router.replace('/admin');
        }
      } else {
        // Jika SUDAH login dan berada di halaman login (/admin), arahkan ke dashboard
        if (pathname === '/admin') {
          router.replace('/admin/ppdb');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#1a5d1a', marginBottom: '15px' }}></i>
          <p style={{ color: '#7f8c8d' }}>Memverifikasi Sesi Admin...</p>
        </div>
      </div>
      
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ flexGrow: 1, marginLeft: '260px' }}>
        {children}
      </main>
    </div>
  );

  return <>{children}</>;
}