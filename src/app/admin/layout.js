"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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

  // Ingat preferensi buka/tutup sidebar antar sesi (misal admin lebih suka
  // kerja dengan sidebar tertutup terus di layar sempit/dual-monitor)
  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    if (saved !== null) setSidebarOpen(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Di HP, otomatis tutup sidebar tiap pindah halaman (supaya tidak
  // menutupi konten). Di layar lebih lebar, preferensi admin dibiarkan.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
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
      {/* Overlay cuma dipakai di HP, supaya klik di luar sidebar menutup */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`admin-sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        <AdminSidebar />
      </aside>

      {/* Tombol toggle tunggal, selalu ada di semua ukuran layar --
          nempel di tepi sidebar, ikut geser sesuai status buka/tutup */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        style={{ left: isSidebarOpen ? '260px' : '0px' }}
        aria-label={isSidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
        title={isSidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
      >
        <i className={`fas fa-chevron-${isSidebarOpen ? 'left' : 'right'}`}></i>
      </button>

      <main className={`admin-main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        {children}
      </main>

      <style jsx global>{`
        .admin-layout-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: #f1f5f9;
          position: relative;
        }

        .admin-sidebar-container {
          width: 260px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: white;
          z-index: 1000;
          transition: transform 0.25s ease;
          box-shadow: 2px 0 16px rgba(0,0,0,0.05);
        }

        .admin-sidebar-container.closed {
          transform: translateX(-100%);
        }

        .sidebar-toggle-btn {
          position: fixed;
          top: 24px;
          z-index: 1001;
          background: #1a5d1a;
          color: white;
          border: none;
          width: 30px;
          height: 44px;
          border-radius: 0 10px 10px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          transition: left 0.25s ease, background 0.2s ease;
          box-shadow: 2px 2px 10px rgba(0,0,0,0.12);
        }
        .sidebar-toggle-btn:hover {
          background: #14532d;
        }

        .admin-main-content {
          flex-grow: 1;
          width: 100%;
          padding: 24px;
          transition: margin-left 0.25s ease;
        }
        .admin-main-content.shifted {
          margin-left: 260px;
        }

        .sidebar-overlay {
          display: none;
        }

        /* Layar HP: sidebar jadi overlay penuh (tidak mendorong konten),
           tombol toggle selalu nempel di pojok kiri layar */
        @media (max-width: 768px) {
          .admin-main-content.shifted {
            margin-left: 0;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
          .sidebar-toggle-btn {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
