// src/app/admin/donasi/page.js
"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function AdminDonasi() {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [stats, setStats] = useState({ collected: 0, target: 0, isOpen: false });

  useEffect(() => {
    // 1. Pantau Status & Statistik
    const unsubStats = onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
      if (doc.exists()) setStats(doc.data());
    });

    // 2. Pantau Riwayat Donasi
    const q = query(collection(db, "donations"), orderBy("date", "desc"));
    const unsubDonations = onSnapshot(q, (snapshot) => {
      setPendingDonations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubStats(); unsubDonations(); };
  }, []);

  const verifikasiDonasi = async (donasi) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Dana',
      text: `Pastikan dana Rp ${donasi.amount.toLocaleString()} dari ${donasi.name} sudah masuk rekening.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Verifikasi',
      confirmButtonColor: '#1a5d1a',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await updateDoc(doc(db, "donations", donasi.id), { status: "verified" });
        await updateDoc(doc(db, "site_settings", "donation_stats"), {
          collected: increment(donasi.amount)
        });
        Swal.fire("Sukses!", "Donasi berhasil diverifikasi.", "success");
      } catch (e) { Swal.fire("Error", "Gagal verifikasi data.", "error"); }
    }
  };

  const toggleStatus = async () => {
    await updateDoc(doc(db, "site_settings", "donation_stats"), { isOpen: !stats.isOpen });
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '120px 20px 40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER DASHBOARD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#2c3e50', fontWeight: '700', marginBottom: '5px' }}>Dashboard Donasi</h2>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Kelola program wakaf pembangunan kelas SDM Wonosari</p>
          </div>
          <Link href="/" style={{ textDecoration: 'none', color: '#1a5d1a', fontWeight: '600' }}>
            <i className="fas fa-arrow-left"></i> Kembali ke Web
          </Link>
        </div>

        {/* RINGKASAN STATISTIK (CARD) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <span style={labelStyle}>Total Terkumpul</span>
            <h3 style={{ color: '#1a5d1a', margin: '10px 0' }}>Rp {stats.collected.toLocaleString('id-ID')}</h3>
            <small style={{ color: '#95a5a6' }}>Target: Rp {stats?.target?.toLocaleString('id-ID')}</small>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Status Program</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ 
                padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                background: stats.isOpen ? '#e8f5e9' : '#ffebee', color: stats.isOpen ? '#2e7d32' : '#c62828'
              }}>
                {stats.isOpen ? '● DIBUKA' : '● DITUTUP'}
              </span>
              <button onClick={toggleStatus} style={btnSwitchStyle(stats.isOpen)}>
                {stats.isOpen ? 'Tutup Donasi' : 'Buka Donasi'}
              </button>
            </div>
          </div>
        </div>

        {/* TABEL DATA */}
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0 }}>Antrean & Riwayat Donasi</h4>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={thStyle}>Donatur</th>
                  <th style={thStyle}>Nominal</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingDonations.map((d, index) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{d.name}</div>
                      <small style={{ color: '#95a5a6' }}>{d.date?.toDate().toLocaleDateString('id-ID')}</small>
                    </td>
                    <td style={tdStyle}>Rp {d.amount.toLocaleString()}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(d.status === 'verified')}>
                        {d.status === 'verified' ? 'Sukses' : 'Menunggu'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {d.status === 'pending' ? (
                        <button onClick={() => verifikasiDonasi(d)} style={btnVerifStyle}>
                          <i className="fas fa-check"></i> Verifikasi
                        </button>
                      ) : (
                        <span style={{ color: '#bdc3c7', fontSize: '0.8rem' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLING ---
const cardStyle = {
  background: 'white', padding: '20px', borderRadius: '15px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee'
};

const labelStyle = { color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' };

const thStyle = { padding: '15px 20px', fontSize: '0.85rem', color: '#7f8c8d' };

const tdStyle = { padding: '15px 20px', verticalAlign: 'middle' };

const badgeStyle = (isVerified) => ({
  padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold',
  background: isVerified ? '#e8f5e9' : '#fff3e0', color: isVerified ? '#2e7d32' : '#ef6c00'
});

const btnVerifStyle = {
  background: '#1a5d1a', color: 'white', border: 'none', padding: '8px 15px', 
  borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', transition: '0.3s'
};

const btnSwitchStyle = (isOpen) => ({
  background: isOpen ? '#c62828' : '#1a5d1a', color: 'white', border: 'none', 
  padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem'
});