// src/components/AdminSidebar.jsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      confirmButtonColor: '#e74c3c'
    });
    if (result.isConfirmed) {
      await signOut(auth);
      window.location.href = '/admin';
    }
  };

  const menuItems = [
    { name: '📊 Data PPDB', path: '/admin/ppdb' },
    { name: '💰 Data Donasi', path: '/admin/donasi' }, // Menyesuaikan dengan file 
    { name: '📰 Kelola Berita', path: '/admin/news' },
    { name: '⚙️ Pengaturan Tema', path: '/admin/settings' },
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a5d1a', margin: 0, fontSize: '1.1rem' }}>Admin SDMuri</h3>
      </div>
      
      <nav style={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            style={pathname === item.path ? activeLinkStyle : linkStyle}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} style={btnLogoutStyle}>
        🚪 Keluar Panel
      </button>
    </aside>
  );
}

// --- STYLING SIDEBAR ---
const sidebarStyle = {
  width: '260px',
  backgroundColor: 'white',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  borderRight: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100
};

const linkStyle = {
  display: 'block',
  padding: '15px 25px',
  color: '#64748b',
  textDecoration: 'none',
  fontSize: '0.95rem',
  transition: '0.2s'
};

const activeLinkStyle = {
  ...linkStyle,
  color: '#1a5d1a',
  backgroundColor: '#f0f4f0',
  fontWeight: 'bold',
  borderRight: '4px solid #1a5d1a'
};

const btnLogoutStyle = {
  margin: '20px',
  padding: '12px',
  backgroundColor: '#fff1f2',
  color: '#e11d48',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};