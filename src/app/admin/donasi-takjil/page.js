"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { 
  subscribeDonasiTakjil, 
  verifyDonationTakjilEntry, 
  subscribeDonasiTakjilStatus, 
  updateDonasiTakjilStatus,
  updateDonasiTakjilTarget,
  deleteDonationTakjilEntry
} from '@/lib/firebaseService';

export default function AdminDonasiTakjil() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ isOpen: false, collected: 0, target: 0 });

  // 1. Ambil data secara Real-time (Snapshot)
  useEffect(() => {
    const unsubDonasi = subscribeDonasiTakjil((data) => setDonations(data));
    const unsubStats = subscribeDonasiTakjilStatus((data) => setStats(data));

    return () => {
      unsubDonasi();
      unsubStats();
    };
  }, []);

  const handleExportExcel = () => {
    if (donations.length === 0) {
      return Swal.fire('Gagal', 'Tidak ada data untuk diekspor', 'error');
    }

    // 1. Format data agar rapi di Excel
    const excelData = donations.map((item, index) => ({
      'No': index + 1,
      'Nama Siswa': item.studentName,
      'Kelas': item.studentClass,
      'Jenis Takjil': item.takjilType,
      'Jumlah (Porsi)': item.amount,
      'Status': item.isVerified ? 'Diterima' : 'Pending',
      'Tanggal Input': item.date?.toDate?.().toLocaleDateString('id-ID'),
      'Pesan/Doa': item.message || '-'
    }));

    // 2. Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Takjil");

    // 3. Atur Lebar Kolom (Opsional agar rapi)
    const wscols = [
      {wch: 5}, {wch: 25}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    // 4. Download File
    XLSX.writeFile(workbook, `Laporan_Infaq_Takjil_SDMuri_${new Date().toLocaleDateString('id-ID')}.xlsx`);
    
    Swal.fire('Berhasil', 'Laporan Excel telah diunduh!', 'success');
  };
  
  // 2. Fungsi Set Target Porsi
  const handleSetTarget = () => {
    Swal.fire({
      title: 'Tentukan Target Infaq',
      text: 'Masukkan target total porsi (Nasi Box + Minuman)',
      input: 'number',
      inputValue: stats.target,
      showCancelButton: true,
      confirmButtonText: 'Simpan Target',
      confirmButtonColor: '#1a5d1a',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        updateDonasiTakjilTarget(result.value);
        Swal.fire('Terupdate!', 'Target porsi berhasil diubah.', 'success');
      }
    });
  };

  // 3. Fungsi Toggle Buka/Tutup Program
  const handleToggleStatus = () => {
    Swal.fire({
      title: `${stats.isOpen ? 'Tutup' : 'Buka'} Program Takjil?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: stats.isOpen ? '#ef4444' : '#1a5d1a',
      confirmButtonText: stats.isOpen ? 'Ya, Tutup' : 'Ya, Buka'
    }).then((result) => {
      if (result.isConfirmed) {
        updateDonasiTakjilStatus(stats.isOpen);
      }
    });
  };

    // TAMBAHKAN STYLE TOMBOL EXCEL
  const btnExcel = { 
    background: '#107c41', // Warna hijau khas Excel
    color: 'white', 
    border: 'none', 
    padding: '10px 18px', 
    borderRadius: '10px', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  // 4. Fungsi Verifikasi Data
  const handleVerify = (id, quantity) => {
    Swal.fire({
      title: 'Verifikasi Takjil?',
      text: "Pastikan fisik takjil sudah diterima di sekolah.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a',
      confirmButtonText: 'Ya, Verifikasi!'
    }).then((result) => {
      if (result.isConfirmed) {
        verifyDonationTakjilEntry(id, quantity);
      }
    });
  };

  // 5. Fungsi Hapus Data
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Data Infaq?',
      text: "Data yang dihapus akan mengurangi total terkumpul (jika sudah diverifikasi).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDonationTakjilEntry(id);
          Swal.fire('Terhapus!', 'Data berhasil dibersihkan.', 'success');
        } catch (error) {
          Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
        }
      }
    });
  };

  return (
    <div style={mainContainer}>
      {/* Header */}
      <div className="admin-header" style={headerFlex}>
        <div>
          <h1 style={titleStyle}>Panel Infaq Takjil</h1>
          <p style={subTitleStyle}>Manajemen data nasi box & minuman siswa</p>
        </div>
        <div style={actionGroup}>
          <button onClick={handleExportExcel} style={btnExcel}>📊 Cetak Excel</button>
          <button onClick={handleSetTarget} style={btnSecondary}>🎯 Set Target</button>
          <button onClick={handleToggleStatus} style={stats.isOpen ? btnActive : btnClosed}>
            {stats.isOpen ? '🟢 BUKA' : '🔴 TUTUP'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={gridStats}>
        <div style={cardStat}>
          <small style={statLabel}>TOTAL TERKUMPUL</small>
          <div style={statValue}>{stats.collected} <span style={statUnit}>Porsi</span></div>
        </div>
        <div style={cardStat}>
          <small style={statLabel}>TARGET</small>
          <div style={statValue}>{stats.target} <span style={statUnit}>Porsi</span></div>
        </div>
        <div style={cardStat}>
          <small style={statLabel}>PERSENTASE</small>
          <div style={statValue}>
            {stats.target > 0 ? Math.round((stats.collected / stats.target) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div style={tableWrapper}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={thStyle}>Nama Siswa / Kelas</th>
                <th style={thStyle}>Takjil</th>
                <th style={thStyle}>Jumlah</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kelas {item.studentClass}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeType(item.takjilType)}>{item.takjilType}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{item.amount} Porsi</td>
                  <td style={tdStyle}>
                    {item.isVerified ? 
                      <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 'bold' }}>✅ Diterima</span> : 
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>⏳ Pending</span>
                    }
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {!item.isVerified && (
                        <button onClick={() => handleVerify(item.id, item.amount)} style={btnVerify}>✓</button>
                      )}
                      <button onClick={() => handleDelete(item.id)} style={btnDelete}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr>
                  <td colSpan="5" style={emptyData}>Belum ada infaq masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-header { flex-direction: column; align-items: flex-start !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// STYLING (Josjis Standard)
const mainContainer = { padding: 'clamp(15px, 4vw, 30px)', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' };
const titleStyle = { margin: 0, fontWeight: '900', color: '#1e293b' };
const subTitleStyle = { margin: 0, color: '#64748b', fontSize: '0.9rem' };
const actionGroup = { display: 'flex', gap: '10px' };
const gridStats = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' };
const cardStat = { background: 'white', padding: '20px', borderRadius: '18px', borderLeft: '5px solid #1a5d1a', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' };
const statLabel = { color: '#94a3b8', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '1px' };
const statValue = { fontSize: '1.8rem', fontWeight: '900', color: '#1a5d1a' };
const statUnit = { fontSize: '0.8rem', fontWeight: 'normal' };
const tableWrapper = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { backgroundColor: '#f8fafc' };
const thStyle = { padding: '15px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px 20px', fontSize: '0.9rem' };
const btnActive = { background: '#dcfce7', color: '#166534', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnClosed = { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondary = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnVerify = { background: '#1a5d1a', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' };
const btnDelete = { background: '#fee2e2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' };
const badgeType = (t) => ({ background: t === 'Nasi Box' ? '#eff6ff' : '#fff7ed', color: t === 'Nasi Box' ? '#1e40af' : '#9a3412', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' });
const emptyData = { textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' };