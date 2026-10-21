"use client";
import React, { useState, useEffect } from 'react';
import { 
  subscribePPDB, 
  updateStatusPPDB, 
  deletePPDBEntry, 
  subscribePPDBConfig, 
  updatePPDBStatus,
  updatePPDBKuota,
  syncPPDBCounter
} from '@/lib/firebaseService';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER UMUR & URUTAN ---
// Tanggal lahir tersimpan sebagai string "YYYY-MM-DD" (dari input type="date").
const parseBirth = (str) => {
  if (!str || str === '-') return null;
  const t = new Date(str).getTime();
  return Number.isNaN(t) ? null : t;
};

const hitungUmur = (str) => {
  const t = parseBirth(str);
  if (t === null) return '-';
  const lahir = new Date(t);
  const now = new Date();
  let tahun = now.getFullYear() - lahir.getUTCFullYear();
  let bulan = now.getMonth() - lahir.getUTCMonth();
  if (now.getDate() < lahir.getUTCDate()) bulan -= 1;
  if (bulan < 0) { tahun -= 1; bulan += 12; }
  if (tahun < 0) return '-';
  return `${tahun} th ${bulan} bln`;
};

// order: 'terbaru' | 'tertua' | 'termuda'
// 'tertua'  = tanggal lahir paling awal di atas (umur terbesar -> terkecil)
// 'termuda' = tanggal lahir paling akhir di atas (umur terkecil -> terbesar)
const urutkanPendaftar = (list, order) => {
  if (order === 'terbaru') return list; // sudah urut createdAt desc dari Firestore
  const arah = order === 'tertua' ? 1 : -1;
  return [...list].sort((a, b) => {
    const ta = parseBirth(a.tanggalLahir);
    const tb = parseBirth(b.tanggalLahir);
    // Tanggal lahir kosong/tidak valid selalu di paling bawah
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    if (ta !== tb) return (ta - tb) * arah;
    // Tanggal lahir sama -> yang mendaftar lebih dulu di atas
    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });
};

