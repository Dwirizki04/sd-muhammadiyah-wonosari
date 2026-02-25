"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

// --- IMPORT SERVICE (LOGIKA TIDAK BERUBAH) ---
import { 
  subscribePPDB, 
  updateStatusPPDB, 
  deletePPDBEntry,
  subscribePPDBStatus,
  updatePPDBStatus 
} from '@/lib/firebaseService';

export default function AdminPPDB() {
  // --- STATE & LOGIKA (TIDAK ADA YANG DIUBAH DI SINI) ---
  const [ppdbData, setPpdbData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    const unsubPPDB = subscribePPDB((data) => {
      setPpdbData(data || []);
      setLoading(false);
    });
    const unsubStatus = subscribePPDBStatus((status) => {
      setIsOpen(status);
    });
    return () => { unsubPPDB(); unsubStatus(); };
  }, []);

  const filteredData = (ppdbData || []).filter(item => 
    item?.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePPDB = async () => {
    setLoadingStatus(true);
    try {
      await updatePPDBStatus(!isOpen);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: !isOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup', showConfirmButton: false, timer: 1500 });
    } catch (error) { Swal.fire('Error', 'Gagal update status', 'error'); }
    setLoadingStatus(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatusPPDB(id, newStatus);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status Diperbarui', showConfirmButton: false, timer: 1000 });
    } catch (error) { Swal.fire('Error', 'Gagal update status', 'error'); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Hapus Data?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus!' });
    if (result.isConfirmed) { await deletePPDBEntry(id); Swal.fire('Terhapus!', '', 'success'); }
  };

  if (loading) return <div style={styles.loading}>Memuat Dashboard...</div>;

  // --- TAMPILAN BARU (JSX DIUBAH TOTAL) ---
  return (
    <div style={styles.pageWrapper}>
      
      {/* 1. HEADER DASHBOARD & PANEL KONTROL STATUS */}
      <div style={styles.topSection}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard PPDB</h1>
          <p style={styles.pageSubtitle}>Manajemen data calon siswa baru</p>
        </div>

        {/* KARTU STATUS SISTEM (SAKLAR) */}
        <div style={{...styles.statusCard, borderColor: isOpen ? 'var(--primary-green)' : '#e11d48'}}>
          <div style={styles.statusInfo}>
            <span style={styles.statusLabel}>STATUS PENDAFTARAN</span>
            <h3 style={{...styles.statusValue, color: isOpen ? 'var(--primary-green)' : '#e11d48'}}>
              {isOpen ? '🟢 DIBUKA' : '🔴 DITUTUP'}
            </h3>
            <span style={styles.statusDetail}>
              {isOpen ? 'Siswa dapat mendaftar' : 'Formulir publik disembunyikan'}
            </span>
          </div>
          
          <div 
            onClick={!loadingStatus ? handleTogglePPDB : null} 
            style={{...styles.switchBg, backgroundColor: isOpen ? 'var(--primary-green)' : '#cbd5e1', opacity: loadingStatus ? 0.5 : 1}}
          >
            <motion.div 
              animate={{ x: isOpen ? 28 : 0 }} 
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              style={switchHandle} 
            />
          </div>
        </div>
      </div>

      {/* 2. AREA PENCARIAN & TOTAL DATA */}
      <div style={styles.toolbarSection}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            type="text" placeholder="Cari nama siswa, NIK..." 
            style={styles.searchInput} value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={styles.totalBadge}>
          Total: <strong>{ppdbData.length}</strong> Siswa
        </div>
      </div>

      {/* 3. DAFTAR DATA SISWA (KARTU BESAR) */}
      <div style={styles.listCard}>
        {/* Header Tabel */}
        <div style={styles.listHeaderRow}>
          <div style={{flex: 2}}>IDENTITAS CALON SISWA</div>
          <div style={{flex: 1.2}}>STATUS VERIFIKASI</div>
          <div style={{flex: 0.8, textAlign: 'right'}}>AKSI</div>
        </div>

        <div style={styles.listBody}>
          <AnimatePresence>
            {filteredData.length > 0 ? filteredData.map((item) => (
              <motion.div key={item.id} layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={styles.itemRow}>
                
                {/* Kolom 1: Identitas */}
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={styles.avatar}>
                    {item.namaLengkap?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={styles.itemName}>{item.namaLengkap || 'Tanpa Nama'}</div>
                    <div style={styles.itemDetail}>
                       NIK: {item.nik || '-'} <br/>
                       {item.desaKelurahan ? `${item.desaKelurahan}, ` : ''}{item.kecamatan || ''}
                    </div>
                  </div>
                </div>

                {/* Kolom 2: Status Dropdown Kustom */}
                <div style={{ flex: 1.2 }}>
                  <div style={getStatusWrapperStyle(item.status)}>
                    <select 
                      value={item.status || 'pending'} 
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                      style={styles.hiddenSelect}
                    >
                      <option value="pending">⏳ Menunggu Verifikasi</option>
                      <option value="terverifikasi">✅ Diterima</option>
                      <option value="ditolak">❌ Ditolak/Cadangan</option>
                    </select>
                    <div style={styles.visibleSelectLabel}>
                       {item.status === 'terverifikasi' ? '✅ Diterima' : item.status === 'ditolak' ? '❌ Ditolak' : '⏳ Pending'}
                    </div>
                  </div>
                </div>

                {/* Kolom 3: Aksi */}
                <div style={{ flex: 0.8, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedStudent(item)} style={styles.actionBtnDetail} title="Lihat Detail">
                    👁️ Detail
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={styles.actionBtnDelete} title="Hapus Data">
                    🗑️
                  </button>
                </div>

              </motion.div>
            )) : (
              <div style={styles.emptyState}>
                <span style={{fontSize: '3rem'}}>📭</span>
                <p>Tidak ada data siswa yang ditemukan.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL DETAIL (STRUKTUR SAMA, STYLE DIPERBARUI DIKIT) */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={{margin:0}}>Detail: <span style={{color:'var(--primary-green)'}}>{selectedStudent.namaLengkap}</span></h2>
                <button onClick={() => setSelectedStudent(null)} style={styles.closeBtn}>✕</button>
              </div>
              <div style={styles.modalBody}>
                 {/* Isi modal sama seperti sebelumnya, hanya style container yang berubah */}
                 <h3 style={sectionTitle}>I. Identitas Siswa</h3>
                 <div style={detailGrid}>
                  <DetailItem label="NIK" value={selectedStudent.nik} />
                  <DetailItem label="Jenis Kelamin" value={selectedStudent.jenisKelamin} />
                  <DetailItem label="Tempat, Tgl Lahir" value={`${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}`} />
                  <DetailItem label="Alamat" value={selectedStudent.alamatLengkap} />
                </div>
                <h3 style={sectionTitle}>II. Data Orang Tua</h3>
                <div style={detailGrid}>
                  <DetailItem label="Nama Ayah" value={selectedStudent.namaAyah} />
                  <DetailItem label="Nama Ibu" value={selectedStudent.namaIbu} />
                  <DetailItem label="WhatsApp" value={selectedStudent.noWa} color="var(--primary-green)" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---
function DetailItem({ label, value, color = '#333' }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight:'600' }}>{label.toUpperCase()}</label>
      <div style={{ fontSize: '0.95rem', fontWeight: '600', color: color, borderBottom:'1px solid #f1f5f9', paddingBottom:'5px' }}>{value || '-'}</div>
    </div>
  );
}

// --- STYLES BARU YANG LEBIH MODERN ---
const styles = {
  pageWrapper: { padding: '30px 40px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  loading: { height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'#64748b', fontWeight:'600' },
  
  // Header & Top Section
  topSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  pageTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '0 0 5px 0' },
  pageSubtitle: { color: '#64748b', margin: 0 },

  // Kartu Status (Saklar)
  statusCard: { display: 'flex', alignItems: 'center', justifyContent:'space-between', gap: '20px', background: 'white', padding: '15px 25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid' },
  statusInfo: { textAlign: 'left' },
  statusLabel: { fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' },
  statusValue: { margin: '5px 0', fontSize: '1.1rem', fontWeight: '800' },
  statusDetail: { fontSize: '0.75rem', color: '#64748b' },
  switchBg: { width: '60px', height: '32px', borderRadius: '20px', padding: '4px', cursor: 'pointer', transition: '0.3s' },

  // Toolbar (Search & Total)
  toolbarSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  searchContainer: { display:'flex', alignItems:'center', background:'white', padding:'0 15px', borderRadius:'12px', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', flex: 1, maxWidth:'400px' },
  searchIcon: { marginRight:'10px', opacity: 0.5 },
  searchInput: { border:'none', outline:'none', padding:'14px 0', width:'100%', fontSize:'0.95rem' },
  totalBadge: { background: '#e2e8f0', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', color: '#475569' },

  // List Card Container
  listCard: { background: 'white', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
  listHeaderRow: { display: 'flex', padding: '15px 30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' },
  listBody: { padding: '10px' },

  // Data Rows
  itemRow: { display: 'flex', alignItems: 'center', padding: '15px 20px',borderBottom: '1px solid #f1f5f9', transition: '0.2s', borderRadius:'12px', margin:'5px 0', '&:hover': { background: '#f8fafc' } },
  avatar: { width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-green), #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.3rem', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  itemName: { fontWeight: '700', fontSize: '1rem', color: '#1e293b' },
  itemDetail: { fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4', marginTop:'4px' },

  // Actions
  actionBtnDetail: { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', transition: '0.2s', display:'flex', alignItems:'center', gap:'5px' },
  actionBtnDelete: { background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s' },
  
  // Select Kustom (Trik agar terlihat bagus)
  hiddenSelect: { position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' },
  visibleSelectLabel: { fontSize:'0.85rem', fontWeight:'700' },

  // States
  emptyState: { textAlign: 'center', padding: '60px', color: '#94a3b8' },

  // Modal Styling
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalContent: { backgroundColor: 'white', width: '100%', maxWidth: '700px', borderRadius: '24px', padding: '35px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  closeBtn: { background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '12px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold', fontSize:'1.1rem' },
};

// Style Dinamis untuk Wrapper Select
const getStatusWrapperStyle = (status) => ({
  position: 'relative',
  padding: '10px 16px', borderRadius: '10px',
  backgroundColor: status === 'terverifikasi' ? '#dcfce7' : status === 'ditolak' ? '#fee2e2' : '#fef9c3',
  color: status === 'terverifikasi' ? '#166534' : status === 'ditolak' ? '#991b1b' : '#854d0e',
  display: 'inline-block',
  width: '100%',
  textAlign: 'center',
  border: `1px solid ${status === 'terverifikasi' ? '#bbf7d0' : status === 'ditolak' ? '#fecaca' : '#fde047'}`,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
});

const switchHandle = { width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' };
// Gunakan style sectionTitle dan detailGrid dari kode sebelumnya atau sesuaikan di sini
const sectionTitle = { fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', marginTop: '25px', fontWeight: '800', borderBottom:'2px solid #f1f5f9', paddingBottom:'10px' };
const detailGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };