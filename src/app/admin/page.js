// src/app/admin/page.js
"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import Swal from 'sweetalert2';

// --- IMPORT UNTUK GRAFIK ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrasi Komponen Grafik
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // Untuk Modal Detail

  // 1. CEK STATUS LOGIN & AMBIL DATA
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ambil Data Realtime jika sudah login
        const q = query(collection(db, "pendaftar"), orderBy("timestamp", "desc"));
        const unsubData = onSnapshot(q, (snapshot) => {
          const students = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(students);
        });
        return () => unsubData();
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. PERSIAPAN DATA GRAFIK
  const countAccepted = data.filter(x => x.status === 'Diterima').length;
  const countRejected = data.filter(x => x.status === 'Ditolak').length;
  const countPending = data.filter(x => x.status === 'Menunggu').length;

  const chartData = {
    labels: ['Diterima', 'Ditolak', 'Menunggu'],
    datasets: [
      {
        data: [countAccepted, countRejected, countPending],
        backgroundColor: [
          '#10b981', // Hijau (Diterima)
          '#ef4444', // Merah (Ditolak)
          '#f59e0b', // Kuning (Menunggu)
        ],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    plugins: {
        legend: { position: 'bottom' } // Posisi label di bawah
    }
  };

  // 3. FUNGSI LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({ icon: 'success', title: 'Login Berhasil', timer: 1000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Login', text: 'Email atau Password salah' });
    }
  };

  // 4. FUNGSI LOGOUT
  const handleLogout = () => {
    signOut(auth);
  };

  // 5. UPDATE STATUS
  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "pendaftar", id), { status: newStatus });
      Swal.fire('Sukses', `Status diubah jadi ${newStatus}`, 'success');
      setSelectedStudent(null);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // 6. HAPUS DATA
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin hapus?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus'
    });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "pendaftar", id));
      Swal.fire('Terhapus!', 'Data siswa telah dihapus.', 'success');
    }
  };

  // --- TAMPILAN LOGIN (JIKA BELUM MASUK) ---
  if (!user) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a5d1a'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
          <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={80} height={80} style={{marginBottom: '20px'}} />
          <h2 style={{color: '#1a5d1a', marginBottom: '10px'}}>Admin PPDB</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>Silakan login untuk mengelola data.</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email Admin" value={email} onChange={e=>setEmail(e.target.value)} required 
              style={{width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px'}} />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required 
              style={{width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px'}} />
            <button type="submit" style={{width: '100%', padding: '12px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
              MASUK DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <div style={{paddingTop: '100px', minHeight: '100vh', background: '#f1f5f9', paddingBottom: '50px', fontFamily: 'var(--font-poppins)'}}>
      <div className="container">
        
        {/* HEADER */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div>
            <h1 style={{fontSize: '1.8rem', color: '#1e293b', marginBottom: '5px'}}>Dashboard PPDB</h1>
            <p style={{color: '#64748b'}}>Selamat datang, Admin Sekolah.</p>
          </div>
          <button onClick={handleLogout} style={{background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <i className="fas fa-sign-out-alt"></i> Keluar
          </button>
        </div>

        {/* SECTION 1: STATISTIK ANGKA */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div className="stat-card" style={{background: 'white', padding: '25px', borderRadius: '12px', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontSize: '2.5rem', color: '#3b82f6', margin: 0}}>{data.length}</h3> 
                <p style={{margin:0, color: '#64748b', fontWeight: '600'}}>Total Pendaftar</p>
            </div>
            <div className="stat-card" style={{background: 'white', padding: '25px', borderRadius: '12px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontSize: '2.5rem', color: '#10b981', margin: 0}}>{countAccepted}</h3> 
                <p style={{margin:0, color: '#64748b', fontWeight: '600'}}>Siswa Diterima</p>
            </div>
            <div className="stat-card" style={{background: 'white', padding: '25px', borderRadius: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                <h3 style={{fontSize: '2.5rem', color: '#f59e0b', margin: 0}}>{countPending}</h3> 
                <p style={{margin:0, color: '#64748b', fontWeight: '600'}}>Menunggu Verifikasi</p>
            </div>
        </div>

        {/* SECTION 2: GRAFIK & PANEL INFO (UPGRADE BARU) */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px'}}>
            
            {/* GRAFIK LINGKARAN */}
            <div style={{background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', alignItems:'center'}}>
                <h3 style={{marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', width: '100%', textAlign: 'center'}}>
                    <i className="fas fa-chart-pie" style={{marginRight: '10px', color: '#1a5d1a'}}></i> 
                    Statistik Kelulusan
                </h3>
                <div style={{width: '280px', height: '280px', position: 'relative'}}>
                    {data.length > 0 ? (
                        <Doughnut data={chartData} options={chartOptions} />
                    ) : (
                        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc'}}>Belum ada data masuk</div>
                    )}
                </div>
            </div>

            {/* PANEL INFO CEPAT */}
            <div style={{
                background: 'linear-gradient(135deg, #1a5d1a, #14532d)', 
                padding: '30px', borderRadius: '12px', color: 'white', 
                display:'flex', flexDirection:'column', justifyContent:'center',
                boxShadow: '0 10px 30px rgba(26, 93, 26, 0.2)'
            }}>
                <h3 style={{marginBottom: '10px', fontSize: '1.5rem'}}><i className="fas fa-crown"></i> Halo, Admin!</h3>
                <p style={{marginBottom: '25px', opacity: 0.9, lineHeight: '1.6'}}>
                    Pantau terus data pendaftaran siswa baru. Pastikan untuk selalu memeriksa kelengkapan berkas (KK, Akta, Foto) sebelum memutuskan untuk menerima siswa.
                </p>
                <div style={{background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '10px', backdropFilter: 'blur(5px)'}}>
                    <strong style={{display: 'block', marginBottom: '10px', color: '#fbbf24'}}><i className="fas fa-lightbulb"></i> Tips Admin:</strong>
                    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
                        <li style={{marginBottom: '5px'}}>Klik tombol <strong>Mata (👁️)</strong> untuk melihat detail & berkas.</li>
                        <li>Klik <strong>Download Excel</strong> jika butuh laporan fisik (Segera Hadir).</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* SECTION 3: TABEL DATA */}
        <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
            <div style={{padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{margin: 0, color: '#1e293b'}}>Data Pendaftar Terbaru</h3>
                <span style={{background: '#f1f5f9', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', color: '#64748b'}}>Total: {data.length} Siswa</span>
            </div>
            
            <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                        <tr>
                            <th style={{padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.9rem'}}>Nama Siswa</th>
                            <th style={{padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.9rem'}}>Asal Sekolah</th>
                            <th style={{padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.9rem'}}>Tgl Daftar</th>
                            <th style={{padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.9rem'}}>Status</th>
                            <th style={{padding: '15px', textAlign: 'center', color: '#475569', fontSize: '0.9rem'}}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan="5" style={{padding: '30px', textAlign: 'center', color: '#94a3b8'}}>Belum ada data pendaftaran masuk.</td></tr>
                        ) : (
                            data.map(student => (
                                <tr key={student.id} style={{borderBottom: '1px solid #f1f5f9', transition: '0.2s'}} onMouseOver={e => e.currentTarget.style.background = '#fcfcfc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                    <td style={{padding: '15px'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{width: '35px', height: '35px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b'}}>
                                                {student.nama_lengkap.charAt(0)}
                                            </div>
                                            <div>
                                                <strong style={{display: 'block', color: '#1e293b'}}>{student.nama_lengkap}</strong>
                                                <small style={{color:'#64748b'}}>{student.jenis_kelamin}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding: '15px', color: '#334155'}}>{student.asal_sekolah}</td>
                                    <td style={{padding: '15px', color: '#64748b', fontSize: '0.9rem'}}>
                                        {student.timestamp ? new Date(student.timestamp.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td style={{padding: '15px'}}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                                            background: student.status === 'Diterima' ? '#dcfce7' : (student.status === 'Ditolak' ? '#fee2e2' : '#fef9c3'),
                                            color: student.status === 'Diterima' ? '#166534' : (student.status === 'Ditolak' ? '#991b1b' : '#854d0e')
                                        }}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                                            <button onClick={() => setSelectedStudent(student)} title="Lihat Detail" style={{background: '#3b82f6', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button onClick={() => handleDelete(student.id)} title="Hapus Data" style={{background: '#ef4444', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL DETAIL SISWA (POPUP) */}
        {selectedStudent && (
            <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)'}}>
                <div style={{background: 'white', padding: '0', borderRadius: '16px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'}}>
                    
                    {/* Header Modal */}
                    <div style={{padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0'}}>
                        <h2 style={{margin: 0, color: '#1e293b', fontSize: '1.25rem'}}>Biodata Siswa</h2>
                        <button onClick={() => setSelectedStudent(null)} style={{background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#94a3b8', lineHeight: '1'}}>&times;</button>
                    </div>
                    
                    {/* Isi Modal */}
                    <div style={{padding: '30px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px'}}>
                            <div>
                                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600'}}>Nama Lengkap</label>
                                <div style={{fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b'}}>{selectedStudent.nama_lengkap}</div>
                            </div>
                            <div>
                                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600'}}>Jenis Kelamin</label>
                                <div style={{fontSize: '1rem', color: '#1e293b'}}>{selectedStudent.jenis_kelamin}</div>
                            </div>
                            <div>
                                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600'}}>Tempat, Tgl Lahir</label>
                                <div style={{fontSize: '1rem', color: '#1e293b'}}>{selectedStudent.tempat_lahir}, {selectedStudent.tanggal_lahir}</div>
                            </div>
                            <div>
                                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600'}}>Asal Sekolah</label>
                                <div style={{fontSize: '1rem', color: '#1e293b'}}>{selectedStudent.asal_sekolah}</div>
                            </div>
                        </div>

                        <div style={{background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #e2e8f0'}}>
                            <h4 style={{margin: '0 0 15px 0', color: '#1a5d1a', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px'}}>Data Orang Tua</h4>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                                <div><small style={{color: '#64748b'}}>Nama Ayah</small><br/><strong>{selectedStudent.nama_ayah}</strong></div>
                                <div><small style={{color: '#64748b'}}>Pekerjaan</small><br/>{selectedStudent.pekerjaan_ayah}</div>
                                <div><small style={{color: '#64748b'}}>Nama Ibu</small><br/><strong>{selectedStudent.nama_ibu}</strong></div>
                                <div><small style={{color: '#64748b'}}>Pekerjaan</small><br/>{selectedStudent.pekerjaan_ibu}</div>
                                <div style={{gridColumn: 'span 2', marginTop: '5px'}}><small style={{color: '#64748b'}}>No. WhatsApp</small><br/><strong style={{fontSize: '1.1rem', color: '#1a5d1a'}}>{selectedStudent.no_telepon_ortu}</strong></div>
                            </div>
                        </div>

                        <div style={{marginBottom: '30px'}}>
                            <h4 style={{margin: '0 0 15px 0', color: '#475569'}}>Berkas Lampiran</h4>
                            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                                <a href={selectedStudent.link_foto} target="_blank" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', textDecoration: 'none', border: '1px solid #bfdbfe', fontSize: '0.9rem', fontWeight: '600'}}>
                                    <i className="fas fa-image"></i> Pas Foto
                                </a>
                                <a href={selectedStudent.link_kk} target="_blank" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', textDecoration: 'none', border: '1px solid #bfdbfe', fontSize: '0.9rem', fontWeight: '600'}}>
                                    <i className="fas fa-file-alt"></i> Kartu Keluarga
                                </a>
                                <a href={selectedStudent.link_akta} target="_blank" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', textDecoration: 'none', border: '1px solid #bfdbfe', fontSize: '0.9rem', fontWeight: '600'}}>
                                    <i className="fas fa-file-contract"></i> Akta Kelahiran
                                </a>
                            </div>
                        </div>

                        {/* Footer Modal: Tombol Aksi */}
                        <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px'}}>
                            <button onClick={() => updateStatus(selectedStudent.id, 'Diterima')} style={{background: '#10b981', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <i className="fas fa-check"></i> Terima Siswa
                            </button>
                            <button onClick={() => updateStatus(selectedStudent.id, 'Ditolak')} style={{background: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <i className="fas fa-times"></i> Tolak
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}