export default function AdminPPDB() {
  const [ppdbData, setPpdbData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [kuota, setKuota] = useState(0);
  const [totalPendaftar, setTotalPendaftar] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("terbaru");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubData = subscribePPDB((data) => {
      setPpdbData(data);
      setLoading(false);
    });
    const unsubConfig = subscribePPDBConfig((config) => {
      setIsOpen(config.isOpen);
      setKuota(config.kuota);
      setTotalPendaftar(config.totalPendaftar);
    });
    return () => { unsubData(); unsubConfig(); };
  }, []);

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Hapus Pendaftaran?',
      html: `Data <strong>${item.namaLengkap}</strong> (NIK: ${item.nik}) akan dihapus permanen dan tidak bisa dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      await deletePPDBEntry(item.id);
      Swal.fire({ title: 'Terhapus', icon: 'success', timer: 1200, showConfirmButton: false });
    }
  };

  const handleSyncCounter = async () => {
    const realCount = await syncPPDBCounter();
    Swal.fire({
      title: 'Counter Disinkronkan',
      text: `Total pendaftar sekarang: ${realCount} (sesuai data asli).`,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const handleSetKuota = async () => {
    const { value: newKuota } = await Swal.fire({
      title: 'Atur Kuota Pendaftaran',
      html: `Total pendaftar saat ini: <strong>${totalPendaftar}</strong>`,
      input: 'number',
      inputValue: kuota,
      inputLabel: 'Kuota maksimal (isi 0 untuk tanpa batas)',
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a',
      confirmButtonText: 'Simpan',
      inputAttributes: { min: 0 },
    });
    if (newKuota !== undefined) {
      await updatePPDBKuota(newKuota);
      Swal.fire({ title: 'Kuota Diperbarui', icon: 'success', timer: 1200, showConfirmButton: false });
    }
  };

  const stats = {
    total: ppdbData.length,
    pending: ppdbData.filter(d => d.status === 'pending').length,
    verified: ppdbData.filter(d => d.status === 'terverifikasi').length,
  };

  const filteredData = ppdbData.filter(d => {
    const matchesSearch = d.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || d.nik?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedData = urutkanPendaftar(filteredData, sortOrder);

  // --- EKSPOR EXCEL RAPI ---
  const exportToExcel = () => {
    const separator = ";";
    const headers = ["Nama", "NIK", "NISN", "JK", "TTL", "Umur", "Alamat", "Desa", "Kecamatan", "WA Ayah", "WA Ibu", "Status"].join(separator);
    const rows = urutkanPendaftar(ppdbData, sortOrder).map(d => [
      `"${d.namaLengkap}"`, `"'${d.nik}"`, `"'${d.nisn}"`, `"${d.jenisKelamin}"`, `"${d.tempatLahir}, ${d.tanggalLahir}"`, `"${hitungUmur(d.tanggalLahir)}"`,
      `"${d.alamatJalan}"`, `"${d.desaKelurahan}"`, `"${d.kecamatan}"`, `"'${d.noWaAyah}"`, `"'${d.noWaIbu}"`, `"${d.status}"`
    ].join(separator)).join("\n");
    const csvContent = "\ufeff" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PPDB_SDM_WONOSARI.csv`;
    link.click();
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        
        {/* HEADER */}
        <header style={s.header}>
          <div style={s.brand}>
            <div style={s.logoImg}>M</div>
            <div>
              <h1 style={s.title}>Panel Admin PPDB</h1>
              <p style={s.subtitle}>SD Muhammadiyah Wonosari • Manajemen Real-time</p>
            </div>
          </div>
          
          <div style={s.headerActions}>
            <div style={s.statusControl(isOpen)}>
              <span>Pendaftaran {isOpen ? 'DIBUKA' : 'DITUTUP'}</span>
              <button onClick={() => updatePPDBStatus(!isOpen)} style={s.toggleBtn(isOpen)}>
                <div style={s.toggleCircle(isOpen)} />
              </button>
            </div>
            <button onClick={handleSetKuota} style={s.btnKuota}>
              🎯 Kuota: {kuota > 0 ? `${totalPendaftar}/${kuota}` : 'Tanpa Batas'}
            </button>
            <button onClick={handleSyncCounter} style={s.btnSync} title="Hitung ulang total pendaftar dari data asli">
              🔄 Sinkronkan
            </button>
            <button onClick={exportToExcel} style={s.btnExport}>📊 Ekspor Excel</button>
          </div>
        </header>

        {/* STATS */}
        <section style={s.statsGrid}>
          <StatCard label="Total" val={stats.total} icon="👥" color="#4f46e5" />
          <StatCard label="Pending" val={stats.pending} icon="⏳" color="#f59e0b" />
          <StatCard label="Terverifikasi" val={stats.verified} icon="✅" color="#10b981" />
        </section>

        {/* MAIN DATA */}
        <div style={s.contentCard}>
          <div style={s.tableHeader}>
            <div style={s.searchGroup}>
              <input 
                placeholder="Cari Nama atau NIK..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={s.searchInput}
              />
              <select onChange={(e) => setFilterStatus(e.target.value)} style={s.filterSelect}>
                <option value="all">Semua Status</option>
                <option value="pending">🟡 Pending</option>
                <option value="terverifikasi">🟢 Terverifikasi</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={s.filterSelect}>
                <option value="terbaru">🕒 Urut: Pendaftar Terbaru</option>
                <option value="tertua">🎂 Umur: Tertua → Termuda</option>
                <option value="termuda">🎂 Umur: Termuda → Tertua</option>
              </select>
            </div>
          </div>

          <div style={s.tableScroll}>
            <table style={s.table}>
              <thead>
                <tr style={s.thRow}>
                  <th style={s.th}>SISWA</th>
                  <th style={s.th}>IDENTITAS</th>
                  <th style={s.th}>KONTAK ORTU</th>
                  <th style={s.th}>STATUS</th>
                  <th style={{...s.th, textAlign: 'right'}}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sortedData.map((item) => (
                    <motion.tr key={item.id} layout initial={{opacity:0}} animate={{opacity:1}} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.studentName}>{item.namaLengkap}</div>
                        <div style={s.studentSub}>{item.jenisKelamin} • {item.desaKelurahan}</div>
                        <div style={s.studentSub}>🎂 {hitungUmur(item.tanggalLahir)} • {item.tanggalLahir || '-'}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.nikBadge}>NIK: {item.nik}</div>
                        <div style={s.nisnText}>NISN: {item.nisn || '-'}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.waGroup}>
                          {item.noWaAyah && <a href={`https://wa.me/${item.noWaAyah}`} target="_blank" style={s.waAyah}>Ayah: {item.noWaAyah}</a>}
                          {item.noWaIbu && <a href={`https://wa.me/${item.noWaIbu}`} target="_blank" style={s.waIbu}>Ibu: {item.noWaIbu}</a>}
                        </div>
                      </td>
                      <td style={s.td}>
                        <select 
                          value={item.status} 
                          onChange={(e) => updateStatusPPDB(item.id, e.target.value)}
                          style={s.statusSelect(item.status)}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="terverifikasi">🟢 Verifikasi</option>
                          <option value="ditolak">🔴 Ditolak</option>
                        </select>
                      </td>
                      <td style={s.tdAction}>
                        <button onClick={() => setSelectedStudent(item)} style={s.btnDetail}>👁️ Detail</button>
                        <button onClick={() => handleDelete(item)} style={s.btnDel}>Hapus</button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL (SANGAT LENGKAP) --- */}
      <AnimatePresence>
        {selectedStudent && (
          <div style={s.modalOverlay} onClick={() => setSelectedStudent(null)}>
            <motion.div initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} style={s.modal} onClick={e => e.stopPropagation()}>
              <header style={s.modalHeader}>
                <div>
                  <h2 style={s.mTitle}>Detail Lengkap Calon Siswa</h2>
                  <p style={s.mSub}>Registrasi: {new Date(selectedStudent.createdAt?.seconds * 1000).toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} style={s.closeBtn}>✕</button>
              </header>

              <div style={s.modalScrollArea}>
                {/* I. DATA SISWA */}
                <div style={s.mSection}>
                  <h4 style={s.mSectionTitle}>I. Identitas Siswa</h4>
                  <div style={s.mGrid}>
                    <DetailBox label="Nama Lengkap" val={selectedStudent.namaLengkap} />
                    <DetailBox label="NIK" val={selectedStudent.nik} />
                    <DetailBox label="NISN" val={selectedStudent.nisn} />
                    <DetailBox label="Tempat, Tgl Lahir" val={`${selectedStudent.tempatLahir}, ${selectedStudent.tanggalLahir}`} />
                    <DetailBox label="Jenis Kelamin" val={selectedStudent.jenisKelamin} />
                    <DetailBox label="Agama" val={selectedStudent.agama} />
                    <DetailBox label="Anak Ke" val={`${selectedStudent.anakKe} dari ${selectedStudent.jumlahSaudara} bersaudara`} />
                    <DetailBox label="Hobi / Cita-cita" val={`${selectedStudent.hobi} / ${selectedStudent.citaCita}`} />
                  </div>
                </div>

                {/* II. ALAMAT */}
                <div style={s.mSection}>
                  <h4 style={s.mSectionTitle}>II. Alamat Domisili</h4>
                  <div style={s.mGrid}>
                    <div style={{gridColumn: 'span 2'}}><DetailBox label="Alamat Jalan" val={selectedStudent.alamatJalan} /></div>
                    <DetailBox label="RT / RW" val={`${selectedStudent.rt} / ${selectedStudent.rw}`} />
                    <DetailBox label="Desa / Kelurahan" val={selectedStudent.desaKelurahan} />
                    <DetailBox label="Kecamatan" val={selectedStudent.kecamatan} />
                    <DetailBox label="Kode Pos" val={selectedStudent.kodePos} />
                  </div>
                </div>

                {/* III. DATA ORANG TUA */}
                <div style={s.mSection}>
                  <h4 style={s.mSectionTitle}>III. Data Orang Tua Kandung</h4>
                  <div style={s.mGridSplit}>
                    <div style={s.mColumn}>
                       <p style={s.mColTitle}>Data Ayah</p>
                       <DetailBox label="Nama Ayah" val={selectedStudent.namaAyah} />
                       <DetailBox label="NIK Ayah" val={selectedStudent.nikAyah} />
                       <DetailBox label="Tempat, Tgl Lahir" val={`${selectedStudent.tempatLahirAyah || '-'}, ${selectedStudent.tanggalLahirAyah || '-'}`} />
                       <DetailBox label="Pendidikan" val={selectedStudent.pendidikanAyah} />
                       <DetailBox label="Pekerjaan" val={selectedStudent.pekerjaanAyah} />
                       <DetailBox label="Penghasilan" val={selectedStudent.penghasilanAyah} />
                       <DetailBox label="WhatsApp" val={selectedStudent.noWaAyah} />
                    </div>
                    <div style={s.mColumn}>
                       <p style={s.mColTitle}>Data Ibu</p>
                       <DetailBox label="Nama Ibu" val={selectedStudent.namaIbu} />
                       <DetailBox label="NIK Ibu" val={selectedStudent.nikIbu} />
                       <DetailBox label="Tempat, Tgl Lahir" val={`${selectedStudent.tempatLahirIbu || '-'}, ${selectedStudent.tanggalLahirIbu || '-'}`} />
                       <DetailBox label="Pendidikan" val={selectedStudent.pendidikanIbu} />
                       <DetailBox label="Pekerjaan" val={selectedStudent.pekerjaanIbu} />
                       <DetailBox label="Penghasilan" val={selectedStudent.penghasilanIbu} />
                       <DetailBox label="WhatsApp" val={selectedStudent.noWaIbu} />
                    </div>
                  </div>
                </div>

                {/* IV. DATA WALI */}
                {selectedStudent.namaWali && selectedStudent.namaWali !== "-" && (
                  <div style={s.mSection}>
                    <h4 style={s.mSectionTitle}>IV. Data Wali</h4>
                    <div style={s.mGrid}>
                      <DetailBox label="Nama Wali" val={selectedStudent.namaWali} />
                      <DetailBox label="Hubungan" val={selectedStudent.hubunganWali} />
                      <DetailBox label="NIK Wali" val={selectedStudent.nikWali} />
                      <DetailBox label="Tempat, Tgl Lahir" val={`${selectedStudent.tempatLahirWali || '-'}, ${selectedStudent.tanggalLahirWali || '-'}`} />
                      <DetailBox label="Pendidikan" val={selectedStudent.pendidikanWali} />
                      <DetailBox label="Pekerjaan" val={selectedStudent.pekerjaanWali} />
                      <DetailBox label="Penghasilan" val={selectedStudent.penghasilanWali} />
                    </div>
                  </div>
                )}

                {/* V. DOKUMEN */}
                <div style={s.mSection}>
                  <h4 style={s.mSectionTitle}>V. Dokumen Pendukung</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedStudent.kkUrl ? (
                      <a href={selectedStudent.kkUrl} target="_blank" rel="noopener noreferrer" style={s.docLink}>
                        📄 Lihat Kartu Keluarga
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dokumen KK belum diunggah.</span>
                    )}
                    {selectedStudent.aktaUrl ? (
                      <a href={selectedStudent.aktaUrl} target="_blank" rel="noopener noreferrer" style={s.docLink}>
                        📄 Lihat Akta Kelahiran
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dokumen Akta belum diunggah.</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={s.btnModalClose}>Tutup Detail</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-Komponen
const StatCard = ({label, val, icon, color}) => (
  <div style={{...s.card, borderTop: `5px solid ${color}`}}>
    <div style={s.cardIcon}>{icon}</div>
    <div style={{textAlign: 'right'}}>
      <p style={s.cardLabel}>{label}</p>
      <h3 style={s.cardVal}>{val}</h3>
    </div>
  </div>
);

const DetailBox = ({label, val}) => (
  <div style={s.detailBox}>
    <small style={s.detailLabel}>{label}</small>
    <div style={s.detailVal}>{val || '-'}</div>
  </div>
);

// --- STYLES ---
const s = {
  page: { background: '#f4f7fa', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'white', padding: '20px 30px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: '20px' },
  brand: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoImg: { background: '#1a5d1a', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' },
  subtitle: { margin: 0, fontSize: '0.8rem', color: '#64748b' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '20px' },
  statusControl: (open) => ({ display: 'flex', alignItems: 'center', gap: '12px', background: open ? '#f0fdf4' : '#fef2f2', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: open ? '#166534' : '#991b1b' }),
  toggleBtn: (open) => ({ width: '40px', height: '22px', background: open ? '#22c55e' : '#cbd5e1', borderRadius: '50px', border: 'none', position: 'relative', cursor: 'pointer' }),
  toggleCircle: (open) => ({ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: open ? '21px' : '3px', transition: '0.3s' }),
  btnExport: { background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnKuota: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' },
  btnSync: { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' },
  docLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
  card: { background: 'white', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  cardIcon: { fontSize: '2rem' },
  cardLabel: { margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' },
  cardVal: { margin: 0, fontSize: '2rem', fontWeight: '900', color: '#1e293b' },

  contentCard: { background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', overflow: 'hidden' },
  tableHeader: { marginBottom: '30px' },
  searchGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', padding: '12px 18px', borderRadius: '12px', border: '1px solid #f1f5f9', outline: 'none' },
  filterSelect: { padding: '10px 15px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white' },

  tableScroll: { width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' },
  thRow: { borderBottom: '2px solid #f8fafc', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '1px' },
  th: { padding: '15px 10px' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '20px 10px' },
  studentName: { fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' },
  studentSub: { fontSize: '0.75rem', color: '#94a3b8' },
  nikBadge: { background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', display: 'inline-block', marginBottom: '4px' },
  nisnText: { fontSize: '0.7rem', color: '#cbd5e1' },
  waGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  waAyah: { textDecoration: 'none', color: '#166534', fontWeight: '800', fontSize: '0.75rem' },
  waIbu: { textDecoration: 'none', color: '#d14d72', fontWeight: '800', fontSize: '0.75rem' },
  statusSelect: (st) => ({ 
    padding: '7px 12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.75rem',
    background: st === 'terverifikasi' ? '#dcfce7' : st === 'ditolak' ? '#fee2e2' : '#fef9c3',
    color: st === 'terverifikasi' ? '#166534' : st === 'ditolak' ? '#991b1b' : '#854d0e'
  }),
  tdAction: { textAlign: 'right', whiteSpace: 'nowrap', display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '20px 10px' },
  btnDetail: { background: '#f1f5f9', color: '#1e293b', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnDel: { background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' },

  // MODAL STYLES
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' },
  modal: { background: 'white', width: '100%', maxWidth: '900px', borderRadius: '30px', padding: '40px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', flexShrink: 0 },
  mTitle: { margin: 0, color: '#1e293b', fontSize: '1.4rem', fontWeight: '900' },
  mSub: { margin: 0, color: '#94a3b8', fontSize: '0.75rem' },
  closeBtn: { background: '#f1f5f9', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' },
  
  modalScrollArea: { overflowY: 'auto', flex: 1, paddingRight: '10px' },
  mSection: { marginBottom: '35px' },
  mSectionTitle: { fontSize: '0.8rem', color: '#1a5d1a', letterSpacing: '1.5px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', borderLeft: '4px solid #1a5d1a', paddingLeft: '10px' },
  mGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  mGridSplit: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  mColumn: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mColTitle: { fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '5px', background: '#f8fafc', padding: '5px 10px', borderRadius: '6px' },
  
  detailBox: { background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #f1f5f9' },
  detailLabel: { display: 'block', color: '#94a3b8', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '5px' },
  detailVal: { color: '#1e293b', fontWeight: '700', fontSize: '0.9rem' },
  btnModalClose: { width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', flexShrink: 0 }
};