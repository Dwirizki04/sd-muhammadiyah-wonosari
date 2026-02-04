"use client";
import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function AdminPPDB() {
  const [ppdbData, setPpdbData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "ppdb_registrations"), orderBy("createdAt", "desc"));
        const unsubSnap = onSnapshot(q, (snap) => {
          setPpdbData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsubSnap();
      } else {
        window.location.href = '/admin';
      }
    });
    return () => unsubAuth();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "ppdb_registrations", id), { status: newStatus });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status Update!', showConfirmButton: false, timer: 1500 });
    } catch (error) { console.error(error); }
  };

  const filteredData = ppdbData.filter(item => 
    item.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={loadingOverlay}>Sinkronisasi Database...</div>;

  return (
    <div style={pageWrapper}>
      <header style={headerContainer}>
        <div>
          <h1 style={mainTitle}>Database Pendaftar</h1>
          <p style={subTitle}>SD Muhammadiyah Wonosari • {ppdbData.length} Total Siswa</p>
        </div>
        <input 
          type="text" placeholder="Cari nama siswa..." 
          style={searchInput} value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <div style={listWrapper}>
        <div style={listHeader}>
          <span style={{ flex: 2 }}>IDENTITAS SISWA</span>
          <span style={{ flex: 1.5 }}>STATUS</span>
          <span style={{ flex: 1, textAlign: 'right' }}>AKSI</span>
        </div>

        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div key={item.id} layout style={itemRow}>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={avatarCircle}>{item.namaLengkap?.charAt(0)}</div>
                <div>
                  <div style={namaSiswa}>{item.namaLengkap}</div>
                  <div style={tglSiswa}>{item.desaKelurahan || '-'}, {item.kecamatan || '-'}</div>
                </div>
              </div>

              <div style={{ flex: 1.5 }}>
                <select 
                  value={item.status || 'pending'} 
                  onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                  style={getStatusStyle(item.status)}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="terverifikasi">✅ Diterima</option>
                  <option value="ditolak">❌ Ditolak</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedStudent(item)} style={detailBtn}>👁️ Detail</button>
                <button onClick={() => deleteDoc(doc(db, "ppdb_registrations", item.id))} style={delBtn}>🗑️</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={modalOverlay} onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={modalContent} onClick={e => e.stopPropagation()}
            >
              <div style={modalHeader}>
                <h2>Detail Calon Siswa</h2>
                <button onClick={() => setSelectedStudent(null)} style={closeBtn}>✕</button>
              </div>

              <div style={modalBody}>
                <h3 style={sectionTitle}>I. Identitas Siswa</h3>
                <div style={detailGrid}>
                  <DetailItem label="Nama Lengkap" value={selectedStudent.namaLengkap} />
                  <DetailItem label="NIK" value={selectedStudent.nik} />
                  <DetailItem label="Jenis Kelamin" value={selectedStudent.jenisKelamin} />
                  <DetailItem label="Tempat, Tgl Lahir" value={`${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}`} />
                  <DetailItem label="Anak Ke / Saudara" value={`${selectedStudent.anakKe} dari ${selectedStudent.jumlahSaudara} bersaudara`} />
                </div>

                <h3 style={sectionTitle}>II. Alamat</h3>
                <div style={detailGrid}>
                  <DetailItem label="Alamat Lengkap" value={selectedStudent.alamatLengkap} />
                  <DetailItem label="Dusun / RT / RW" value={`${selectedStudent.dusun} / ${selectedStudent.rtRw}`} />
                  <DetailItem label="Desa / Kecamatan" value={`${selectedStudent.desaKelurahan} / ${selectedStudent.kecamatan}`} />
                </div>

                <h3 style={sectionTitle}>III. Orang Tua & Kontak</h3>
                <div style={detailGrid}>
                  <DetailItem label="Nama Ayah" value={selectedStudent.namaAyah} />
                  <DetailItem label="Pekerjaan Ayah" value={selectedStudent.pekerjaanAyah} />
                  <DetailItem label="Nama Ibu" value={selectedStudent.namaIbu} />
                  <DetailItem label="Pekerjaan Ibu" value={selectedStudent.pekerjaanIbu} />
                  <DetailItem label="Nomor WhatsApp" value={selectedStudent.noHp} color="#1a5d1a" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, color = '#333' }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ fontSize: '0.75rem', color: '#999', display: 'block', marginBottom: '2px' }}>{label}</label>
      <div style={{ fontSize: '0.95rem', fontWeight: '600', color: color }}>{value || '-'}</div>
    </div>
  );
}

// --- STYLES ---
const pageWrapper = { padding: '50px', backgroundColor: '#f0f4f0', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const mainTitle = { fontSize: '2rem', fontWeight: '800', color: '#1a5d1a', margin: 0 };
const subTitle = { color: '#666', fontSize: '0.9rem' };
const searchInput = { padding: '12px 20px', borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', width: '300px', outline: 'none' };

const listWrapper = { display: 'flex', flexDirection: 'column', gap: '10px' };
const listHeader = { display: 'flex', padding: '0 30px 10px', fontSize: '0.75rem', fontWeight: 'bold', color: '#999' };
const itemRow = { display: 'flex', alignItems: 'center', padding: '15px 30px', background: 'white', borderRadius: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' };
const avatarCircle = { width: '40px', height: '40px', borderRadius: '12px', background: '#1a5d1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const namaSiswa = { fontWeight: '700', fontSize: '0.95rem' };
const tglSiswa = { fontSize: '0.8rem', color: '#888' };

const detailBtn = { background: '#f0f4f0', border: 'none', color: '#1a5d1a', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const delBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContent = { backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '25px', padding: '35px', maxHeight: '90vh', overflowY: 'auto' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' };
const modalBody = { paddingTop: '10px' }; // FIX: Definisi modalBody ditambahkan
const closeBtn = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' };
const sectionTitle = { fontSize: '0.85rem', color: '#1a5d1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', marginTop: '20px' };
const detailGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' };

const getStatusStyle = (status) => ({
  padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
  backgroundColor: status === 'terverifikasi' ? '#e8f5e9' : status === 'ditolak' ? '#ffebee' : '#fff9c4',
  color: status === 'terverifikasi' ? '#2e7d32' : status === 'ditolak' ? '#c62828' : '#f57f17'
});
const loadingOverlay = { padding: '100px', textAlign: 'center', fontWeight: 'bold', color: '#1a5d1a' };