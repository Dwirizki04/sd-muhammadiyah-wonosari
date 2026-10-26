"use client";

import { useState } from 'react';
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
      // Query sekarang lewat API route server-side, bukan langsung ke Firestore.
      // NIK tidak lagi bisa ditebak-tebak langsung lewat Firebase client SDK,
      // dan ada rate-limiting per-IP di server untuk mencegah brute-force/scraping.
      const res = await fetch('/api/cek-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setError('Server sedang bermasalah. Silakan coba lagi sebentar lagi.');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
        
        <AnimatePresence>
          {!result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={s.searchBox}
            >
              <div style={s.logoWrapper}>
                 <Image 
                    src="/images/logo sdm woonsa.jpg" 
                    alt="Logo SDM Wonosari" 
                    width={80} 
                    height={80} 
                    priority
                 />
              </div>
              <h2 style={s.title}>Cek Status SPMB</h2>
              <p style={s.subtitle}>Masukkan 16 digit NIK Calon Siswa</p>

              <form onSubmit={handleSearch}>
                  <div style={s.inputWrapper}>
                      <input 
                          type="text" 
                          maxLength="16"
                          value={nik}
                          onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
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

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={s.resultCard}
            className="print-area"
          >
            <div style={s.cardHeader} className="cs-head">
                <div style={s.headerLogoBox}>
                    <Image 
                        src="/images/logo sdm woonsa.jpg" 
                        alt="Logo" 
                        width={50} 
                        height={50} 
                    />
                </div>
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
                    <InfoRow label="Tempat, Tgl Lahir" val={`${result.tempatLahir}, ${result.tanggalLahir}`} />
                    <InfoRow label="Alamat" val={result.alamatLengkap} />
                    <InfoRow label="Asal TK" val={result.asalTk || '-'} />
                    <InfoRow label="Alamat TK" val={result.alamatTk || '-'} />
                    <InfoRow label="Nama Ayah" val={result.namaAyah} />
                    <InfoRow label="Nama Ibu" val={result.namaIbu} />
                    <InfoRow label="Tanggal Daftar" val={result.dateStr} />
                </div>

                <div style={s.noteBox}>
                    *Harap simpan bukti ini (Screenshot/Cetak) sebagai bukti pendaftaran resmi.
                </div>
            </div>

            <div style={s.cardFooter} className="no-print cs-footer">
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
      `}</style>

      {/* style jsx GLOBAL supaya bisa "menjangkau" navbar/footer situs yang
          dirender di luar komponen ini -- style jsx biasa (scoped) tidak bisa
          menyentuh elemen di luar komponen saat ini. */}
      <style jsx global>{`
        /* HP: label di atas nilai (bukan 2 kolom sempit), tombol memenuhi lebar */
        @media (max-width: 520px) {
          .cs-info-row { flex-direction: column !important; gap: 2px !important; }
          .cs-info-label { flex: none !important; font-size: 0.72rem !important; text-transform: uppercase; letter-spacing: 0.5px; }
          .cs-colon { display: none; }
          .cs-footer { flex-direction: column !important; }
          .cs-footer button { width: 100% !important; min-height: 46px; }
          .cs-head { flex-direction: column !important; text-align: center; }
        }
        @media print {
          /* Sembunyikan SEMUA elemen halaman secara default saat print... */
          body * {
            visibility: hidden;
          }
          /* ...lalu tampilkan HANYA kartu bukti pendaftaran ini */
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

const InfoRow = ({label, val}) => (
  <div style={s.infoRow} className="cs-info-row">
    <span style={s.infoLabel} className="cs-info-label">{label}</span>
    <span style={s.infoVal}><span className="cs-colon">: </span>{val}</span>
  </div>
);

const s = {
  pageBg: { minHeight: '100vh', background: '#f8fafc', padding: 'clamp(96px, 16vw, 120px) clamp(12px, 4vw, 20px) 40px' },
  container: { maxWidth: '600px', margin: '0 auto' },
  searchBox: { background: 'white', padding: 'clamp(28px, 6vw, 50px) clamp(18px, 5vw, 40px)', borderRadius: 'clamp(20px, 4vw, 30px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' },
  logoWrapper: { marginBottom: '25px', display: 'flex', justifyContent: 'center' },
  title: { fontSize: 'clamp(1.35rem, 6vw, 1.8rem)', fontWeight: '900', color: '#1e293b', marginBottom: '10px' },
  subtitle: { color: '#64748b', marginBottom: '35px' },
  inputWrapper: { marginBottom: '20px' },
  inputField: { width: '100%', padding: '18px 25px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '1.1rem', textAlign: 'center', fontWeight: '700', outline: 'none', boxSizing: 'border-box', minWidth: 0 },
  btnPrimary: { width: '100%', boxSizing: 'border-box', minHeight: '54px', background: '#1a5d1a', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' },
  errorMsg: { color: '#ef4444', marginTop: '20px', background: '#fee2e2', padding: '12px', borderRadius: '10px', fontSize: '0.9rem' },
  linkBack: { color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },

  resultCard: { background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' },
  cardHeader: { background: '#1a5d1a', padding: 'clamp(18px, 4vw, 30px)', color: 'white', display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)' },
  headerLogoBox: { background: 'white', padding: '5px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { margin: 0, fontSize: 'clamp(1.15rem, 5vw, 1.5rem)', fontWeight: '800' },
  headerSub: { margin: 0, opacity: 0.8, fontSize: '0.85rem' },
  cardBody: { padding: 'clamp(18px, 5vw, 40px)' },
  badgeWrapper: { textAlign: 'center', marginBottom: '35px' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  infoRow: { display: 'flex', fontSize: 'clamp(0.95rem, 3.6vw, 1.05rem)' },
  infoLabel: { flex: '0 0 150px', color: '#64748b', fontWeight: '600' },
  infoVal: { color: '#1e293b', fontWeight: '800', wordBreak: 'break-word', minWidth: 0 },
  noteBox: { marginTop: '35px', padding: '20px', borderRadius: '15px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6', borderLeft: '4px solid #e2e8f0' },
  cardFooter: { background: '#f8fafc', padding: 'clamp(16px, 4vw, 25px)', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrint: { background: '#1e293b', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
  btnReset: { background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '12px 25px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }
};