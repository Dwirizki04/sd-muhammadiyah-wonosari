"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State untuk Toggle
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (pathname !== '/admin') {
          router.replace('/admin');
        }
      } else {
        if (pathname === '/admin') {
          router.replace('/admin/ppdb');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Tutup sidebar otomatis saat berpindah halaman (di HP)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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

  if (pathname === '/admin') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout-wrapper">
      {/* Tombol Toggle Mobile */}
      <div className="mobile-header">
        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <i className={isSidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>
        <span className="mobile-logo-text">Admin SDM</span>
      </div>

      {/* Overlay untuk menutup menu saat klik di luar (hanya di HP) */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`admin-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <AdminSidebar />
      </aside>

      <main className="admin-main-content">
        {children}
      </main>

      <style jsx global>{`
        .admin-layout-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: #f1f5f9;
        }

        /* Sidebar Desktop */
        .admin-sidebar-container {
          width: 260px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: white;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .admin-main-content {
          flex-grow: 1;
          margin-left: 260px;
          width: calc(100% - 260px);
          padding: 20px;
          transition: all 0.3s ease;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          align-items: center;
          padding: 0 20px;
          z-index: 1100;
        }

        .menu-toggle-btn {
          background: #1a5d1a;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          margin-right: 15px;
        }

        .mobile-logo-text {
          font-weight: 800;
          color: #1a5d1a;
        }

        /* Responsive Mobile */
        @media (max-width: 768px) {
          .mobile-header { display: flex; }
          
          .admin-sidebar-container {
            transform: translateX(-100%); /* Sembunyi di kiri */
          }

          .admin-sidebar-container.open {
            transform: translateX(0); /* Muncul saat di-toggle */
          }

          .admin-main-content {
            margin-left: 0;
            width: 100%;
            padding-top: 80px; /* Jarak agar tidak tertutup header mobile */
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
        }
      `}</style>
    </div>
  );
}