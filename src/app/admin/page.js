"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Mengubah nama import agar tidak bentrok
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      console.error("Error Fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI CETAK PDF DENGAN PERBAIKAN CONSTRUCTOR
  const generatePDF = (siswa) => {
    const doc = new jsPDF();
    const logoUrl = '/images/logo sdm woonsa.jpg'; 

    // PERBAIKAN UTAMA: Menggunakan window.Image() untuk menghindari bentrok
    const img = new window.Image(); 
    img.src = logoUrl;

    img.onload = () => {
      // Kop Surat
      doc.addImage(img, 'JPEG', 15, 8, 22, 22);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("MAJELIS PENDIDIKAN DASAR DAN MENENGAH", 115, 15, { align: "center" });
      doc.setFontSize(16);
      doc.text("SD MUHAMMADIYAH WONOSARI", 115, 23, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Jl. Sumber Agung, Tawarsari, Wonosari, Gunungkidul, DIY", 115, 29, { align: "center" });
      doc.line(15, 35, 195, 35);

      // Judul Bukti
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BUKTI PENDAFTARAN PESERTA DIDIK BARU", 105, 45, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Tahun Pelajaran: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, 105, 51, { align: "center" });

      // Tabel Data
      autoTable(doc, {
        startY: 58,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 50 } },
        body: [
          ['No. Pendaftaran', `: PPDB-${siswa.id.substring(0, 5).toUpperCase()}`],
          ['Tanggal Daftar', `: ${siswa.tanggal_daftar?.seconds ? siswa.tanggal_daftar.toDate().toLocaleDateString('id-ID') : '-'}`],
          ['Status', `: ${siswa.status?.replace('_', ' ').toUpperCase() || 'MENUNGGU BERKAS'}`],
          ['', ''],
          ['NAMA LENGKAP', `: ${siswa.nama_lengkap?.toUpperCase()}`],
          ['NIK', `: ${siswa.nik}`],
          ['Tempat, Tgl Lahir', `: ${siswa.tempat_lahir}, ${siswa.tanggal_lahir}`],
          ['Jenis Kelamin', `: ${siswa.jenis_kelamin}`],
          ['Alamat Lengkap', `: ${siswa.alamat_lengkap || ''}, ${siswa.dusun || ''}, RT/RW ${siswa.rt_rw || ''}`],
          ['Desa/Kecamatan', `: ${siswa.desa_kelurahan || ''}, ${siswa.kecamatan || ''}`],
          ['', ''],
          ['Nama Ayah', `: ${siswa.nama_ayah || '-'}`],
          ['Nama Ibu', `: ${siswa.nama_ibu || '-'}`],
          ['No. WhatsApp', `: ${siswa.no_wa}`],
        ],
      });

      // Tanda Tangan
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "normal");
      doc.text("Wonosari, " + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 140, finalY);
      doc.text("Panitia PPDB,", 140, finalY + 7);
      doc.text("( ____________________ )", 140, finalY + 30);

      doc.save(`Bukti_PPDB_${siswa.nama_lengkap.replace(/\s+/g, '_')}.pdf`);
      Swal.fire("Berhasil!", "Bukti PDF telah diunduh.", "success");
    };

    img.onerror = () => {
      Swal.fire("Peringatan", "Logo tidak ditemukan atau gagal dimuat.", "warning");
    };
  };

  const gantiStatus = async (id, statusLama) => {
    const { value: statusBaru } = await Swal.fire({
      title: 'Ubah Status',
      input: 'select',
      inputOptions: {
        'menunggu_berkas': 'Menunggu Berkas',
        'diterima': 'Diterima',
        'cadangan': 'Cadangan',
        'ditolak': 'Ditolak/Batal'
      },
      inputValue: statusLama || 'menunggu_berkas',
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a'
    });
    if (statusBaru) {
      await updateDoc(doc(db, "ppdb_registrations", id), { status: statusBaru });
      fetchData();
    }
  };

  const handleExportExcel = () => {
    const dataExcel = pendaftar.map((item, index) => ({ "No": index + 1, "Nama": item.nama_lengkap, "NIK": item.nik, "Status": item.status }));
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_PPDB");
    XLSX.writeFile(workbook, `Rekap_PPDB_${new Date().toLocaleDateString('id-ID')}.xlsx`);
  };

  const hapusData = async (id) => {
    const result = await Swal.fire({ title: 'Hapus Data?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#1a5d1a' });
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
      {/* MODAL DETAIL */}
      {selectedSiswa && (
        <div className="modal-overlay" onClick={() => setSelectedSiswa(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Pendaftar</h3>
              <button className="close-btn" onClick={() => setSelectedSiswa(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-item"><span>Nama:</span> <p>{selectedSiswa.nama_lengkap}</p></div>
              <div className="detail-item"><span>Status:</span> <p className={`status-badge badge-${selectedSiswa.status || 'menunggu_berkas'}`}>{selectedSiswa.status || 'menunggu berkas'}</p></div>
              <button onClick={() => generatePDF(selectedSiswa)} style={{width: '100%', marginTop: '20px', padding: '12px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                <i className="fas fa-print"></i> Cetak Bukti Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="adm-nav">
        <div className="adm-nav-brand">
          <NextImage src="/images/logo sdm woonsa.jpg" alt="Logo" width={40} height={40} />
          <h1>Admin Portal</h1>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={handleExportExcel} className="adm-btn-excel"><i className="fas fa-file-excel"></i> Export Excel</button>
          <button onClick={() => signOut(auth)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer'}}>Keluar</button>
        </div>
      </nav>

      <main className="adm-main">
        <div className="adm-welcome">
          <h2>Dashboard PPDB SDM Wonosari</h2>
          <p>Total Pendaftar: <strong>{pendaftar.length} Siswa</strong></p>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-header">
            <input type="text" placeholder="Cari Nama/NIK..." className="adm-search" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="adm-table-res">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>Status</th>
                  <th style={{textAlign: 'center'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px'}}>Memuat...</td></tr>
                ) : filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama_lengkap}</td>
                    <td>
                      <span className={`status-badge badge-${item.status || 'menunggu_berkas'}`} onClick={() => gantiStatus(item.id, item.status)} style={{cursor: 'pointer'}}>
                        {item.status?.replace('_', ' ') || 'menunggu berkas'}
                      </span>
                    </td>
                    <td style={{textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center'}}>
                      <button onClick={() => setSelectedSiswa(item)} className="adm-btn-view"><i className="fas fa-eye"></i></button>
                      <button onClick={() => generatePDF(item)} style={{background: '#64748b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer'}} title="Cetak PDF"><i className="fas fa-print"></i></button>
                      <button onClick={() => hapusData(item.id)} className="adm-btn-del"><i className="fas fa-trash"></i></button>
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