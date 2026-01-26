"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function AdminPPDB() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Fitur Pencarian
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "ppdb_registrations"), orderBy("createdAt", "desc"));
        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }, (error) => {
          if (error.code === 'permission-denied') {
            Swal.fire("Akses Ditolak", "Periksa Rules Firestore Anda.", "error");
          }
        });
        return () => unsubSnapshot();
      }
    });
    return () => unsubAuth();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      confirmButtonColor: '#e74c3c'
    });
    if (result.isConfirmed) {
      await signOut(auth);
      window.location.href = '/admin';
    }
  };

  const exportToExcel = () => {
    if (students.length === 0) return;
    const data = students.map((s, i) => ({
      "No": i + 1,
      "Nama Lengkap": s.namaLengkap,
      "NIK": s.nik,
      "WhatsApp": s.noHp,
      "Status": s.status || 'pending'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftar");
    XLSX.writeFile(wb, "Data_PPDB_SDM_Wonosari.xlsx");
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "ppdb_registrations", id), { status: newStatus });
      Swal.fire({ title: "Berhasil", text: "Status diperbarui", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (e) { Swal.fire("Error", "Gagal ubah status", "error"); }
  };

  const hapusData = async (id, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Menghapus data ${nama} secara permanen?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "ppdb_registrations", id));
    }
  };

  // Logika Filter Pencarian
  const filteredStudents = students.filter(student =>
    student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nik.includes(searchTerm)
  );

  // Statistik Ringkas
  const stats = {
    total: students.length,
    diterima: students.filter(s => s.status === 'diterima').length,
    pending: students.filter(s => s.status !== 'diterima').length
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f4f7f6' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '10px', color: '#7f8c8d' }}>Memuat Data PPDB...</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '100px 20px 40px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#1e293b', fontWeight: '800', margin: 0, fontSize: '1.8rem' }}>Dashboard PPDB</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Manajemen Pendaftaran Siswa Baru SDM Wonosari</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportToExcel} style={btnSecondary}>
               📄 Ekspor Excel
            </button>
            <button onClick={handleLogout} style={btnDanger}>
               Keluar
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={statCard}>
            <small style={statLabel}>Total Pendaftar</small>
            <h2 style={statValue}>{stats.total} <span style={{fontSize: '1rem', fontWeight: '400'}}>Siswa</span></h2>
          </div>
          <div style={{ ...statCard, borderLeft: '5px solid #2ecc71' }}>
            <small style={statLabel}>Diterima</small>
            <h2 style={{ ...statValue, color: '#2ecc71' }}>{stats.diterima}</h2>
          </div>
          <div style={{ ...statCard, borderLeft: '5px solid #f39c12' }}>
            <small style={statLabel}>Menunggu</small>
            <h2 style={{ ...statValue, color: '#f39c12' }}>{stats.pending}</h2>
          </div>
        </div>

        {/* CONTROLS & TABLE */}
        <div style={mainCard}>
          <div style={{ padding: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                placeholder="Cari nama atau NIK..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInput}
              />
            </div>
            <Link href="/" style={{ fontSize: '0.85rem', color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>← Lihat Web Utama</Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={thStyle}>BIODATA SISWA</th>
                  <th style={thStyle}>KONTAK</th>
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="table-row" style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={tdStyle}>
                      <div onClick={() => setSelectedStudent(s)} style={{ cursor: 'pointer' }}>
                        <div style={{ color: '#2d3436', fontWeight: '700', fontSize: '0.95rem' }}>{s.namaLengkap}</div>
                        <div style={{ fontSize: '0.75rem', color: '#636e72', marginTop: '3px' }}>{s.nik} • {s.jenisKelamin}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <a href={`https://wa.me/62${s.noHp?.startsWith('0') ? s.noHp.slice(1) : s.noHp}`} target="_blank" style={waBadge}>
                        Chat WhatsApp
                      </a>
                    </td>
                    <td style={tdStyle}>
                      <select value={s.status || 'pending'} onChange={(e) => updateStatus(s.id, e.target.value)} style={selectStyle(s.status)}>
                        <option value="pending">⏳ Pending</option>
                        <option value="diterima">✅ Diterima</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => hapusData(s.id, s.namaLengkap)} style={btnIconDelete} title="Hapus Data">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#95a5a6' }}>Data tidak ditemukan.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL (POPOUT) --- */}
      {selectedStudent && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Profil Lengkap Ananda</h3>
              <button onClick={() => setSelectedStudent(null)} style={btnClose}>&times;</button>
            </div>

            <div style={modalBody}>
              <div style={gridDetail}>
                <section>
                  <h4 style={sectionTitle}>I. DATA PRIBADI</h4>
                  <DetailRow label="Nama Lengkap" value={selectedStudent.namaLengkap} />
                  <DetailRow label="NIK" value={selectedStudent.nik} />
                  <DetailRow label="Tempat, Tgl Lahir" value={`${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}`} />
                  <DetailRow label="Urutan Keluarga" value={`Anak ke-${selectedStudent.anakKe} dari ${selectedStudent.jumlahSaudara} bersaudara`} />
                </section>

                <section>
                  <h4 style={sectionTitle}>II. KONTAK & ALAMAT</h4>
                  <DetailRow label="WhatsApp" value={selectedStudent.noHp} />
                  <DetailRow label="Alamat" value={selectedStudent.alamatLengkap} />
                  <DetailRow label="Lingkungan" value={`Dusun ${selectedStudent.dusun}, RT/RW ${selectedStudent.rtRw}, Desa ${selectedStudent.desaKelurahan}`} />
                </section>

                <section style={{ gridColumn: 'span 2' }}>
                  <h4 style={sectionTitle}>III. DATA ORANG TUA</h4>
                  <div style={{ display: 'flex', gap: '40px' }}>
                    <DetailRow label="Nama Ayah" value={selectedStudent.namaAyah} />
                    <DetailRow label="Pekerjaan Ayah" value={selectedStudent.pekerjaanAyah} />
                    <DetailRow label="Nama Ibu" value={selectedStudent.namaIbu} />
                    <DetailRow label="Pekerjaan Ibu" value={selectedStudent.pekerjaanIbu} />
                  </div>
                </section>
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
               <button onClick={() => setSelectedStudent(null)} style={btnPrimary}>Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS internal untuk hover effect */}
      <style jsx>{`
        .table-row:hover { background-color: #f8fafc; transition: 0.2s; }
        .spinner { border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #1a5d1a; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Sub-component untuk baris detail agar rapi
const DetailRow = ({ label, value }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ fontSize: '0.65rem', color: '#95a5a6', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', color: '#2d3436', fontWeight: '500' }}>{value || '-'}</div>
  </div>
);

// --- STYLING OBJECTS ---
const mainCard = { background: 'white', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' };
const statCard = { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const statLabel = { color: '#64748b', fontSize: '0.8rem', fontWeight: '600' };
const statValue = { margin: '5px 0 0 0', fontSize: '1.5rem', color: '#1e293b', fontWeight: '800' };

const thStyle = { padding: '15px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle' };

const searchInput = { width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', background: '#f8fafc' };

const btnPrimary = { background: '#1a5d1a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' };
const btnSecondary = { background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '10px 18px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const btnDanger = { background: '#fff1f2', border: '1px solid #fecaca', color: '#e11d48', padding: '10px 18px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const btnIconDelete = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: '0.6' };

const waBadge = { background: '#25D366', color: 'white', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700' };
const selectStyle = (status) => ({ padding: '6px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', border: '1px solid #e2e8f0', cursor: 'pointer', background: status === 'diterima' ? '#ecfdf5' : '#fff', color: status === 'diterima' ? '#059669' : '#1e293b' });

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' };
const modalContentStyle = { backgroundColor: 'white', borderRadius: '24px', maxWidth: '800px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' };
const modalHeader = { padding: '20px 25px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const modalBody = { padding: '25px', maxHeight: '70vh', overflowY: 'auto' };
const btnClose = { background: 'none', border: 'none', fontSize: '2rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '1' };
const sectionTitle = { color: '#1a5d1a', fontSize: '0.8rem', borderBottom: '2px solid #f0f2f5', paddingBottom: '5px', marginBottom: '15px', fontWeight: '800', letterSpacing: '0.05em' };
const gridDetail = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };