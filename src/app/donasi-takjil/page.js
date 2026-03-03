"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { subscribeDonasiTakjilStatus, submitDonasiTakjil } from '@/lib/firebaseService';

export default function PublicDonasiTakjil() {
  const [stats, setStats] = useState({ isOpen: false, collected: 0, target: 0 });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentName: '', studentClass: '', takjilType: 'Nasi Box', quantity: '', message: '' });

  useEffect(() => {
    const unsubStats = subscribeDonasiTakjilStatus((data) => setStats(data));
    return () => unsubStats();
  }, []);

  const remainingQuota = stats.target - stats.collected;
  const isFull = stats.collected >= stats.target && stats.target > 0;
  const percentage = stats.target > 0 ? Math.min((stats.collected / stats.target) * 100, 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.quantity) > remainingQuota) {
      return Swal.fire('Kuota Penuh', `Maaf, sisa kuota hanya ${remainingQuota} porsi lagi.`, 'warning');
    }

    setLoading(true);
    const result = await submitDonasiTakjil(form);
    setLoading(false);

    if (result.success) {
      Swal.fire({ title: 'Alhamdulillah!', text: 'Infaq takjil telah tercatat.', icon: 'success' });
      setForm({ studentName: '', studentClass: '', takjilType: 'Nasi Box', quantity: '', message: '' });
    } else {
      Swal.fire('Gagal', result.error, 'error');
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1a5d1a', fontWeight: '900', fontSize: '2.2rem' }}>Infaq Takjil Ramadhan</h1>
          <p style={{ color: '#64748b' }}>SD Muhammadiyah Wonosari</p>
        </div>

        {/* PROGRESS BAR */}
        <div style={progressCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={statLabel}>Terkumpul: <b>{stats.collected} Porsi</b></span>
            <span style={statLabel}>Target: <b>{stats.target} Porsi</b></span>
          </div>
          <div style={barContainer}>
            <div style={{ ...barFill, width: `${percentage}%` }}>
              {percentage > 10 && <span style={barText}>{percentage.toFixed(0)}%</span>}
            </div>
          </div>
        </div>

        <div className="flex-layout">
          <div className="form-section">
            <div style={formCard}>
              {!stats.isOpen || isFull ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <div style={{ fontSize: '3rem' }}>{isFull ? '🎉' : '🔒'}</div>
                  <h3 style={{ color: '#1a5d1a' }}>{isFull ? 'Target Terpenuhi!' : 'Program Ditutup'}</h3>
                  <p style={{ color: '#64748b' }}>Jazakumullah Khairan atas niat baik Bapak/Ibu wali murid.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Nama Murid *</label>
                    <input type="text" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Kelas *</label>
                    <select value={form.studentClass} onChange={e => setForm({...form, studentClass: e.target.value})} style={inputStyle} required>
                      <option value="">-- Pilih Kelas --</option>
                      {['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div><label style={labelStyle}>Jenis Takjil</label><select value={form.takjilType} onChange={e => setForm({...form, takjilType: e.target.value})} style={inputStyle}><option value="Nasi Box">Nasi Box</option><option value="Minuman">Minuman</option></select></div>
                    <div><label style={labelStyle}>Jumlah (Maks. {remainingQuota}) *</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} max={remainingQuota} min="1" style={inputStyle} required /></div>
                  </div>
                  <button type="submit" disabled={loading} style={btnSubmit(loading)}>{loading ? 'Mengirim...' : 'Kirim Infaq Takjil'}</button>
                </form>
              )}
            </div>
          </div>

          <div className="note-section">
            <div style={noteCard}>
              <h3 style={{ color: '#1a5d1a', marginTop: 0 }}>📝 Catatan</h3>
              <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '8px' }}>Minuman tidak boleh mengandung pemanis buatan/pengawet.</li>
                <li style={{ marginBottom: '8px' }}>Nasi Box dipastikan segar & higienis.</li>
                <li>Maksimal penyerahan pukul 16.00 WIB di kantor sekolah.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .flex-layout { display: flex; gap: 30px; align-items: flex-start; }
        .form-section { flex: 1.5; } .note-section { flex: 1; position: sticky; top: 140px; }
        @media (max-width: 900px) { .flex-layout { flex-direction: column; } .note-section { order: -1; } }
      `}</style>
    </div>
  );
}

// STYLING (Tetap Sama)
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '90px 15px 60px', fontFamily: 'Poppins, sans-serif' };
const containerStyle = { maxWidth: '1100px', margin: '0 auto' };
const progressCard = { backgroundColor: 'white', padding: '25px', borderRadius: '24px', marginBottom: '30px', border: '1px solid #e2e8f0' };
const barContainer = { width: '100%', height: '26px', backgroundColor: '#f1f5f9', borderRadius: '13px', overflow: 'hidden' };
const barFill = { height: '100%', backgroundColor: '#1a5d1a', transition: 'width 1s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const barText = { color: 'white', fontSize: '0.8rem', fontWeight: 'bold' };
const statLabel = { fontSize: '0.85rem', color: '#475569' };
const formCard = { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' };
const noteCard = { backgroundColor: '#f0fdf4', padding: '30px', borderRadius: '24px', border: '1px dashed #1a5d1a' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
const btnSubmit = (loading) => ({ backgroundColor: loading ? '#94a3b8' : '#1a5d1a', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', width: '100%', fontWeight: 'bold', cursor: 'pointer' });