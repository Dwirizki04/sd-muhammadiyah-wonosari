"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CekStatus() {
  const [nik, setNik] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (nik.length !== 16) {
      return setError('NIK harus berjumlah 16 digit.');
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // SINKRONISASI: Mencari di koleksi ppdb_registrations berdasarkan NIK
      const q = query(collection(db, "ppdb_registrations"), where("nik", "==", nik));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        
        // Format Tanggal
        let dateStr = '-';
        if(data.createdAt) {
            dateStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        
        setResult({ ...data, dateStr });
      } else {
        setError('Data pendaftaran tidak ditemukan. Pastikan NIK yang dimasukkan benar.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Helper Warna Status (Sinkron dengan Admin)
  const getStatusBadge = (status) => {
      switch(status) {
        case 'terverifikasi':
          return <span className="badge-ok">✅ SELAMAT! ANANDA DITERIMA</span>;
        case 'ditolak':
          return <span className="badge-no">❌ MOHON MAAF, BELUM LOLOS</span>;
        default:
          return <span className="badge-wait">⏳ SEDANG PROSES VERIFIKASI</span>;
      }
  };

  return (
    <div style={s.pageBg}>
      <div style={s.container}>
        
        {/* PANEL PENCARIAN */}
        <AnimatePresence>
          {!result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={s.searchBox}
            >
              <div style={s.logoWrapper}>
                 <div style={s.logoCircle}>M</div>
              </div>
              <h2 style={s.title}>Cek Status PPDB</h2>
              <p style={s.subtitle}>Masukkan 16 digit NIK Calon Siswa</p>

              <form onSubmit={handleSearch}>
                  <div style={s.inputWrapper}>
                      <input 
                          type="text" 
                          maxLength="16"
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          placeholder="Contoh: 3403xxxxxxxxxxxx" 
                          required 
                          style={s.inputField}
                      />
                  </div>
                  <button type="submit" disabled={loading} style={s.btnPrimary}>
                      {loading ? 'Mencari Data...' : 'Cek Status Pendaftaran'}
                  </button>
              </form>
              
              {error && <motion.p initial={{scale:0.9}} animate={{scale:1}} style={s.errorMsg}>{error}</motion.p>}
              
              <div style={{marginTop: '25px'}}>
                <Link href="/" style={s.linkBack}>🏠 Kembali ke Beranda</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PANEL HASIL */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={s.resultCard}
          >
            <div style={s.cardHeader}>
                <div style={s.headerLogo}>M</div>
                <div>
                    <h2 style={s.headerTitle}>Bukti Pendaftaran</h2>
                    <p style={s.headerSub}>SD Muhammadiyah Wonosari</p>
                </div>
            </div>

            <div style={s.cardBody}>
                <div style={s.badgeWrapper}>
                    {getStatusBadge(result.status)}
                </div>

                <div style={s.infoGrid}>
                    <InfoRow label="Nama Lengkap" val={result.namaLengkap} />
                    <InfoRow label="NIK" val={result.nik} />
                    <InfoRow label="Jenis Kelamin" val={result.jenisKelamin} />
                    <InfoRow label="Desa/Kelurahan" val={result.desaKelurahan} />
                    <InfoRow label="Tanggal Daftar" val={result.dateStr} />
                </div>

                <div style={s.noteBox}>
                    *Harap simpan bukti ini (Screenshot/Cetak) untuk ditunjukkan saat daftar ulang atau verifikasi berkas di sekolah.
                </div>
            </div>

            <div style={s.cardFooter}>
                <button onClick={() => window.print()} style={s.btnPrint}>🖨️ Cetak PDF</button>
                <button onClick={() => setResult(null)} style={s.btnReset}>Cari NIK Lain</button>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .badge-wait { background: #fffbeb; color: #b45309; border: 1px solid #fcd34d; padding: 12px 25px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; display: inline-block; }
        .badge-ok { background: #f0fdf4; color: #15803d; border: 1px solid #4ade80; padding: 12px 25px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; display: inline-block; }
        .badge-no { background: #fef2f2; color: #b91c1c; border: 1px solid #f87171; padding: 12px 25px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; display: inline-block; }
        @media print {
          .btn-reset, .link-back, .btn-primary { display: none !important; }
          body { background: white !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const InfoRow = ({label, val}) => (
  <div style={s.infoRow}>
    <span style={s.infoLabel}>{label}</span>
    <span style={s.infoVal}>: {val}</span>
  </div>
);

const s = {
  pageBg: { minHeight: '100vh', background: '#f8fafc', padding: '120px 20px 50px' },
  container: { maxWidth: '600px', margin: '0 auto' },
  searchBox: { background: 'white', padding: '50px 40px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' },
  logoWrapper: { marginBottom: '25px', display: 'flex', justifyContent: 'center' },
  logoCircle: { background: '#1a5d1a', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', marginBottom: '10px' },
  subtitle: { color: '#64748b', marginBottom: '35px' },
  inputWrapper: { marginBottom: '20px' },
  inputField: { width: '100%', padding: '18px 25px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '1.1rem', textAlign: 'center', fontWeight: '700', outline: 'none' },
  btnPrimary: { width: '100%', background: '#1a5d1a', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' },
  errorMsg: { color: '#ef4444', marginTop: '20px', background: '#fee2e2', padding: '12px', borderRadius: '10px', fontSize: '0.9rem' },
  linkBack: { color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },

  resultCard: { background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' },
  cardHeader: { background: '#1a5d1a', padding: '30px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' },
  headerLogo: { background: 'white', width: '50px', height: '50px', borderRadius: '12px', color: '#1a5d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' },
  headerTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '800' },
  headerSub: { margin: 0, opacity: 0.8, fontSize: '0.85rem' },
  cardBody: { padding: '40px' },
  badgeWrapper: { textAlign: 'center', marginBottom: '35px' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  infoRow: { display: 'flex', fontSize: '1.05rem' },
  infoLabel: { flex: '0 0 150px', color: '#64748b', fontWeight: '600' },
  infoVal: { color: '#1e293b', fontWeight: '800' },
  noteBox: { marginTop: '35px', padding: '20px', borderRadius: '15px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6', borderLeft: '4px solid #e2e8f0' },
  cardFooter: { background: '#f8fafc', padding: '25px', display: 'flex', gap: '12px', justifyContent: 'center' },
  btnPrint: { background: '#1e293b', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
  btnReset: { background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '12px 25px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }
};