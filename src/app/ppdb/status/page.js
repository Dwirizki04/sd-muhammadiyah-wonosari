"use client";

import { useState } from 'react';
import { checkPPDBStatus } from '@/lib/firebaseService';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CheckStatusPage() {
  const [nik, setNik] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (nik.length < 10) {
      return Swal.fire('NIK Tidak Valid', 'Mohon masukkan NIK yang benar.', 'warning');
    }

    setLoading(true);
    setHasSearched(false);
    try {
      const data = await checkPPDBStatus(nik);
      setResult(data);
      setHasSearched(true);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data. Periksa koneksi internet Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.container}>
        
        <div style={styles.headerBox}>
          <h1 style={styles.title}>CEK STATUS PENDAFTARAN</h1>
          <p style={styles.subtitle}>Masukkan NIK Ananda yang didaftarkan untuk melihat hasil verifikasi.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <form onSubmit={handleCheck} style={styles.searchForm}>
            <input 
              type="text" 
              placeholder="Masukkan 16 Digit NIK..." 
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              style={styles.input}
              maxLength={16}
            />
            <button type="submit" disabled={loading} style={styles.btnSearch}>
              {loading ? '⏳...' : 'Cek Sekarang'}
            </button>
          </form>

          <AnimatePresence>
            {hasSearched && result && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={styles.resultArea}>
                <div style={styles.divider} />
                <div style={styles.infoRow}>
                  <span style={styles.label}>Nama Calon Siswa:</span>
                  <span style={styles.value}>{result.namaLengkap}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Status Pendaftaran:</span>
                  <span style={getStatusStyle(result.status)}>
                    {result.status === 'terverifikasi' ? '✅ DITERIMA' : 
                     result.status === 'ditolak' ? '❌ DITOLAK / CADANGAN' : 
                     '⏳ SEDANG DIPROSES'}
                  </span>
                </div>
                
                <div style={styles.noteBox}>
                  {result.status === 'terverifikasi' ? (
                    <p><b>Selamat!</b> Ananda telah dinyatakan <b>Diterima</b>. Silakan segera melakukan daftar ulang di kantor sekolah atau hubungi Panitia PPDB.</p>
                  ) : result.status === 'ditolak' ? (
                    <p>Mohon maaf, pendaftaran Ananda belum bisa kami terima saat ini. Terima kasih telah mendaftar.</p>
                  ) : (
                    <p>Data Ananda sudah masuk di sistem kami. Saat ini tim panitia sedang melakukan verifikasi berkas. Mohon cek halaman ini secara berkala.</p>
                  )}
                </div>
              </motion.div>
            )}

            {hasSearched && !result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorBox}>
                <p>⚠️ Data dengan NIK <b>{nik}</b> tidak ditemukan. Pastikan NIK yang dimasukkan sesuai dengan yang ada di Kartu Keluarga.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/ppdb" style={styles.linkBack}>← Kembali ke Formulir Pendaftaran</Link>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  pageBg: { backgroundColor: '#f4f7f4', minHeight: '100vh', padding: '60px 20px', fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '600px', margin: '0 auto' },
  headerBox: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#1a5d1a', fontSize: '1.7rem', fontWeight: '900', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '0.95rem', marginTop: '10px' },
  card: { background: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  searchForm: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: '0.2s' },
  btnSearch: { background: '#1a5d1a', color: 'white', border: 'none', padding: '0 25px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' },
  resultArea: { marginTop: '10px' },
  divider: { height: '1px', background: '#f1f5f9', margin: '25px 0' },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1rem' },
  label: { color: '#64748b', fontWeight: '500' },
  value: { color: '#1e293b', fontWeight: '700' },
  noteBox: { marginTop: '30px', padding: '20px', borderRadius: '15px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'center' },
  errorBox: { marginTop: '30px', textAlign: 'center', color: '#e11d48', fontSize: '0.95rem' },
  linkBack: { color: '#1a5d1a', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700' }
};

const getStatusStyle = (status) => ({
  padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800',
  backgroundColor: status === 'terverifikasi' ? '#dcfce7' : status === 'ditolak' ? '#fee2e2' : '#fef9c3',
  color: status === 'terverifikasi' ? '#166534' : status === 'ditolak' ? '#991b1b' : '#854d0e',
});