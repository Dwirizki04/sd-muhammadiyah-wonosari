"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Import Mesin
import { 
  subscribeDonationStats, 
  subscribeDonations, 
  toggleProgramStatus, 
  resetCollectedAmount, 
  verifyDonationEntry 
} from '@/lib/donationService';

export default function AdminDonasi() {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [stats, setStats] = useState({ collected: 0, target: 0, isOpen: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubStats = subscribeDonationStats(setStats);
    const unsubDonations = subscribeDonations(setPendingDonations);
    setLoading(false);
    return () => { unsubStats(); unsubDonations(); };
  }, []);

  const handleVerify = async (donasi) => {
    const result = await Swal.fire({
      title: 'Verifikasi Dana?',
      html: `Konfirmasi dana <b>Rp ${donasi.amount.toLocaleString('id-ID')}</b> dari <b>${donasi.name}</b> sudah masuk?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Sudah Masuk',
      confirmButtonColor: '#1a5d1a',
    });

    if (result.isConfirmed) {
      try {
        await verifyDonationEntry(donasi.id, donasi.amount);
        Swal.fire({ title: "Terverifikasi!", icon: "success", timer: 1500, showConfirmButton: false });
      } catch (e) { Swal.fire("Error", "Gagal update.", "error"); }
    }
  };

  const handleToggle = async () => {
    await toggleProgramStatus(stats.isOpen);
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Reset Total Dana?',
      text: "Total terkumpul akan kembali ke Rp 0 di website utama.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      await resetCollectedAmount();
      Swal.fire("Berhasil!", "Dana direset.", "success");
    }
  };

  if (loading) return null;

  return (
    <div style={adminContainer}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={headerFlex}>
          <div>
            <h2 style={titleStyle}>💰 Dashboard Manajemen Donasi</h2>
            <p style={subtitleStyle}>SD Muhammadiyah Wonosari • Program Wakaf Pembangunan</p>
          </div>
          <Link href="/" style={backLink}>Lihat Web Utama</Link>
        </div>

        {/* STATS GRID */}
        <div style={statsGrid}>
          {/* TOTAL DANA */}
          <div style={cardStat}>
            <div style={iconCircle}><i className="fas fa-wallet"></i></div>
            <div style={{ flex: 1 }}>
              <span style={labelStat}>Total Dana Terkumpul</span>
              <h2 style={valueStat}>Rp {stats.collected.toLocaleString('id-ID')}</h2>
              <div style={progressBarContainer}>
                <div style={progressBarFill(Math.min((stats.collected/stats.target)*100, 100))}></div>
              </div>
              <button onClick={handleReset} style={btnResetStyle}>Reset Tampilan Dana</button>
            </div>
          </div>

          {/* SAKLAR STATUS */}
          <div style={cardStat}>
            <div style={iconCircleAlt}><i className="fas fa-power-off"></i></div>
            <div style={{ flex: 1 }}>
              <span style={labelStat}>Status Program Publik</span>
              <div style={statusFlex}>
                <b style={{ color: stats.isOpen ? '#2e7d32' : '#c62828' }}>
                  {stats.isOpen ? '● SEDANG DIBUKA' : '● SEDANG DITUTUP'}
                </b>
                <button onClick={handleToggle} style={btnToggle(stats.isOpen)}>
                  {stats.isOpen ? 'Tutup Program' : 'Buka Program'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div style={tableCard}>
          <div style={tableHeader}>
            <h4 style={{ margin: 0 }}>Antrean Verifikasi</h4>
            <span style={badgeCount}>{pendingDonations.length} Transaksi</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableMain}>
              <thead>
                <tr style={thRow}>
                  <th style={thCustom}>DONATUR</th>
                  <th style={thCustom}>NOMINAL</th>
                  <th style={thCustom}>STATUS</th>
                  <th style={thCustom}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {pendingDonations.map((d) => (
                    <motion.tr key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={trCustom}>
                      <td style={tdCustom}>
                        <div style={{ fontWeight: '700' }}>{d.name}</div>
                        <small style={{ color: '#94a3b8' }}>{d.date?.toDate().toLocaleDateString('id-ID')}</small>
                      </td>
                      <td style={{ ...tdCustom, fontWeight: '800', color: '#1a5d1a' }}>
                        Rp {d.amount.toLocaleString('id-ID')}
                      </td>
                      <td style={tdCustom}>
                        <span style={badgeStyle(d.status === 'verified')}>
                          {d.status === 'verified' ? '✓ VERIFIED' : '⏳ PENDING'}
                        </span>
                      </td>
                      <td style={tdCustom}>
                        {d.status === 'pending' && (
                          <button onClick={() => handleVerify(d)} style={btnVerif}>Verifikasi</button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CSS OBJEK (Tetap Menggunakan Style Favoritmu) ---
// ... (Masukkan semua konstanta style yang kamu buat sebelumnya di sini)
const adminContainer = { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '120px 20px 60px' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' };
const titleStyle = { color: '#0f172a', fontSize: '1.8rem', fontWeight: '800', margin: 0 };
const subtitleStyle = { color: '#64748b', marginTop: '5px' };
const backLink = { padding: '10px 20px', background: 'white', borderRadius: '12px', color: '#1a5d1a', textDecoration: 'none', fontWeight: '700', border: '1px solid #e2e8f0' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' };
const cardStat = { background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' };
const iconCircle = { width: '60px', height: '60px', borderRadius: '18px', background: '#f0fdf4', color: '#1a5d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' };
const iconCircleAlt = { ...iconCircle, background: '#fff1f2', color: '#e11d48' };
const labelStat = { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' };
const valueStat = { margin: '5px 0', fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' };
const progressBarContainer = { width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' };
const progressBarFill = (w) => ({ width: `${w}%`, height: '100%', background: '#1a5d1a', borderRadius: '10px' });
const statusFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' };
const btnToggle = (isOpen) => ({ padding: '8px 16px', borderRadius: '10px', background: isOpen ? '#fee2e2' : '#dcfce7', color: isOpen ? '#b91c1c' : '#15803d', border: 'none', cursor: 'pointer', fontWeight: '700' });
const tableCard = { background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', overflow: 'hidden' };
const tableHeader = { padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const badgeCount = { background: '#f1f5f9', padding: '5px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' };
const tableMain = { width: '100%', borderCollapse: 'collapse' };
const thRow = { background: '#f8fafc', textAlign: 'left' };
const thCustom = { padding: '15px 30px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' };
const trCustom = { borderBottom: '1px solid #f8fafc' };
const tdCustom = { padding: '20px 30px', verticalAlign: 'middle' };
const badgeStyle = (isVerified) => ({ padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', background: isVerified ? '#dcfce7' : '#fef9c3', color: isVerified ? '#15803d' : '#a16207' });
const btnVerif = { background: '#1a5d1a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnResetStyle = { marginTop: '15px', padding: '6px 12px', fontSize: '0.75rem', background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };