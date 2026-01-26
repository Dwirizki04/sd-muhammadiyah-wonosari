"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // Tambahkan ini

export default function PPDB() {
  const isRegistrationOpen = false; // Ganti sesuai kebutuhan
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;

    const dataPendaftaran = {
      namaLengkap: form.nama_lengkap.value,
      nik: form.nik.value,
      jenisKelamin: form.jenis_kelamin.value,
      tempatLahir: form.tempat_lahir.value,
      tanggalLahir: form.tanggal_lahir.value,
      anakKe: form.anak_ke.value,
      jumlahSaudara: form.jumlah_saudara.value,
      alamatLengkap: form.alamat_lengkap.value,
      dusun: form.dusun.value,
      rtRw: form.rt_rw.value,
      desaKelurahan: form.desa_kelurahan.value,
      kecamatan: form.kecamatan.value,
      namaAyah: form.nama_ayah.value,
      pekerjaanAyah: form.pekerjaan_ayah.value,
      namaIbu: form.nama_ibu.value,
      pekerjaanIbu: form.pekerjaan_ibu.value,
      noHp: form.no_wa.value, // Disamakan dengan Dashboard Admin
      createdAt: serverTimestamp(), // Menggunakan createdAt agar bisa diurutkan
      status: 'pending' // Gunakan 'pending' agar terbaca di filter dashboard
    };

    try {
      await addDoc(collection(db, "ppdb_registrations"), dataPendaftaran);
      await Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Data ananda telah tersimpan.',
        confirmButtonColor: '#1a5d1a'
      });

      const pesanWA = `Halo Admin PPDB SDM Wonosari,%0ASaya mendaftarkan anak saya:%0A*Nama:* ${dataPendaftaran.namaLengkap}%0A*NIK:* ${dataPendaftaran.nik}%0A*Alamat:* ${dataPendaftaran.desaKelurahan}%0A%0AMohon info selanjutnya.`;
      window.open(`https://wa.me/628123456789?text=${pesanWA}`, '_blank');

      form.reset();
      router.push('/');
    } catch (error) {
      console.error(error);
      Swal.fire('Gagal!', 'Terjadi kesalahan sistem.' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // JIKA PENDAFTARAN DITUTUP, TAMPILKAN INI
  if (!isRegistrationOpen) {
    return (
      <section className="ppdb-container">
        <div className="ppdb-card" style={{textAlign: 'center', padding: '100px 20px'}}>
           <div style={{fontSize: '4rem', color: '#ff4d4d', marginBottom: '20px'}}>
              <i className="fas fa-calendar-times"></i>
           </div>
           <h2 style={{color: '#334155', fontWeight: '800', fontSize: '1.8rem'}}>Pendaftaran Ditutup</h2>
           <p style={{color: '#64748b', marginTop: '10px', fontSize: '1.1rem'}}>
              Mohon maaf, pendaftaran peserta didik baru saat ini belum dibuka.
           </p>
           <Link href="/" className="btn-ppdb-submit" style={{display: 'inline-block', width: 'auto', marginTop: '30px', padding: '15px 40px', textDecoration: 'none'}}>
              Kembali ke Beranda
           </Link>
        </div>
      </section>
    );
  }

  // JIKA TERBUKA, TAMPILKAN FORMULIR SEPERTI BIASA
  return (
    <section className="ppdb-container">
      <div className="ppdb-card">
        <div className="ppdb-header">
          <div className="logo-wrapper">
            <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={70} height={70} />
          </div>
          <div className="header-text">
            <h2>FORMULIR PENDAFTARAN</h2>
            <h3>SD MUHAMMADIYAH WONOSARI</h3>
            <p>Tahun Ajaran 2026/2027</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ppdb-form">
          <h3 className="section-title">I. IDENTITAS CALON SISWA</h3>
          <div className="responsive-grid">
            <div className="form-group full-width">
              <label>Nama Lengkap (Sesuai Akta)</label>
              <input name="nama_lengkap" type="text" required />
            </div>
            <div className="form-group">
              <label>NIK</label>
              <input name="nik" type="text" maxLength="16" required />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <select name="jenis_kelamin" required>
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tempat Lahir</label>
              <input name="tempat_lahir" type="text" required />
            </div>
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input name="tanggal_lahir" type="date" required />
            </div>
            <div className="form-group">
              <label>Anak Ke-</label>
              <input name="anak_ke" type="number" required />
            </div>
            <div className="form-group">
              <label>Jumlah Saudara</label>
              <input name="jumlah_saudara" type="number" required />
            </div>
          </div>

          <h3 className="section-title">II. ALAMAT TEMPAT TINGGAL</h3>
          <div className="responsive-grid">
            <div className="form-group full-width">
              <label>Alamat Lengkap (Jalan/No. Rumah)</label>
              <input name="alamat_lengkap" type="text" required />
            </div>
            <div className="form-group">
              <label>Dusun</label>
              <input name="dusun" type="text" required />
            </div>
            <div className="form-group">
              <label>RT / RW</label>
              <input name="rt_rw" type="text" placeholder="001/005" required />
            </div>
            <div className="form-group">
              <label>Desa / Kelurahan</label>
              <input name="desa_kelurahan" type="text" required />
            </div>
            <div className="form-group">
              <label>Kecamatan</label>
              <input name="kecamatan" type="text" required />
            </div>
          </div>

          <h3 className="section-title">III. DATA ORANG TUA</h3>
          <div className="responsive-grid">
            <div className="form-group">
              <label>Nama Ayah</label>
              <input name="nama_ayah" type="text" required />
            </div>
            <div className="form-group">
              <label>Pekerjaan Ayah</label>
              <input name="pekerjaan_ayah" type="text" required />
            </div>
            <div className="form-group">
              <label>Nama Ibu</label>
              <input name="nama_ibu" type="text" required />
            </div>
            <div className="form-group">
              <label>Pekerjaan Ibu</label>
              <input name="pekerjaan_ibu" type="text" required />
            </div>
            <div className="form-group full-width">
              <label>WhatsApp Wali Murid</label>
              <input name="no_wa" type="tel" placeholder="08..." required />
            </div>
          </div>

          <button type="submit" className="btn-ppdb-submit" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Pendaftaran Sekarang'}
          </button>
        </form>
      </div>
    </section>
  );
}