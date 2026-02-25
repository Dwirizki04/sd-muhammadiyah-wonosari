"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { subscribePPDBStatus } from '@/lib/firebaseService'; 
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function PPDB() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribePPDBStatus((status) => {
      setIsRegistrationOpen(status);
      setLoadingStatus(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Menggunakan FormData agar lebih aman dan rapi
    const formData = new FormData(e.target);

    const dataPendaftaran = {
      // --- I. IDENTITAS SISWA ---
      namaLengkap: formData.get("nama_lengkap"),
      nik: formData.get("nik"),
      nisn: formData.get("nisn") || "-",
      jenisKelamin: formData.get("jenis_kelamin"),
      tempatLahir: formData.get("tempat_lahir"),
      tanggalLahir: formData.get("tanggal_lahir"),
      agama: formData.get("agama") || "Islam",
      anakKe: formData.get("anak_ke"),
      jumlahSaudara: formData.get("jumlah_saudara"),
      citaCita: formData.get("cita_cita") || "-",
      hobi: formData.get("hobi") || "-",

      // --- II. ALAMAT ---
      alamatJalan: formData.get("alamat_jalan"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      desaKelurahan: formData.get("desa"),
      kecamatan: formData.get("kecamatan"),
      kabupatenKota: formData.get("kabupaten") || "Gunungkidul",
      kodePos: formData.get("kode_pos") || "-",

      // --- III. DATA ORANG TUA ---
      namaAyah: formData.get("nama_ayah"),
      nikAyah: formData.get("nik_ayah"),
      pendidikanAyah: formData.get("pendidikan_ayah"),
      pekerjaanAyah: formData.get("pekerjaan_ayah"),
      namaIbu: formData.get("nama_ibu"),
      nikIbu: formData.get("nik_ibu"),
      pendidikanIbu: formData.get("pendidikan_ibu"),
      pekerjaanIbu: formData.get("pekerjaan_ibu"),
      penghasilan: formData.get("penghasilan"),
      noWa: formData.get("no_wa"),

      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "ppdb_registrations"), dataPendaftaran);
      
      await Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Data ananda telah tersimpan. Silakan konfirmasi ke WhatsApp Admin.',
        confirmButtonColor: '#1a5d1a'
      });

      const pesanWA = `Halo Admin PPDB SDM Wonosari,%0ASaya mendaftarkan anak saya:%0A*Nama:* ${dataPendaftaran.namaLengkap}%0A*NIK:* ${dataPendaftaran.nik}%0A%0AMohon info selanjutnya.`;
      window.open(`https://wa.me/628123456789?text=${pesanWA}`, '_blank');

      e.target.reset();
      router.push('/');
    } catch (error) {
      Swal.fire('Gagal!', 'Terjadi kesalahan: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStatus) return <div style={styles.centerBox}>Memeriksa Status Pendaftaran...</div>;

  // --- TAMPILAN PENDAFTARAN DITUTUP (LEBIH RAMAH) ---
  if (!isRegistrationOpen) {
    return (
      <div style={styles.pageBg}>
        <div style={styles.container}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.closedCard}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏫</div>
            <h1 style={styles.closedTitle}>Pendaftaran Belum Dibuka</h1>
            <p style={styles.closedText}>
              Terima kasih atas ketertarikan Ayah & Bunda di <b>SD Muhammadiyah Wonosari</b>. 
              Saat ini pendaftaran sedang tidak aktif atau kuota periode ini telah terpenuhi.
            </p>
            <div style={styles.closedActions}>
              <button onClick={() => router.push('/')} style={styles.btnSecondary}>Kembali ke Beranda</button>
              <a href="https://wa.me/6285226443646" target="_blank" style={styles.btnWa}>Tanya Admin via WA</a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN FORMULIR ---
  return (
    <div style={styles.pageBg}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>FORMULIR PENDAFTARAN SISWA BARU</h1>
          <p style={styles.subtitle}>SD MUHAMMADIYAH WONOSARI • TP. 2026/2027</p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
          <form onSubmit={handleSubmit}>
            
            <h2 style={styles.sectionTitle}>I. Identitas Calon Siswa</h2>
            <div style={styles.grid}>
              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Nama Lengkap (Sesuai Akta)</label>
                <input name="nama_lengkap" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK</label><input name="nik" style={styles.input} maxLength="16" required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NISN</label><input name="nisn" style={styles.input} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Jenis Kelamin</label>
                <select name="jenis_kelamin" style={styles.input} required>
                  <option value="">Pilih...</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Agama</label><input name="agama" style={styles.input} defaultValue="Islam" required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tempat Lahir</label><input name="tempat_lahir" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tanggal Lahir</label><input name="tanggal_lahir" type="date" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Anak Ke-</label><input name="anak_ke" type="number" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Jumlah Saudara</label><input name="jumlah_saudara" type="number" style={styles.input} required /></div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>II. Data Alamat Domisili</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dusun / Nama Jalan / No. Rumah</label>
                <input name="alamat_jalan" style={styles.input} required />
              </div>
              <div style={styles.grid}>
                <div style={styles.inputGroup}><label style={styles.label}>RT</label><input name="rt" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>RW</label><input name="rw" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Desa/Kelurahan</label><input name="desa" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kecamatan</label><input name="kecamatan" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kabupaten</label><input name="kabupaten" style={styles.input} defaultValue="Gunungkidul" required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kode Pos</label><input name="kode_pos" style={styles.input} required /></div>
              </div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>III. Data Orang Tua / Wali</h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}><label style={styles.label}>Nama Ayah</label><input name="nama_ayah" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK Ayah</label><input name="nik_ayah" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pendidikan Ayah</label><input name="pendidikan_ayah" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pekerjaan Ayah</label><input name="pekerjaan_ayah" style={styles.input} /></div>
              
              <div style={styles.inputGroup}><label style={styles.label}>Nama Ibu</label><input name="nama_ibu" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK Ibu</label><input name="nik_ibu" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pendidikan Ibu</label><input name="pendidikan_ibu" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pekerjaan Ibu</label><input name="pekerjaan_ibu" style={styles.input} /></div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Penghasilan Gabungan</label>
                <select name="penghasilan" style={styles.input}>
                  <option value="Di bawah 2 Juta">Di bawah 2 Juta</option>
                  <option value="2 - 5 Juta">2 - 5 Juta</option>
                  <option value="Di atas 5 Juta">Di atas 5 Juta</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Wali (Wajib Aktif)</label>
                <input name="no_wa" style={{ ...styles.input, borderLeft: '5px solid #1a5d1a' }} placeholder="08xxxx" required />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? '⌛ Memproses...' : '🚀 Kirim Pendaftaran'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  pageBg: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '100px 20px 40px 20px', fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '900px', margin: '0px auto' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#1a5d1a', fontSize: '1.6rem', fontWeight: '800', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' },
  card: { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
  sectionTitle: { fontSize: '1.1rem', color: '#1a5d1a', fontWeight: '700', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151' },
  input: { padding: '12px', borderRadius: '10px', borderTopWidth:'1px', borderRightWidth:'1px', borderBottomWidth:'1px', borderLeftWidth:'1px', borderStyle:'solid', borderColor: '#d1d5db', fontSize: '0.95rem', outline: 'none' },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: '40px 0' },
  btnSubmit: { width: '100%', padding: '18px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '30px' },
  centerBox: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#1a5d1a' },
  
  // Gaya Kartu Tutup
  closedCard: { background: 'white', padding: '60px 40px', borderRadius: '30px', boxShadow: '0 20px 25px rgba(0,0,0,0.05)', textAlign: 'center' },
  closedTitle: { color: '#1a5d1a', fontSize: '2rem', fontWeight: '900', marginBottom: '15px' },
  closedText: { color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 30px' },
  closedActions: { display: 'flex', gap: '15px', justifyContent: 'center' },
  btnWa: { background: '#25d366', color: 'white', padding: '12px 25px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' },
  btnSecondary: { background: '#f1f5f9', color: '#475569', padding: '12px 25px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' },
};