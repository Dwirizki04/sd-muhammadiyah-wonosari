"use client";
import React, { useState, useEffect, useMemo, memo } from 'react';
import Swal from 'sweetalert2';
import { subscribeDonasiTakjilStatus, submitDonasiTakjil } from '@/lib/firebaseService';

// --- KOMPONEN PROGRESS BAR (DIKUNCI AGAR TIDAK RE-ANIMASI) ---
const ProgressBar = memo(({ label, collected, target, baseColor, gradientColor }) => {
  const safeTarget = target > 0 ? target : 1; 
  let targetPerc = (collected / safeTarget) * 100;
  if (isNaN(targetPerc)) targetPerc = 0;
  const clampedPerc = Math.min(targetPerc, 100);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(clampedPerc), 100);
    return () => clearTimeout(timer);
  }, [clampedPerc]);

  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px', color: '#334155' }}>
        <span style={{ fontWeight: '600' }}>
          {label} <span style={{ color: '#cbd5e1', margin: '0 6px' }}>|</span> 
          <b style={{ color: '#0f172a' }}>{collected} / {target}</b>
        </span>
        <span style={{ fontWeight: '900', color: baseColor, fontSize: '1rem' }}>{Math.round(width)}%</span>
      </div>
      <div style={{ width: '100%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ width: `${width}%`, height: '100%', background: `linear-gradient(90deg, ${baseColor} 0%, ${gradientColor} 100%)`, borderRadius: '20px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 12px ${baseColor}60`, position: 'relative' }}>
          <div className="progress-shine"></div>
        </div>
      </div>
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

export default function PublicDonasiTakjil() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ collectedNasi: 0, targetNasi: 0, collectedMinuman: 0, targetMinuman: 0, isOpen: true });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentName: '', studentClass: '', qtyNasi: '', qtyMinum: '' });

  useEffect(() => {
    setMounted(true);
    const unsub = subscribeDonasiTakjilStatus(setStats);
    return () => unsub();
  }, []);

  // LOGIKA KUOTA (USEMEMO AGAR STABIL SAAT USER MENGETIK)
  const quota = useMemo(() => ({
    sisaNasi: stats.targetNasi > 0 ? Math.max(0, stats.targetNasi - stats.collectedNasi) : 0,
    sisaMinum: stats.targetMinuman > 0 ? Math.max(0, stats.targetMinuman - stats.collectedMinuman) : 0,
    isNasiFull: stats.targetNasi > 0 && stats.collectedNasi >= stats.targetNasi,
    isMinumFull: stats.targetMinuman > 0 && stats.collectedMinuman >= stats.targetMinuman,
    isClosed: !stats.isOpen
  }), [stats]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nasi = Number(form.qtyNasi) || 0;
    const minum = Number(form.qtyMinum) || 0;

    if (nasi === 0 && minum === 0) return Swal.fire('Isi Porsi', 'Silakan isi jumlah porsi Nasi Box atau Minuman.', 'warning');
    if (nasi > quota.sisaNasi && stats.targetNasi > 0) return Swal.fire('Melebihi Kuota', `Sisa Nasi Box: ${quota.sisaNasi}`, 'warning');
    if (minum > quota.sisaMinum && stats.targetMinuman > 0) return Swal.fire('Melebihi Kuota', `Sisa Minuman: ${quota.sisaMinum}`, 'warning');

    setLoading(true);
    const res = await submitDonasiTakjil(form);
    setLoading(false);

    if (res.success) {
      Swal.fire({ title: 'Alhamdulillah', text: 'Terimakasih Ayah/Bunda atas sedekah takjilnya. Semoga Allah Swt selalu melimpahkan rejeki dan menjadikannya ladang pahala', icon: 'success', confirmButtonText: 'Aamiin', confirmButtonColor: '#1a5d1a' });
      setForm({ studentName: '', studentClass: '', qtyNasi: '', qtyMinum: '' });
    }
  };

  if (!mounted) return null;

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <div style={headerSection}>
          <h1 style={titleStyle}>Sedekah Takjil Ramadhan</h1>
          <p style={subTitleStyle}>SD Muhammadiyah Wonosari</p>
        </div>

        <div style={progressCard}>
          <ProgressBar label="🍱 Nasi Box" collected={stats.collectedNasi} target={stats.targetNasi} baseColor="#166534" gradientColor="#22c55e" />
          <ProgressBar label="🥤 Minuman" collected={stats.collectedMinuman} target={stats.targetMinuman} baseColor="#d97706" gradientColor="#fbbf24" />
        </div>

        <div className="main-layout">
          <div className="form-column">
            <div style={formCard}>
              {quota.isClosed ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom:'10px' }}>🌙</div>
                  <h3 style={{ color: '#1a5d1a' }}>Program Ditutup</h3>
                  <p style={{ color: '#64748b' }}>Jazakumullah Khairan atas niat baik Ayah/Bunda.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={formStyle}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Nama Murid *</label>
                    <input type="text" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} placeholder="Nama lengkap siswa..." style={inputStyle} required />
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Kelas *</label>
                    <select value={form.studentClass} onChange={e => setForm({...form, studentClass: e.target.value})} style={inputStyle} required>
                      <option value="">-- Pilih Kelas --</option>
                      {['1A','1B','2A','2B','3A','3B','4A','4B','4C','5A','5B','6A','6B','6C'].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <p style={labelStyle}>Jumlah Porsi yang Disedekahkan:</p>
                    <div className="grid-mobile">
                      <div style={boxInputStyle(quota.isNasiFull)}>
                        <label style={labelTakjil}>🍱 Nasi Box (Ayam)</label>
                        <input type="number" value={form.qtyNasi} onChange={e => setForm({...form, qtyNasi: e.target.value})} disabled={quota.isNasiFull} placeholder={quota.isNasiFull ? "Penuh" : `Sisa: ${quota.sisaNasi}`} style={subInputStyle(quota.isNasiFull)} />
                      </div>
                      <div style={boxInputStyle(quota.isMinumFull)}>
                        <label style={labelTakjil}>🥤 Minuman</label>
                        <input type="number" value={form.qtyMinum} onChange={e => setForm({...form, qtyMinum: e.target.value})} disabled={quota.isMinumFull} placeholder={quota.isMinumFull ? "Penuh" : `Sisa: ${quota.sisaMinum}`} style={subInputStyle(quota.isMinumFull)} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={btnSubmit(loading)}>{loading ? 'Memproses...' : 'Kirim Sedekah Takjil'}</button>
                </form>
              )}
            </div>
          </div>

          {/* --- CATATAN YANG TADI HILANG --- */}
          <div className="note-column">
            <div style={noteCard}>
              <h4 style={{ color: '#1a5d1a', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Catatan
              </h4>
              <ul style={noteListStyle}>
                <li><b>Makanan:</b> Nasi Box (Lauk Ayam).</li>
                <li><b>Minuman:</b> Tanpa pemanis buatan & pengawet.</li>
                <li><b>Waktu Pengantaran:</b> Tanggal 11 Maret 2026, Maksimal pukul 16.00 WIB.</li>
                <li><b>Tempat Pengumpulan Takjil:</b> Di ruang kelas 3A.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .progress-shine { position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 2s infinite linear; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .main-layout { display: flex; gap: 20px; align-items: flex-start; }
        .form-column { flex: 1.6; }
        .note-column { flex: 1; position: sticky; top: 110px; }
        .grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        @media (max-width: 768px) { .main-layout { flex-direction: column; } .note-column { order: -1; position: static; width: 100%; } .grid-mobile { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

// STYLING (LENGKAP)
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f4f7f5', padding: '100px 15px 40px', fontFamily: 'Poppins, sans-serif' };
const containerStyle = { maxWidth: '1000px', margin: '0 auto' };
const headerSection = { textAlign: 'center', marginBottom: '30px' };
const titleStyle = { color: '#1a5d1a', fontWeight: '900', fontSize: '2.2rem', margin: '0 0 5px 0' };
const subTitleStyle = { color: '#64748b', margin: 0, fontSize: '0.95rem' };
const progressCard = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };
const formCard = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', outline: 'none' };
const boxInputStyle = (isFull) => ({ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', backgroundColor: isFull ? '#f1f5f9' : '#ffffff' });
const labelTakjil = { display: 'block', fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem', marginBottom: '10px' };
const subInputStyle = (isFull) => ({ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isFull ? '#e2e8f0' : '#f8fafc', fontSize: '1rem', outline: 'none' });
const btnSubmit = (loading) => ({ backgroundColor: loading ? '#94a3b8' : '#1a5d1a', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' });
const noteCard = { backgroundColor: '#f0fdf4', padding: '25px', borderRadius: '24px', border: '1px dashed #1a5d1a' };
const noteListStyle = { paddingLeft: '18px', margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' };