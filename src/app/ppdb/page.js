// src/app/ppdb/page.js
"use client";

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

export default function PPDB() {
  // --- PENGATURAN SAKLAR PENDAFTARAN ---
  // Ganti 'false' menjadi 'true' jika ingin membuka pendaftaran
  const isRegistrationOpen = false; 

  const [loadingStatus, setLoadingStatus] = useState(null);
  const router = useRouter();

  // --- OPSI KOMPRESI GAMBAR ---
  const compressionOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  // Fungsi Kompres
  const compressImage = async (file) => {
    if (!file) return null;
    if (file.type === 'application/pdf') return file; 
    try {
      return await imageCompression(file, compressionOptions);
    } catch (error) {
      console.error("Gagal kompres:", error);
      return file;
    }
  };

  // Fungsi Upload Firebase
  const uploadFile = async (file, folderName, fileName) => {
    if (!file) return null;
    try {
      const storageRef = ref(storage, `${folderName}/${fileName}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error upload:", error);
      throw new Error("Gagal upload file");
    }
  };

  // Fungsi Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    let fileFoto = form.file_foto.files[0];
    let fileKK = form.file_kk.files[0];
    let fileAkta = form.file_akta.files[0];

    try {
        const namaSiswa = form.nama_lengkap.value;
        const cleanName = namaSiswa.replace(/[^a-zA-Z0-9]/g, '_');

        setLoadingStatus('compress'); 
        
        const compressedFiles = await Promise.all([
            compressImage(fileFoto),
            compressImage(fileKK),
            compressImage(fileAkta)
        ]);
        
        [fileFoto, fileKK, fileAkta] = compressedFiles;

        setLoadingStatus('upload');
        
        const uploadPromises = [
            uploadFile(fileFoto, 'foto_siswa', cleanName),
            uploadFile(fileKK, 'berkas_kk', cleanName),
            uploadFile(fileAkta, 'berkas_akta', cleanName)
        ];

        const [urlFoto, urlKK, urlAkta] = await Promise.all(uploadPromises);

        setLoadingStatus('save');
        
        await addDoc(collection(db, "pendaftar"), {
            nama_lengkap: namaSiswa,
            tempat_lahir: form.tempat_lahir.value,
            tanggal_lahir: form.tanggal_lahir.value,
            jenis_kelamin: form.jenis_kelamin.value,
            agama: form.agama.value,
            no_telepon: form.no_telepon.value,
            alamat: form.alamat.value,
            asal_sekolah: form.asal_sekolah.value,
            
            nama_ayah: form.nama_ayah.value,
            pekerjaan_ayah: form.pekerjaan_ayah.value,
            nama_ibu: form.nama_ibu.value,
            pekerjaan_ibu: form.pekerjaan_ibu.value,
            no_telepon_ortu: form.no_telepon_ortu.value,

            link_foto: urlFoto,
            link_kk: urlKK,
            link_akta: urlAkta,
            
            status: "Menunggu",
            timestamp: serverTimestamp()
        });

        Swal.fire({
            icon: 'success',
            title: 'Terkirim!',
            text: 'Data pendaftaran berhasil disimpan.',
            confirmButtonColor: '#1a5d1a',
            timer: 2000
        }).then(() => {
            router.push('/cek-status');
        });

    } catch (error) {
        console.error(error);
        Swal.fire('Gagal', 'Terjadi kesalahan jaringan.', 'error');
    } finally {
        setLoadingStatus(null);
    }
  };

  const getButtonText = () => {
    switch(loadingStatus) {
        case 'compress': return <span><i className="fas fa-cog fa-spin"></i> Mengompres Foto...</span>;
        case 'upload': return <span><i className="fas fa-cloud-upload-alt fa-bounce"></i> Mengupload Berkas...</span>;
        case 'save': return <span><i className="fas fa-save fa-pulse"></i> Menyimpan Data...</span>;
        default: return <span><i className="fas fa-paper-plane"></i> Kirim Pendaftaran</span>;
    }
  };

  // --- TAMPILAN JIKA PENDAFTARAN DITUTUP ---
  if (!isRegistrationOpen) {
    return (
      <section className="hero-section" style={{minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="container" style={{textAlign: 'center', color: 'white'}}>
          <div style={{
              background: 'rgba(0,0,0,0.7)', 
              padding: '50px', 
              borderRadius: '20px', 
              backdropFilter: 'blur(10px)',
              maxWidth: '600px',
              margin: '0 auto',
              border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>🚫</div>
            <h1 style={{fontSize: '2.5rem', marginBottom: '15px', fontWeight: 'bold'}}>Pendaftaran Ditutup</h1>
            <p style={{fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6'}}>
              Mohon maaf, pendaftaran siswa baru saat ini belum dibuka atau kuota sudah terpenuhi. 
              <br/>Silakan pantau terus website kami untuk informasi jadwal gelombang berikutnya.
            </p>
            <Link href="/" style={{
                background: '#1a5d1a', 
                color: 'white', 
                padding: '15px 35px', 
                borderRadius: '50px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: '0.3s',
                display: 'inline-block'
            }}>
                <i className="fas fa-arrow-left"></i> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // --- TAMPILAN FORMULIR (JIKA DIBUKA) ---
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Formulir Pendaftaran</h1>
            <p className="school-tagline">Tahun Ajaran 2025/2026</p>
          </div>
        </div>
      </section>

      <section className="programs-section">
        <div className="container">
            <div style={{background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
                
                <h2 className="section-title" style={{textAlign: 'left', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                    Isi Data Diri
                </h2>

                <form onSubmit={handleSubmit} style={{display: 'grid', gap: '25px'}}>
                    
                    {/* BAGIAN 1: DATA SISWA */}
                    <div>
                        <h3 style={{color: '#1a5d1a', marginBottom: '15px'}}><i className="fas fa-user-graduate"></i> Data Siswa</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                            <div>
                                <label style={{fontWeight:'600'}}>Nama Lengkap *</label>
                                <input name="nama_lengkap" type="text" required className="input-field" placeholder="Sesuai Akta" 
                                    style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Tempat Lahir *</label>
                                <input name="tempat_lahir" type="text" required className="input-field"
                                    style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Tanggal Lahir *</label>
                                <input name="tanggal_lahir" type="date" required className="input-field"
                                    style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Jenis Kelamin *</label>
                                <select name="jenis_kelamin" required className="input-field" style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}}>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Agama *</label>
                                <select name="agama" required className="input-field" style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}}>
                                    <option value="Islam">Islam</option>
                                </select>
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>No. Telepon (WA) *</label>
                                <input name="no_telepon" type="tel" required className="input-field" placeholder="08xxxxx"
                                    style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                        </div>
                        <div style={{marginTop: '20px'}}>
                             <label style={{fontWeight:'600'}}>Alamat Lengkap *</label>
                             <textarea name="alamat" rows="3" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}}></textarea>
                        </div>
                        <div style={{marginTop: '20px'}}>
                             <label style={{fontWeight:'600'}}>Asal Sekolah (TK/RA) *</label>
                             <input name="asal_sekolah" type="text" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                        </div>
                    </div>

                    {/* BAGIAN 2: DATA ORTU */}
                    <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #ddd'}}>
                        <h3 style={{color: '#1a5d1a', marginBottom: '15px'}}><i className="fas fa-users"></i> Data Orang Tua</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                            <div>
                                <label style={{fontWeight:'600'}}>Nama Ayah *</label>
                                <input name="nama_ayah" type="text" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Pekerjaan Ayah *</label>
                                <input name="pekerjaan_ayah" type="text" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Nama Ibu *</label>
                                <input name="nama_ibu" type="text" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>Pekerjaan Ibu *</label>
                                <input name="pekerjaan_ibu" type="text" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                            <div>
                                <label style={{fontWeight:'600'}}>No. HP Ortu *</label>
                                <input name="no_telepon_ortu" type="tel" required style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginTop:'5px'}} />
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN 3: UPLOAD */}
                    <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #ddd'}}>
                        <h3 style={{color: '#1a5d1a', marginBottom: '15px'}}><i className="fas fa-file-upload"></i> Upload Berkas</h3>
                        <div style={{background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe', color: '#1e3a8a'}}>
                           <i className="fas fa-info-circle"></i> File otomatis dikompres agar upload lebih cepat.
                        </div>
                        
                        <div style={{marginBottom: '15px'}}>
                            <label style={{fontWeight:'600', display:'block', marginBottom:'5px'}}>1. Pas Foto Siswa (3x4) *</label>
                            <input name="file_foto" type="file" required accept="image/*" />
                        </div>
                        <div style={{marginBottom: '15px'}}>
                            <label style={{fontWeight:'600', display:'block', marginBottom:'5px'}}>2. Scan Kartu Keluarga (KK) *</label>
                            <input name="file_kk" type="file" required accept=".pdf,image/*" />
                        </div>
                        <div style={{marginBottom: '15px'}}>
                            <label style={{fontWeight:'600', display:'block', marginBottom:'5px'}}>3. Scan Akta Kelahiran *</label>
                            <input name="file_akta" type="file" required accept=".pdf,image/*" />
                        </div>
                    </div>

                    {/* TOMBOL SUBMIT */}
                    <div style={{marginTop: '30px', textAlign: 'center'}}>
                        <button type="submit" disabled={loadingStatus !== null} 
                            style={{
                                background: loadingStatus ? '#94a3b8' : '#1a5d1a',
                                color: 'white',
                                border: 'none',
                                padding: '15px 40px',
                                borderRadius: '50px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: loadingStatus ? 'not-allowed' : 'pointer',
                                transition: '0.3s',
                                minWidth: '250px'
                            }}>
                            {getButtonText()}
                        </button>
                    </div>

                </form>
            </div>
        </div>
      </section>
    </>
  );
}