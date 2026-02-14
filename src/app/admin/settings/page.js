"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { subscribeThemeMode, updateRamadhanMode } from '@/lib/settingsService';

export default function AdminSettings() {
  const [isRamadhan, setIsRamadhan] = useState(false);
  const [loading, setLoading] = useState(true);

  // LOGIKA: Ambil status dari Service
  useEffect(() => {
    const unsub = subscribeThemeMode((status) => {
      setIsRamadhan(status);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // AKSI: Jalankan toggle melalui Service
  const handleToggle = async () => {
    try {
      await updateRamadhanMode(isRamadhan);
      Swal.fire({
        title: 'Berhasil!',
        text: `Tampilan web utama sekarang Mode ${!isRamadhan ? 'Ramadhan' : 'Normal'}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire('Error', 'Gagal mengubah tema', 'error');
    }
  };

  if (loading) return <div style={loadingStyle}>Memuat Pengaturan...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '30px', color: '#1a5d1a' }}>Pengaturan Tampilan</h2>
      
      <div style={cardStyle}>
        <div>
          <h3 style={{ margin: 0 }}>Mode Ramadhan Musiman</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Aktifkan untuk merubah wajah depan web menjadi nuansa Islami.
          </p>
        </div>
        
        {/* SAKLAR MODERN */}
        <div onClick={handleToggle} style={switchContainer(isRamadhan)}>
          <div style={switchCircle(isRamadhan)}></div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES (Menggunakan CSS-in-JS favoritmu) ---
const containerStyle = { padding: '60px 40px' };
const loadingStyle = { padding: '50px', marginLeft: '20px', fontWeight: 'bold', color: '#1a5d1a' };
const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '20px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '800px'
};

const switchContainer = (active) => ({
  width: '60px',
  height: '30px',
  backgroundColor: active ? '#1a5d1a' : '#cbd5e1',
  borderRadius: '30px',
  padding: '3px',
  cursor: 'pointer',
  transition: '0.3s',
  display: 'flex',
  alignItems: 'center'
});

const switchCircle = (active) => ({
  width: '24px',
  height: '24px',
  backgroundColor: 'white',
  borderRadius: '50%',
  transition: '0.3s',
  transform: active ? 'translateX(30px)' : 'translateX(0)'
});