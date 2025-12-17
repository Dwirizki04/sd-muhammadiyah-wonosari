// src/app/cek-status/page.js
"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';

export default function CekStatus() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Query ke Firebase: Cari pendaftar yang no_telepon == input
      const q = query(collection(db, "pendaftar"), where("no_telepon", "==", phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Ambil data pertama yang ditemukan
        const data = querySnapshot.docs[0].data();
        
        // Format Tanggal Daftar
        let dateStr = '-';
        if(data.timestamp) {
            dateStr = new Date(data.timestamp.seconds * 1000).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
        
        setResult({ ...data, dateStr });
      } else {
        setError('Nomor WhatsApp tidak ditemukan di database kami.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk Warna Status
  const getStatusBadge = (status) => {
      if(status === 'Diterima') return <span className="badge-ok"><i className="fas fa-check-circle"></i> SELAMAT! DITERIMA</span>;
      if(status === 'Ditolak') return <span className="badge-no"><i className="fas fa-times-circle"></i> MOHON MAAF, TIDAK LOLOS</span>;
      return <span className="badge-wait"><i className="fas fa-clock"></i> MENUNGGU VERIFIKASI</span>;
  };

  return (
    <div className="main-wrapper" style={{minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '140px', background: '#f1f5f9'}}>
        
        {/* PANEL PENCARIAN (Hanya muncul jika belum ada hasil) */}
        {!result && (
            <div className="search-box-panel" style={{background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '90%'}}>
                <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={80} height={80} style={{marginBottom: '20px'}} />
                <h2 style={{color: '#2c3e50', marginBottom: '10px'}}>Cek Status PPDB</h2>
                <p style={{color: '#64748b', marginBottom: '30px'}}>Masukkan Nomor WhatsApp yang terdaftar.</p>

                <form onSubmit={handleSearch}>
                    <div className="input-group" style={{position: 'relative', marginBottom: '20px'}}>
                        <i className="fab fa-whatsapp" style={{position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem'}}></i>
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Contoh: 08123456789" 
                            required 
                            style={{width: '100%', padding: '15px 20px 15px 50px', border: '2px solid #e2e8f0', borderRadius: '50px', fontSize: '1.1rem', outline: 'none'}}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{width: '100%', background: '#1a5d1a', color: 'white', padding: '15px', borderRadius: '50px', border: 'none', fontWeight: 'bold', cursor: 'pointer'}}>
                        {loading ? 'Memuat...' : 'Cek Status Saya'}
                    </button>
                </form>
                
                {error && <p style={{color: 'red', marginTop: '15px', background: '#fee2e2', padding: '10px', borderRadius: '8px'}}>{error}</p>}
            </div>
        )}

        {/* PANEL HASIL (Muncul jika ada hasil) */}
        {result && (
            <div className="result-card" style={{background: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0'}}>
                <div className="card-header" style={{background: 'linear-gradient(135deg, #1a5d1a, #14532d)', padding: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <div style={{background: 'white', padding: '5px', borderRadius: '50%'}}>
                        <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={60} height={60} />
                    </div>
                    <div>
                        <h2 style={{margin: 0, fontSize: '1.4rem'}}>Bukti Pendaftaran</h2>
                        <p style={{margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem'}}>PPDB SD Muhammadiyah Wonosari</p>
                    </div>
                </div>

                <div className="card-body" style={{padding: '30px'}}>
                    <div className="status-badge" style={{textAlign: 'center', marginBottom: '25px'}}>
                        {getStatusBadge(result.status)}
                    </div>

                    <table style={{width: '100%', fontSize: '1rem'}}>
                        <tbody>
                            <tr><td style={{color: '#64748b', fontWeight: '600', padding: '8px 0'}}>Nama Lengkap</td><td>: <strong>{result.nama_lengkap}</strong></td></tr>
                            <tr><td style={{color: '#64748b', fontWeight: '600', padding: '8px 0'}}>Asal Sekolah</td><td>: {result.asal_sekolah}</td></tr>
                            <tr><td style={{color: '#64748b', fontWeight: '600', padding: '8px 0'}}>Nama Ayah</td><td>: {result.nama_ayah}</td></tr>
                            <tr><td style={{color: '#64748b', fontWeight: '600', padding: '8px 0'}}>Nomor WA</td><td>: {result.no_telepon}</td></tr>
                            <tr><td style={{color: '#64748b', fontWeight: '600', padding: '8px 0'}}>Tanggal Daftar</td><td>: {result.dateStr}</td></tr>
                        </tbody>
                    </table>

                    <div style={{marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b'}}>
                        *Harap simpan bukti ini (Screenshot/Cetak) untuk daftar ulang.
                    </div>
                </div>

                <div className="action-buttons" style={{background: '#f8fafc', padding: '20px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <button onClick={() => window.print()} style={{background: '#1e293b', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer'}}>
                        <i className="fas fa-print"></i> Cetak PDF
                    </button>
                    <button onClick={() => setResult(null)} style={{background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer'}}>
                        Cari Lagi
                    </button>
                </div>
            </div>
        )}
        
        {/* Style Tambahan untuk Badge Status */}
        <style jsx>{`
            .badge-wait { background: #fffbeb; color: #b45309; border: 1px solid #fcd34d; padding: 8px 15px; border-radius: 50px; font-weight: bold; font-size: 0.9rem; }
            .badge-ok { background: #f0fdf4; color: #15803d; border: 1px solid #4ade80; padding: 8px 15px; border-radius: 50px; font-weight: bold; font-size: 0.9rem; }
            .badge-no { background: #fef2f2; color: #b91c1c; border: 1px solid #f87171; padding: 8px 15px; border-radius: 50px; font-weight: bold; font-size: 0.9rem; }
        `}</style>
    </div>
  );
}