"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const [pendaftar, setPendaftar] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
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

  const filteredData = pendaftar.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nik?.includes(searchTerm)
  );

  const hapusData = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan hilang permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a5d1a',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "ppdb_registrations", id));
      fetchData();
      Swal.fire('Terhapus!', '', 'success');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthorized(true);
        fetchData();
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  if (!authorized) {
  return (
    <div className="adm-body" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
       <div style={{textAlign: 'center'}}>
          <p style={{color: '#666', fontWeight: 'bold'}}>Memverifikasi Keamanan...</p>
       </div>
    </div>
  );
}

  if (!authorized) return null;

  return (
    <div className="adm-wrapper">
      <nav className="adm-nav">
        <div className="adm-nav-brand">
          <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={45} height={45} />
          <div>
            <h1>PPDB Portal</h1>
            <p style={{fontSize: '0.7rem', color: '#94a3b8', margin: 0}}>Admin SDM Wonosari</p>
          </div>
        </div>
        <button onClick={() => { signOut(auth); router.push('/logout'); }} className="adm-btn-logout">
          Keluar <i className="fas fa-sign-out-alt"></i>
        </button>
      </nav>

      <main className="adm-main">
        <div className="adm-welcome">
          <h2>Halo, Admin 👋</h2>
          <p>Manajemen data calon siswa baru SD Muhammadiyah Wonosari.</p>
        </div>

        <div className="adm-stats-card">
          <span>Total Pendaftar</span>
          <h3>{filteredData.length}</h3>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-header">
            <h3 style={{margin: 0, fontWeight: 800}}>Daftar Calon Siswa</h3>
            <input 
              type="text" 
              placeholder="Cari Nama / NIK..." 
              className="adm-search"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="adm-table-res">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>NIK</th>
                  <th>WA</th>
                  <th style={{textAlign: 'center'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Memuat data...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Data tidak ditemukan.</td></tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{color: '#cbd5e1'}}>{index + 1}</td>
                      <td>
                        <div style={{fontWeight: 700, textTransform: 'uppercase'}}>{item.nama_lengkap}</div>
                        <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>{item.tanggal_daftar?.seconds ? item.tanggal_daftar.toDate().toLocaleDateString('id-ID') : '-'}</div>
                      </td>
                      <td style={{fontFamily: 'monospace'}}>{item.nik}</td>
                      <td>
                        <a href={`https://wa.me/${item.no_wa?.replace(/^0/, '62')}`} target="_blank" className="adm-btn-wa">
                          <i className="fab fa-whatsapp"></i> {item.no_wa}
                        </a>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <button onClick={() => hapusData(item.id)} className="adm-btn-del">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}