"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { subscribeThemeMode, updateActiveTheme, AVAILABLE_THEMES } from '@/lib/settingsService';

export default function AdminSettings() {
  const [activeTheme, setActiveTheme] = useState('default');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsub = subscribeThemeMode((themeId) => {
      setActiveTheme(themeId);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSelectTheme = async (themeId) => {
    if (themeId === activeTheme || updating) return;
    setUpdating(true);
    try {
      await updateActiveTheme(themeId);
      const label = AVAILABLE_THEMES.find((t) => t.id === themeId)?.label || themeId;
      Swal.fire({
        title: 'Berhasil!',
        text: `Tampilan web utama sekarang: ${label}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire('Error', 'Gagal mengubah tema', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={loadingStyle}>Memuat Pengaturan...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '10px', color: '#1a5d1a' }}>Pengaturan Tampilan</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>
        Pilih tema yang tampil di halaman utama website untuk semua pengunjung.
      </p>

      <div style={themeGrid}>
        {AVAILABLE_THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              style={themeCard(isActive, updating)}
            >
              <div style={themeCardHeader}>
                <span style={themeCardTitle}>{theme.label}</span>
                {isActive && <span style={activeBadge}>✓ Aktif</span>}
              </div>
              <div style={radioCircle(isActive)}>
                {isActive && <div style={radioDot} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '60px 40px' };
const loadingStyle = { padding: '50px', marginLeft: '20px', fontWeight: 'bold', color: '#1a5d1a' };

const themeGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  maxWidth: '800px',
};

const themeCard = (active, disabled) => ({
  background: 'white',
  padding: '22px',
  borderRadius: '18px',
  border: active ? '2px solid #1a5d1a' : '2px solid #e2e8f0',
  boxShadow: active ? '0 6px 20px rgba(26,93,26,0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: disabled ? 'wait' : 'pointer',
  transition: '0.2s',
  opacity: disabled ? 0.7 : 1,
});

const themeCardHeader = { display: 'flex', flexDirection: 'column', gap: '6px' };
const themeCardTitle = { fontWeight: 700, color: '#1e293b', fontSize: '1rem' };
const activeBadge = { fontSize: '0.75rem', color: '#1a5d1a', fontWeight: 700 };

const radioCircle = (active) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: active ? '2px solid #1a5d1a' : '2px solid #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const radioDot = { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1a5d1a' };
