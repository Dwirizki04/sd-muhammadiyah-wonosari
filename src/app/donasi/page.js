"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  doc, onSnapshot, addDoc, collection, Timestamp 
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export default function DonasiPage() {
  const [stats, setStats] = useState({ collected: 0, target: 200000000, isOpen: false });
  const [formData, setFormData] = useState({ name: '', amount: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Memantau statistik donasi secara real-time
    const unsubStats = onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
      if (doc.exists()) setStats(doc.data());
    });
    return () => unsubStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi tambahan untuk memastikan nama tidak kosong
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
        date: Timestamp.now()
      });

      Swal.fire({
        title: 'Data Berhasil Dikirim!',
        text: 'Terima kasih, Mas/Mbak. Nama Anda hanya digunakan untuk pendataan internal dan tidak akan dipublikasikan di website.',
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
      {/* HEADER SECTION - Menampilkan Progress Bar Wakaf */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={headerCard}>
        <h1 style={{ color: '#1a5d1a', margin: 0 }}>Wakaf Pembangunan Kelas</h1>
        <div style={statsWrapper}>
          <div style={amountBig}>Rp {stats.collected.toLocaleString('id-ID')}</div>
          <div style={amountTarget}>Target: Rp {stats.target.toLocaleString('id-ID')}</div>
        </div>
        <div style={progressBarContainer}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} style={progressBarFill}>
            <span style={progressLabel}>{percentage.toFixed(1)}%</span>
          </motion.div>
        </div>
      </motion.div>

      <div style={contentGrid}>
        {/* KOLOM KIRI: FORM KONFIRMASI */}
        <motion.div style={glassCard}>
          <h3 style={{ marginBottom: '15px', color: '#1a5d1a' }}>Form Infaq</h3>
          
          <div style={bankInfoBox}>
            <small>Tujuan Transfer:</small>
            <div style={{ marginTop: '5px' }}>
              <strong>BSI (Bank Syariah Indonesia)</strong><br/>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>7123456789</span><br/>
              <small>a.n SD Muhammadiyah Wonosari</small>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            {/* Input Nama sekarang diwajibkan (Required) */}
            <input 
              type="text" 
              placeholder="Nama Lengkap Donatur" 
              value={formData.name} 
              onChange={e=>setFormData({...formData, name:e.target.value})} 
              required 
              style={inputStyle}
            />
            <input 
              type="number" 
              placeholder="Nominal Infaq (Rp)" 
              value={formData.amount} 
              onChange={e=>setFormData({...formData, amount:e.target.value})} 
              required 
              style={inputStyle}
            />
            <textarea 
              placeholder="Tuliskan Doa atau Pesan Anda..." 
              value={formData.message} 
              onChange={e=>setFormData({...formData, message:e.target.value})} 
              style={{...inputStyle, minHeight:'80px'}}
            />
            <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
              {loading ? 'Sedang Memproses...' : 'Kirim Konfirmasi Sekarang'}
            </button>
          </form>
        </motion.div>

        {/* KOLOM KANAN: INFORMASI & PRIVASI */}
        <motion.div style={glassCard}>
          <h3 style={{ marginBottom: '20px', color: '#1a5d1a' }}>Informasi Program</h3>
          
          <div style={infoBox}>
            <div style={infoTitle}><i className="fas fa-user-shield"></i> Kebijakan Privasi</div>
            <p style={infoText}>Sesuai arahan sekolah, nama donatur bersifat rahasia. Identitas Anda hanya digunakan admin untuk pencocokan saldo di bank dan tidak akan ditampilkan di daftar publik website.</p>
          </div>

          <div style={infoBox}>
            <div style={infoTitle}><i className="fas fa-info-circle"></i> Cara Berdonasi</div>
            <ol style={stepList}>
              <li>Transfer ke rekening BSI di atas.</li>
              <li>Isi nama asli sesuai buku tabungan/identitas.</li>
              <li>Kirim konfirmasi dan lampirkan bukti transfer via WhatsApp agar admin dapat memverifikasi dana Anda.</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- STYLES (MODERN & CLEAN) ---
const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '120px 20px 60px' };
const headerCard = { background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center', marginBottom: '40px' };
const statsWrapper = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '10px' };
const amountBig = { fontSize: '2rem', fontWeight: '900', color: '#1a5d1a' };
const amountTarget = { fontSize: '1rem', color: '#64748b' };
const progressBarContainer = { width: '100%', height: '18px', background: '#f1f5f9', borderRadius: '50px', overflow: 'hidden' };
const progressBarFill = { height: '100%', background: 'linear-gradient(90deg, #1a5d1a, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px' };
const progressLabel = { fontSize: '0.7rem', color: 'white', fontWeight: 'bold' };
const contentGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' };
const glassCard = { background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const bankInfoBox = { background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #dcfce7', marginBottom: '20px', color: '#166534' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem' };
const btnSubmit = { padding: '15px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed' };
const infoBox = { marginBottom: '25px' };
const infoTitle = { fontWeight: 'bold', color: '#1a5d1a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' };
const infoText = { fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 };
const stepList = { fontSize: '0.85rem', color: '#64748b', paddingLeft: '20px', lineHeight: '1.8' };