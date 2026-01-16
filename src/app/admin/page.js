"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'; // Tambah updateDoc
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const [pendaftar, setPendaftar] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null); 
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "ppdb_registrations"), orderBy("tanggal_daftar", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendaftar(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI GANTI STATUS
  const gantiStatus = async (id, statusLama) => {
    const { value: statusBaru } = await Swal.fire({
      title: 'Ubah Status Pendaftaran',
      input: 'select',
      inputOptions: {
        'menunggu_berkas': 'Menunggu Berkas',
        'diterima': 'Diterima',
        'cadangan': 'Cadangan',
        'ditolak': 'Ditolak/Batal'
      },
      inputValue: statusLama,
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a',
      confirmButtonText: 'Simpan Perubahan'
    });

    if (statusBaru) {
      try {
        const docRef = doc(db, "ppdb_registrations", id);
        await updateDoc(docRef, { status: statusBaru });
        fetchData(); // Refresh data
        Swal.fire('Berhasil!', `Status diperbarui menjadi ${statusBaru.replace('_', ' ')}`, 'success');
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat update status.', 'error');
      }
    }
  };

  const handleExportExcel = () => {
    if (pendaftar.length === 0) return Swal.fire("Data Kosong", "", "warning");
    const dataExcel = pendaftar.map((item, index) => ({
      "No": index + 1,
      "Nama": item.nama_lengkap,
      "NIK": item.nik,
      "Status": item.status?.replace('_', ' ').toUpperCase() || 'MENUNGGU',
      "WA": item.no_wa
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_PPDB");
    XLSX.writeFile(workbook, `PPDB_SDM_Wonosari_${new Date().toLocaleDateString('id-ID')}.xlsx`);
  };

  const hapusData = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan hilang permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a',
      confirmButtonText: 'Ya, Hapus'
    });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "ppdb_registrations", id));
      fetchData();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setAuthorized(true); fetchData(); } 
      else { router.replace('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

  const filteredData = pendaftar.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || item.nik?.includes(searchTerm)
  );

  if (!authorized) return null;

  return (
    <div className="adm-wrapper">
      {/* MODAL DETAIL SISWA */}
      {selectedSiswa && (
        <div className="modal-overlay" onClick={() => setSelectedSiswa(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Biodata Siswa</h3>
              <button className="close-btn" onClick={() => setSelectedSiswa(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-item"><span>Nama Lengkap:</span> <p>{selectedSiswa.nama_lengkap}</p></div>
              <div className="detail-item"><span>Status:</span> <p className={`badge-${selectedSiswa.status}`}>{selectedSiswa.status?.replace('_', ' ')}</p></div>
              <div className="detail-item"><span>NIK:</span> <p>{selectedSiswa.nik}</p></div>
              <div className="detail-item"><span>TTL:</span> <p>{selectedSiswa.tempat_lahir}, {selectedSiswa.tanggal_lahir}</p></div>
              <div className="detail-item"><span>Alamat:</span> <p>{selectedSiswa.alamat_lengkap}, {selectedSiswa.dusun}, {selectedSiswa.desa_kelurahan}</p></div>
              <div className="detail-item"><span>WA Wali:</span> <p>{selectedSiswa.no_wa}</p></div>
            </div>
          </div>
        </div>
      )}

      <nav className="adm-nav">
        <div className="adm-nav-brand">
          <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={40} height={40} />
          <h1>Admin PPDB</h1>
        </div>
        <button onClick={handleExportExcel} className="adm-btn-excel"><i className="fas fa-file-excel"></i> Export Excel</button>
      </nav>

      <main className="adm-main">
        <div className="adm-welcome">
          <h2>Halo, Admin 👋</h2>
          <p>Manajemen data calon siswa baru SD Muhammadiyah Wonosari.</p>
        </div>

        <div className="adm-stats-card">
          <span>Total Pendaftar</span>
          <h3>{pendaftar.length} Siswa</h3>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-header">
            <h3>Daftar Pendaftar</h3>
            <input type="text" placeholder="Cari Nama/NIK..." className="adm-search" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="adm-table-res">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Status</th>
                  <th style={{textAlign: 'center'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{textAlign: 'center'}}>Memuat data...</td></tr>
                ) : filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                        <div style={{fontWeight: 'bold'}}>{item.nama_lengkap}</div>
                        <div style={{fontSize: '0.8rem', color: '#64748b'}}>{item.nik}</div>
                    </td>
                    <td>
                        <span 
                            className={`status-badge badge-${item.status || 'menunggu_berkas'}`}
                            onClick={() => gantiStatus(item.id, item.status)}
                            style={{cursor: 'pointer'}}
                            title="Klik untuk ubah status"
                        >
                            {item.status?.replace('_', ' ') || 'menunggu berkas'}
                        </span>
                    </td>
                    <td style={{textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center'}}>
                      <button onClick={() => setSelectedSiswa(item)} className="adm-btn-view" title="Lihat Detail"><i className="fas fa-eye"></i></button>
                      <button onClick={() => hapusData(item.id)} className="adm-btn-del" title="Hapus"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}