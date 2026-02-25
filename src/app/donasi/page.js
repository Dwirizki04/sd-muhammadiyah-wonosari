"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  doc, onSnapshot, addDoc, collection, Timestamp 
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonasiPage() {
  const [stats, setStats] = useState({ collected: 0, target: 200000000, isOpen: false });
  const [formData, setFormData] = useState({ name: '', amount: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Memantau statistik donasi secara real-time
    const unsubStats = onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
      if (doc.exists()) {
        setStats(doc.data());
      } else {
        console.error("Dokumen donation_stats tidak ditemukan di Firestore!");
      }
    });
    return () => unsubStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      Swal.fire("Peringatan", "Nama donatur wajib diisi untuk keperluan verifikasi.", "warning");
      return;
    }

    setLoading(true);
    const amountNum = parseInt(formData.amount);

    try {
      // Menyimpan data donasi dengan status pending
      await addDoc(collection(db, "donations"), {
        name: formData.name,
        amount: amountNum,
        message: formData.message,
        status: "pending",
        isVerified: false, // Tambahan untuk sinkronisasi dashboard admin
        date: Timestamp.now()
      });

      Swal.fire({
        title: 'Data Berhasil Dikirim!',
        text: 'Terima kasih. Nama Anda hanya digunakan untuk verifikasi internal admin dan tidak akan dipublikasikan.',
        icon: 'success',
        confirmButtonText: 'Konfirmasi via WhatsApp',
        confirmButtonColor: '#25D366',
        showCancelButton: true,
        cancelButtonText: 'Tutup',
      }).then((result) => {
        if (result.isConfirmed) {
          const phone = "6285226443646"; 
          const message = `Assalamu'alaikum.\n\nSaya *${formData.name}* konfirmasi donasi pembangunan kelas sebesar *Rp ${amountNum.toLocaleString('id-ID')}*.\n\nBerikut bukti transfernya.`;
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      });

      setFormData({ name: '', amount: '', message: '' });
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data konfirmasi", "error");
    }
    setLoading(false);
  };

  const percentage = Math.min((stats.collected / stats.target) * 100, 100);

  return (
    <div style={containerStyle}>
      {/* HEADER SECTION - Progress Bar Wakaf */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={headerCard}>
        <div style={badgePrivate}>🔒 Sistem Donasi Privat Terenkripsi</div>
        <h1 style={{ color: '#1a5d1a', margin: '15px 0 0 0', fontWeight: '900' }}>Wakaf Pembangunan Kelas</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Mari bersama mewujudkan sarana belajar yang nyaman untuk Ananda.</p>
        
        <div style={statsWrapper}>
          <div style={amountBig}>Rp {stats.collected.toLocaleString('id-ID')}</div>
          <div style={amountTarget}>Target: Rp {stats.target.toLocaleString('id-ID')}</div>
        </div>
        <div style={progressBarContainer}>
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percentage}%` }} 
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={progressBarFill}
          >
            <span style={progressLabel}>{percentage.toFixed(1)}%</span>
          </motion.div>
        </div>
      </motion.div>

      <div style={contentGrid}>
        {/* KOLOM KIRI: FORM KONFIRMASI */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={glassCard}>
          <h3 style={{ marginBottom: '15px', color: '#1a5d1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📝</span> Form Infaq & Konfirmasi
          </h3>
          
          <div style={bankInfoBox}>
            <small style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>Rekening Tujuan:</small>
            <div style={{ marginTop: '5px' }}>
              <div style={{ fontSize: '0.9rem', color: '#166534' }}>BSI (Bank Syariah Indonesia)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '1px' }}>7123456789</div>
              <div style={{ fontSize: '0.85rem' }}>a.n **SD Muhammadiyah Wonosari**</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputWrapper}>
              <label style={labelStyle}>Nama Lengkap Sesuai Rekening</label>
              <input 
                type="text" 
                placeholder="Masukkan nama asli Anda" 
                value={formData.name} 
                onChange={e=>setFormData({...formData, name:e.target.value})} 
                required 
                style={inputStyle}
              />
            </div>
            
            <div style={inputWrapper}>
              <label style={labelStyle}>Nominal Donasi (Rp)</label>
              <input 
                type="number" 
                placeholder="Contoh: 500000" 
                value={formData.amount} 
                onChange={e=>setFormData({...formData, amount:e.target.value})} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={inputWrapper}>
              <label style={labelStyle}>Doa atau Harapan (Opsional)</label>
              <textarea 
                placeholder="Tuliskan doa untuk sekolah atau Ananda..." 
                value={formData.message} 
                onChange={e=>setFormData({...formData, message:e.target.value})} 
                style={{...inputStyle, minHeight:'100px', resize: 'none'}}
              />
            </div>

            <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
              {loading ? '⏳ Memproses...' : '🚀 Kirim Konfirmasi Infaq'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
              Klik tombol di atas untuk sinkronisasi data ke sistem admin.
            </p>
          </form>
        </motion.div>

        {/* KOLOM KANAN: INFORMASI & PRIVASI */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={glassCard}>
          <h3 style={{ marginBottom: '20px', color: '#1a5d1a' }}>Keamanan & Prosedur</h3>
          
          <div style={infoBoxHighlight}>
            <div style={infoTitle}>🛡️ Jaminan Privasi</div>
            <p style={infoText}>Nama Anda **hanya terlihat oleh tim keuangan sekolah** untuk keperluan rekonsiliasi bank. Sistem kami tidak akan menampilkan identitas donatur di halaman publik mana pun.</p>
          </div>

          <div style={infoBox}>
            <div style={infoTitle}>✅ Cara Verifikasi Cepat</div>
            <ol style={stepList}>
              <li>Lakukan transfer ke rekening resmi sekolah di samping.</li>
              <li>Isi form ini dengan data yang sebenar-benarnya.</li>
              <li>Sistem akan mengarahkan Anda ke WhatsApp Admin.</li>
              <li>Lampirkan foto bukti transfer agar admin bisa langsung melakukan **update saldo terkumpul**.</li>
            </ol>
          </div>

          <div style={infoBox}>
             <div style={infoTitle}>📞 Layanan Informasi</div>
             <p style={infoText}>Jika ada pertanyaan seputar pembangunan kelas, silakan hubungi bagian sarana prasarana sekolah di jam kerja.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- STYLES (ENHANCED) ---
const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '120px 20px 60px' };
const headerCard = { background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '40px', border: '1px solid #f1f5f9' };
const badgePrivate = { display: 'inline-block', padding: '6px 15px', background: '#f0fdf4', color: '#1a5d1a', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' };
const statsWrapper = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', marginBottom: '12px' };
const amountBig = { fontSize: '2.5rem', fontWeight: '900', color: '#1a5d1a', letterSpacing: '-1px' };
const amountTarget = { fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' };
const progressBarContainer = { width: '100%', height: '24px', background: '#f1f5f9', borderRadius: '50px', overflow: 'hidden', padding: '4px' };
const progressBarFill = { height: '100%', background: 'linear-gradient(90deg, #1a5d1a, #34a853)', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', boxShadow: '0 2px 10px rgba(26, 93, 26, 0.2)' };
const progressLabel = { fontSize: '0.75rem', color: 'white', fontWeight: '900' };
const contentGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' };
const glassCard = { background: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f8fafc' };
const bankInfoBox = { background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '20px', borderRadius: '18px', marginBottom: '25px', color: '#166534' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginLeft: '4px' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem', transition: '0.2s', backgroundColor: '#fcfcfc' };
const btnSubmit = { padding: '18px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 20px rgba(26, 93, 26, 0.15)', transition: '0.3s' };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' };
const infoBoxHighlight = { marginBottom: '25px', padding: '20px', background: '#f8fafc', borderRadius: '15px', borderLeft: '4px solid #1a5d1a' };
const infoBox = { marginBottom: '25px', padding: '0 5px' };
const infoTitle = { fontWeight: '800', color: '#1a5d1a', marginBottom: '8px', fontSize: '1rem' };
const infoText = { fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 };
const stepList = { fontSize: '0.85rem', color: '#64748b', paddingLeft: '18px', lineHeight: '2' };