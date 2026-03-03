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
      Swal.fire({
        title: 'Infaq Diterima',
        text: 'Terimakasih kepada Ayah/Bunda yang telah memberikan takjil untuk kegiatan buka bersama siswa SD Muhammadiyah Wonosari. Semoga Allah Swt selalu melimpahkan rejeki dan apa yang diberikan menjadi ladang pahala dan keberkahan untuk Ayah/Bunda sekeluarga.',
        icon: 'success',
        confirmButtonColor: '#1a5d1a',
        confirmButtonText: 'Aamiin'
      });
      setForm({ studentName: '', studentClass: '', takjilType: 'Nasi Box', quantity: '', message: '' });
    } else {
      Swal.fire('Gagal', result.error, 'error');
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <div style={headerSection}>
          <h1 style={titleStyle}>Infaq Takjil Ramadhan</h1>
          <p style={subTitleStyle}>SD Muhammadiyah Wonosari</p>
        </div>

        {/* PROGRESS BAR MOBILE OPTIMIZED */}
        <div style={progressCard}>
          <div style={statFlex}>
            <span style={statLabel}>Terkumpul: <b>{stats.collected}</b></span>
            <span style={statLabel}>Target: <b>{stats.target}</b></span>
          </div>
          <div style={barContainer}>
            <div style={{ ...barFill, width: `${percentage}%` }}>
              {percentage > 15 && <span style={barText}>{percentage.toFixed(0)}%</span>}
            </div>
          </div>
          <p style={bottomStatText}>
            {isFull ? "🎉 Target porsi sudah terpenuhi" : `Sisa: ${remainingQuota} porsi lagi`}
          </p>
        </div>

        <div className="main-layout">
          <div className="form-column">
            <div style={formCard}>
              {!stats.isOpen || isFull ? (
                <div style={closedMsgStyle}>
                  <div style={{ fontSize: '3.5rem' }}>{isFull ? '✨' : '🌙'}</div>
                  <h3 style={{ color: '#1a5d1a', marginBottom: '8px' }}>{isFull ? 'Target Terpenuhi!' : 'Program Ditutup'}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Jazakumullah Khairan atas niat baik Ayah/Bunda wali murid.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={formStyle}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Nama Murid *</label>
                    <input type="text" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} placeholder="Nama lengkap..." style={inputStyle} required />
                  </div>
                  
                  <div style={inputGroup}>
                    <label style={labelStyle}>Kelas *</label>
                    <select value={form.studentClass} onChange={e => setForm({...form, studentClass: e.target.value})} style={inputStyle} required>
                      <option value="">-- Pilih Kelas --</option>
                      {['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'].map(k => <option key={k} value={k}>Kelas {k}</option>)}
                    </select>
                  </div>

                  <div className="grid-mobile">
                    <div style={inputGroup}>
                      <label style={labelStyle}>Takjil</label>
                      <select value={form.takjilType} onChange={e => setForm({...form, takjilType: e.target.value})} style={inputStyle}>
                        <option value="Nasi Box">Nasi Box</option>
                        <option value="Minuman">Minuman</option>
                      </select>
                    </div>
                    <div style={inputGroup}>
                      <label style={labelStyle}>Jumlah (Porsi)</label>
                      <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} max={remainingQuota} min="1" style={inputStyle} required />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={btnSubmit(loading)}>
                    {loading ? 'Memproses...' : 'Kirim Infaq Takjil'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="note-column">
            <div style={noteCard}>
              <h4 style={{ color: '#1a5d1a', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Ketentuan
              </h4>
              <ul style={noteListStyle}>
                <li><b>Minuman:</b> Tanpa pemanis buatan & pengawet.</li>
                <li><b>Nasi Box:</b> Menu segar & higienis.</li>
                <li><b>Waktu:</b> Max pukul 16.00 WIB di kantor sekolah.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-layout { display: flex; gap: 20px; align-items: flex-start; }
        .form-column { flex: 1.6; }
        .note-column { flex: 1; position: sticky; top: 110px; }
        .grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

        @media (max-width: 768px) {
          .main-layout { flex-direction: column; }
          .note-column { order: -1; position: static; width: 100%; }
          .form-column { width: 100%; }
          .grid-mobile { grid-template-columns: 1fr; gap: 20px; }
        }
      `}</style>
    </div>
  );
}

// STYLING MOBILE-FRIENDLY
const pageWrapper = { minHeight: '100vh', backgroundColor: '#f4f7f5', padding: '100px 15px 40px', fontFamily: 'Poppins, sans-serif' };
const containerStyle = { maxWidth: '1000px', margin: '0 auto' };
const headerSection = { textAlign: 'center', marginBottom: '30px' };
const titleStyle = { color: '#1a5d1a', fontWeight: '900', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', margin: '0 0 5px 0' };
const subTitleStyle = { color: '#64748b', margin: 0, fontSize: '0.95rem' };

const progressCard = { backgroundColor: 'white', padding: '20px', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' };
const statFlex = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' };
const statLabel = { color: '#475569' };
const barContainer = { width: '100%', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' };
const barFill = { height: '100%', backgroundColor: '#1a5d1a', transition: 'width 1.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const barText = { color: 'white', fontSize: '0.75rem', fontWeight: 'bold' };
const bottomStatText = { textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#1a5d1a', fontWeight: 'bold' };

const formCard = { backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', outline: 'none' };
const btnSubmit = (loading) => ({ backgroundColor: loading ? '#94a3b8' : '#1a5d1a', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' });

const noteCard = { backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '20px', border: '1px dashed #1a5d1a' };
const noteListStyle = { paddingLeft: '18px', margin: 0, color: '#475569', fontSize: '0.85rem', lineHeight: '1.6' };
const closedMsgStyle = { textAlign: 'center', padding: '20px' };