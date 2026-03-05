"use client";
import React, { useState, useEffect, useMemo } from 'react'; // Menambahkan useMemo
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { 
  subscribeDonasiTakjil, 
  subscribeDonasiTakjilStatus, 
  updateDonasiTakjilStatus,
  updateDonasiTakjilTarget,
  deleteDonationTakjilEntry
} from '@/lib/firebaseService';

export default function AdminDonasiTakjil() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ isOpen: false, collectedNasi: 0, targetNasi: 0, collectedMinuman: 0, targetMinuman: 0 });

  useEffect(() => {
    const unsubDonasi = subscribeDonasiTakjil((data) => setDonations(data));
    const unsubStats = subscribeDonasiTakjilStatus((data) => setStats(data));
    return () => { unsubDonasi(); unsubStats(); };
  }, []);

  // --- LOGIKA PERBAIKAN BUG (TANPA MERUBAH ISI LAINNYA) ---
  const totalDonaturUnik = useMemo(() => {
    return new Set(
      donations.map(item => `${item.studentName}-${item.studentClass}`.toLowerCase().trim())
    ).size;
  }, [donations]);

  const progress = useMemo(() => {
    const n = stats.targetNasi > 0 ? Math.round((stats.collectedNasi / stats.targetNasi) * 100) : 0;
    const m = stats.targetMinuman > 0 ? Math.round((stats.collectedMinuman / stats.targetMinuman) * 100) : 0;
    return {
      nasi: Math.min(n, 100),
      minum: Math.min(m, 100)
    };
  }, [stats.collectedNasi, stats.targetNasi, stats.collectedMinuman, stats.targetMinuman]);
  // -------------------------------------------------------

  const handleExportExcel = () => {
    if (donations.length === 0) return Swal.fire('Gagal', 'Tidak ada data untuk diekspor', 'error');
    const excelData = donations.map((item, index) => ({
      'No': index + 1, 'Nama Siswa': item.studentName, 'Kelas': item.studentClass,
      'Jenis Takjil': item.takjilType, 'Jumlah (Porsi)': item.amount,
      'Tanggal Masuk': item.date?.toDate?.().toLocaleDateString('id-ID')
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Takjil");
    worksheet['!cols'] = [{wch:5}, {wch:25}, {wch:10}, {wch:15}, {wch:10}, {wch:15}];
    XLSX.writeFile(workbook, `Laporan_Takjil_SDMuri_${new Date().toLocaleDateString('id-ID')}.xlsx`);
  };

  const handleSetTarget = async () => {
    const { value: type } = await Swal.fire({
      title: 'Pilih Target Takjil', input: 'select',
      inputOptions: { 'Nasi Box': '🍱 Nasi Box', 'Minuman': '🥤 Minuman' },
      inputPlaceholder: '-- Pilih Jenis --', showCancelButton: true, confirmButtonColor: '#1a5d1a'
    });

    if (type) {
      const { value: newTarget } = await Swal.fire({
        title: `Set Target ${type}`, input: 'number',
        inputValue: type === 'Nasi Box' ? stats.targetNasi : stats.targetMinuman,
        showCancelButton: true, confirmButtonColor: '#1a5d1a',
      });
      if (newTarget) {
        await updateDonasiTakjilTarget(type, newTarget);
        Swal.fire('Terupdate!', `Target ${type} berhasil diubah.`, 'success');
      }
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Data?', text: "Data akan dihapus dan jumlah porsi akan dikurangi.",
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus'
    }).then((res) => { if (res.isConfirmed) deleteDonationTakjilEntry(id); });
  };

  return (
    <div style={mainContainer}>
      <div className="admin-header" style={headerFlex}>
        <div>
          <h1 style={titleStyle}>Panel Sedekah Takjil</h1>
          <p style={subTitleStyle}>Pantau porsi masuk secara real-time</p>
        </div>
        <div style={actionGroup}>
          <button onClick={handleExportExcel} style={btnExcel}>📊 Excel</button>
          <button onClick={handleSetTarget} style={btnSecondary}>🎯 Target</button>
          <button onClick={() => updateDonasiTakjilStatus(stats.isOpen)} style={stats.isOpen ? btnActive : btnClosed}>
            {stats.isOpen ? '🟢 BUKA' : '🔴 TUTUP'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={gridStats}>
        <div style={cardStat('#1a5d1a')}>
          <small style={statLabel}>🍱 NASI BOX</small>
          <div style={statValue}>{stats.collectedNasi} / {stats.targetNasi || 0}</div>
          <small style={{color:'#64748b'}}>Terpenuhi: {progress.nasi}%</small>
        </div>
        <div style={cardStat('#fbbf24')}>
          <small style={statLabel}>🥤 MINUMAN</small>
          <div style={statValue}>{stats.collectedMinuman} / {stats.targetMinuman || 0}</div>
          <small style={{color:'#64748b'}}>Terpenuhi: {progress.minum}%</small>
        </div>
        <div style={cardStat('#64748b')}>
          <small style={statLabel}>TOTAL DONATUR</small>
          {/* MENGGUNAKAN LOGIKA UNIK AGAR NAMA SAMA DIHITUNG 1 */}
          <div style={statValue}>{totalDonaturUnik} <span style={{fontSize:'1rem'}}>Orang</span></div>
        </div>
      </div>

      <div style={tableWrapper}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>Siswa / Kelas</th><th style={thStyle}>Jenis</th><th style={thStyle}>Jumlah</th><th style={thStyle}>Tanggal</th><th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item.id} style={trStyle}>
                  <td style={tdStyle}><b>{item.studentName}</b><br/><small style={{color:'#64748b'}}>Kelas {item.studentClass}</small></td>
                  <td style={tdStyle}><span style={badgeType(item.takjilType)}>{item.takjilType}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.amount} Porsi</td>
                  <td style={tdStyle}>{item.date?.toDate?.().toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#166534', fontWeight:'bold', fontSize:'0.85rem' }}>✅ Masuk</span>
                      <button onClick={() => handleDelete(item.id)} style={btnDelete}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {donations.length === 0 && <tr><td colSpan="5" style={emptyData}>Belum ada data masuk.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx>{`@media (max-width: 768px) { .admin-header { flex-direction: column; align-items: flex-start !important; } .stats-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// STYLING (SAMA PERSIS DENGAN KODE ASLI ANDA)
const mainContainer = { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' };
const titleStyle = { margin: 0, fontWeight: '900', color: '#1e293b', fontSize: '1.8rem' };
const subTitleStyle = { margin: 0, color: '#64748b', fontSize: '0.9rem' };
const actionGroup = { display: 'flex', gap: '10px' };
const gridStats = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' };
const cardStat = (borderColor) => ({ background: 'white', padding: '20px', borderRadius: '18px', borderLeft: `5px solid ${borderColor}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' });
const statLabel = { color: '#94a3b8', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '1px' };
const statValue = { fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', margin: '5px 0' };
const tableWrapper = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { backgroundColor: '#f8fafc' };
const thStyle = { padding: '15px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px 20px', fontSize: '0.9rem' };
const btnExcel = { background: '#107c41', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnActive = { background: '#dcfce7', color: '#166534', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnClosed = { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnDelete = { background: '#fee2e2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' };
const badgeType = (t) => ({ background: t === 'Nasi Box' ? '#eff6ff' : '#fff7ed', color: t === 'Nasi Box' ? '#1e40af' : '#9a3412', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' });
const emptyData = { textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' };