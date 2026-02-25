"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

// Import Mesin Layanan Donasi
import { 
  subscribeDonationStats, 
  subscribeDonations, 
  toggleProgramStatus, 
  resetCollectedAmount, 
  verifyDonationEntry,
  removeDonationEntry
} from '@/lib/donationService';

export default function AdminDonasi() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ collected: 0, target: 0, isOpen: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sinkronisasi Statistik Real-time
    const unsubStats = subscribeDonationStats((data) => {
      setStats(data || { collected: 0, target: 0, isOpen: false });
      setLoading(false);
    });

    // Sinkronisasi Daftar Donasi Real-time
    const unsubDonations = subscribeDonations((data) => {
      setDonations(data || []);
    });

    return () => {
      unsubStats();
      unsubDonations();
    };
  }, []);

  const handleToggleStatus = async () => {
    try {
      await toggleProgramStatus(stats.isOpen); //
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: stats.isOpen ? 'Program Ditutup' : 'Program Dibuka',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (e) {
      Swal.fire('Error', 'Gagal mengubah status program', 'error');
    }
  };

  const handleResetSaldo = async () => {
    const result = await Swal.fire({
      title: 'Reset Saldo?',
      text: "Jumlah dana terkumpul akan kembali ke Rp 0!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset!'
    });

    if (result.isConfirmed) {
      try {
        await resetCollectedAmount(); //
        Swal.fire('Direset!', 'Saldo telah kembali ke nol.', 'success');
      } catch (e) {
        Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  if (loading) return <div style={styles.loading}>Menghubungkan ke Pusat Data...</div>;

  return (
    <div style={styles.pageWrapper}>
      
      {/* 1. HEADER & RINGKASAN SALDO */}
      <div style={styles.topSection}>
        <div>
          <h1 style={styles.pageTitle}>Manajemen Donasi</h1>
          <p style={styles.pageSubtitle}>Pantau dan verifikasi kontribusi donatur</p>
        </div>

        <div style={styles.statsCard}>
          <div style={styles.statsInfo}>
            <span style={styles.statsLabel}>TOTAL TERKUMPUL</span>
            <h2 style={styles.totalAmount}>Rp {stats.collected?.toLocaleString('id-ID')}</h2>
            <div style={styles.targetInfo}>Target: Rp {stats.target?.toLocaleString('id-ID')}</div>
          </div>
          <div style={styles.statsActions}>
             <button onClick={handleToggleStatus} style={stats.isOpen ? styles.btnOpen : styles.btnClosed}>
               {stats.isOpen ? '🟢 Aktif' : '🔴 Nonaktif'}
             </button>
             <button onClick={handleResetSaldo} style={styles.btnReset}>🔄 Reset</button>
          </div>
        </div>
      </div>

      {/* 2. DAFTAR RIWAYAT DONASI */}
      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h3>Riwayat Kontribusi</h3>
          <div style={styles.badgeCount}>{donations.length} Transaksi</div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Donatur</th>
                <th style={styles.th}>Jumlah</th>
                <th style={styles.th}>Metode</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {donations.map((item) => (
                  <motion.tr 
                    key={item.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    style={styles.tr}
                  >
                    <td style={styles.td}>
                      <div style={styles.donaturName}>{item.name}</div>
                      <div style={styles.donaturDate}>{item.date?.toDate?.().toLocaleDateString('id-ID')}</div>
                    </td>
                    <td style={styles.td}><strong>Rp {item.amount?.toLocaleString('id-ID')}</strong></td>
                    <td style={styles.td}>{item.method || 'Transfer'}</td>
                    <td style={styles.td}>
                      <span style={item.isVerified ? styles.badgeVerified : styles.badgePending}>
                        {item.isVerified ? 'Terverifikasi' : 'Menunggu'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionGroup}>
                        {!item.isVerified && (
                          <button 
                            onClick={() => verifyDonationEntry(item.id, item.amount)} //
                            style={styles.btnActionCheck} 
                            title="Verifikasi"
                          >✅</button>
                        )}
                        <button 
                          onClick={() => removeDonationEntry(item.id)} //
                          style={styles.btnActionDelete} 
                          title="Hapus"
                        >🗑️</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {donations.length === 0 && (
            <div style={styles.emptyState}>Belum ada data donasi masuk.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MODERN STYLES ---
const styles = {
  pageWrapper: { padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  loading: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' },
  
  topSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
  pageTitle: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 },
  pageSubtitle: { color: '#64748b', margin: '5px 0 0 0' },

  statsCard: { background: 'white', padding: '25px', borderRadius: '24px', display: 'flex', gap: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', borderLeft: '6px solid #1a5d1a' },
  statsLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px' },
  totalAmount: { fontSize: '1.8rem', fontWeight: '900', color: '#1a5d1a', margin: '5px 0' },
  targetInfo: { fontSize: '0.85rem', color: '#64748b' },
  statsActions: { display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' },

  btnOpen: { background: '#dcfce7', color: '#166534', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
  btnClosed: { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
  btnReset: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },

  listCard: { background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
  listHeader: { padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badgeCount: { background: '#f1f5f9', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', fontWeight: '600' },

  tableWrapper: { padding: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px 20px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '15px 20px', fontSize: '0.95rem', verticalAlign: 'middle' },

  donaturName: { fontWeight: '700', color: '#1e293b' },
  donaturDate: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' },

  badgeVerified: { background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' },
  badgePending: { background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' },

  actionGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  btnActionCheck: { background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px', borderRadius: '8px', cursor: 'pointer' },
  btnActionDelete: { background: '#fff1f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '8px', cursor: 'pointer' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#94a3b8' }
};