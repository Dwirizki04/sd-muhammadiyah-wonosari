"use client";

import { useState, useEffect, useRef } from 'react';
import { subscribePPDBConfig } from '@/lib/firebaseService';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';

export default function PPDB() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [ppdbConfig, setPpdbConfig] = useState({ kuota: 0, totalPendaftar: 0 });
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const router = useRouter();
  const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_DOCS_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_DOCS_PRESET;
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadDokumen(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_DOCS_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message || `Upload gagal (status ${res.status})`;
    throw new Error(msg);
  }
  const data = await res.json();
  return data.secure_url;
}

  useEffect(() => {
    const unsub = subscribePPDBConfig((config) => {
      setIsRegistrationOpen(config.isOpen);
      setPpdbConfig(config);
      setLoadingStatus(false);
    });
    return () => unsub();
  }, []);

  if (loadingStatus) return <div style={styles.centerBox}>Memeriksa Status Pendaftaran...</div>;
  if (!isRegistrationOpen) {
  return (
    <div style={styles.pageBg}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={styles.closedCard}
        >
          {/* Ikon Header */}
          <div style={styles.closedIconBox}>
            <motion.span 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: '5rem' }}
            >
              🏫
            </motion.span>
          </div>

          <h1 style={styles.closedTitle}>Pendaftaran Belum Aktif</h1>
          
          <p style={styles.closedText}>
            Terima kasih atas ketertarikan Ayah & Bunda untuk bergabung bersama 
            <br /> 
            <strong style={{ color: '#1a5d1a' }}>SD Muhammadiyah Wonosari</strong>.
          </p>

          <div style={styles.closedNotice}>
            Mohon maaf, saat ini sistem pendaftaran sedang <b>dinonaktifkan</b>. Silakan periksa kembali di lain waktu 
            atau hubungi layanan Admin kami.
          </div>

          {/* Tombol Tindakan agar User tidak buntu */}
          <div style={styles.closedActions}>
            <Link href="/" style={styles.btnHome}>
              🏠 Kembali ke Beranda
            </Link>
            <Link href="/ppdb/status" style={styles.btnCheck}>
              🔍 Cek Status Pendaftaran
            </Link>
          </div>

          <div style={styles.closedFooter}>
            Butuh bantuan? <a href="https://wa.me/6285226443646" target="_blank" style={styles.waLink}>Hubungi Admin SPMB</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nik = formData.get("nik");

    if (!/^\d{16}$/.test(nik)) {
      return Swal.fire('NIK Tidak Valid', 'NIK Siswa harus 16 digit angka.', 'warning');
    }

    const kkFile = formData.get("dokumen_kk");
    const aktaFile = formData.get("dokumen_akta");

    if (!kkFile || kkFile.size === 0) {
      return Swal.fire('Dokumen Kurang', 'Mohon upload foto/scan Kartu Keluarga (KK).', 'warning');
    }
    if (!aktaFile || aktaFile.size === 0) {
      return Swal.fire('Dokumen Kurang', 'Mohon upload foto/scan Akta Kelahiran.', 'warning');
    }
    if (kkFile.size > MAX_DOC_SIZE || aktaFile.size > MAX_DOC_SIZE) {
      return Swal.fire('File Terlalu Besar', 'Ukuran maksimal tiap dokumen adalah 5MB.', 'warning');
    }

    if (!recaptchaReady || !window.grecaptcha) {
      return Swal.fire('Mohon Tunggu', 'Sistem keamanan sedang dimuat, coba lagi sebentar.', 'info');
    }

    setLoading(true);

    try {
      const [kkUrl, aktaUrl] = await Promise.all([
        uploadDokumen(kkFile),
        uploadDokumen(aktaFile),
      ]);

      const recaptchaToken = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(SITE_KEY, { action: 'ppdb_submit' })
            .then(resolve)
            .catch(reject);
        });
      });

      const dataPendaftaran = {
        kkUrl,
        aktaUrl,
        // --- I. IDENTITAS SISWA ---
        namaLengkap: formData.get("nama_lengkap"),
        nik: nik,
        nisn: formData.get("nisn") || "-",
        jenisKelamin: formData.get("jenis_kelamin"),
        tempatLahir: formData.get("tempat_lahir"),
        tanggalLahir: formData.get("tanggal_lahir"),
        agama: formData.get("agama") || "Islam",
        anakKe: formData.get("anak_ke"),
        jumlahSaudara: formData.get("jumlah_saudara"),
        asalTK: formData.get("asal_tk") || "-",
        alamatTK: formData.get("alamat_tk") || "-",

        // --- II. ALAMAT ---
        alamatJalan: formData.get("alamat_jalan"),
        rt: formData.get("rt"),
        rw: formData.get("rw"),
        desaKelurahan: formData.get("desa"),
        kecamatan: formData.get("kecamatan"),
        kabupatenKota: formData.get("kabupaten") || "Gunungkidul",
        kodePos: formData.get("kode_pos") || "-",

        // --- III. DATA AYAH ---
        namaAyah: formData.get("nama_ayah"),
        nikAyah: formData.get("nik_ayah"),
        tempatLahirAyah: formData.get("tempat_lahir_ayah"),
        tanggalLahirAyah: formData.get("tanggal_lahir_ayah"),
        pendidikanAyah: formData.get("pendidikan_ayah"),
        pekerjaanAyah: formData.get("pekerjaan_ayah"),
        penghasilanAyah: formData.get("penghasilan_ayah"),
        noWaAyah: formData.get("no_wa_ayah"),

        // --- IV. DATA IBU ---
        namaIbu: formData.get("nama_ibu"),
        nikIbu: formData.get("nik_ibu"),
        tempatLahirIbu: formData.get("tempat_lahir_ibu"),
        tanggalLahirIbu: formData.get("tanggal_lahir_ibu"),
        pendidikanIbu: formData.get("pendidikan_ibu"),
        pekerjaanIbu: formData.get("pekerjaan_ibu"),
        penghasilanIbu: formData.get("penghasilan_ibu"),
        noWaIbu: formData.get("no_wa_ibu"),

        // --- V. DATA WALI ---
        namaWali: formData.get("nama_wali") || "-",
        nikWali: formData.get("nik_wali") || "-",
        tempatLahirWali: formData.get("tempat_lahir_wali") || "-",
        tanggalLahirWali: formData.get("tanggal_lahir_wali") || "-",
        hubunganWali: formData.get("hubungan_wali") || "-",
        pendidikanWali: formData.get("pendidikan_wali") || "-",
        pekerjaanWali: formData.get("pekerjaan_wali") || "-",
        penghasilanWali: formData.get("penghasilan_wali") || "-",
        noWaWali: formData.get("no_wa_wali") || "-",
      };

      const res = await fetch('/api/ppdb-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recaptchaToken, data: dataPendaftaran }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Server crash / error HTML page dikirim, bukan JSON -- kasih pesan
        // yang jelas daripada error parse JSON yang membingungkan user.
        throw new Error('Server sedang bermasalah. Coba lagi sebentar lagi, atau hubungi admin kalau terus terjadi.');
      }

      const result = await res.json();

      if (!res.ok) {
        setLoading(false);
        return Swal.fire('Gagal', result.error || 'Pendaftaran gagal diproses.', 'error');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Data ananda telah tersimpan.',
        confirmButtonColor: '#1a5d1a'
      });

      const pesanWA = `Halo Admin SPMB SDM Wonosari,\nSaya mendaftarkan anak saya:\n*Nama:* ${dataPendaftaran.namaLengkap}\n*NIK:* ${dataPendaftaran.nik}\n\nMohon menunggu verifikasi selanjutnya selanjutnya.`;
      window.open(`https://wa.me/6285226443646?text=${encodeURIComponent(pesanWA)}`, '_blank');

      e.target.reset();
      router.push('/');
    } catch (error) {
      Swal.fire('Gagal!', 'Terjadi kesalahan: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setRecaptchaReady(true)}
      />
    <div style={styles.pageBg}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>SEDANG DALAM TAHAP UJI COBA DIMOHON TIDAK UNTUK MENGISI FORMULIR</h1>
          <p style={styles.subtitle}>SD MUHAMMADIYAH WONOSARI • TP. 2026/2027</p>
          {/* {ppdbConfig.kuota > 0 && (
            <div style={styles.quotaBadge}>
              Sisa kuota: <strong>{Math.max(0, ppdbConfig.kuota - ppdbConfig.totalPendaftar)}</strong> dari {ppdbConfig.kuota}
            </div>
          )} */}
          <div style={{ marginTop: '14px' }}>
            <Link href="/ppdb/status" style={styles.checkStatusLink}>
              🔍 Sudah pernah daftar? Cek status pendaftaran di sini
            </Link>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.card}>
          <form onSubmit={handleSubmit}>
            
            <h2 style={styles.sectionTitle}>I. Identitas Calon Siswa</h2>
            <div style={styles.grid}>
              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Nama Lengkap (Sesuai Akta)</label>
                <input name="nama_lengkap" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK</label><input name="nik" style={styles.input} maxLength="16" pattern="\d{16}" inputMode="numeric" title="NIK harus 16 digit angka" required /></div>
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
              <div style={styles.inputGroup}><label style={styles.label}>Asal TK</label><input name="asal_tk" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Alamat TK</label><input name="alamat_tk" style={styles.input} /></div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>II. Alamat Domisili</h2>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Dusun / Nama Jalan / No. Rumah</label>
                <input name="alamat_jalan" style={styles.input} required />
            </div>
            <div style={{...styles.grid, marginTop:'15px'}}>
                <div style={styles.inputGroup}><label style={styles.label}>RT</label><input name="rt" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>RW</label><input name="rw" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Desa/Kelurahan</label><input name="desa" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kecamatan</label><input name="kecamatan" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kode Pos</label><input name="kode_pos" style={styles.input} required /></div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>III. Data Ayah Kandung</h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}><label style={styles.label}>Nama Ayah</label><input name="nama_ayah" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK Ayah</label><input name="nik_ayah" style={styles.input} maxLength="16" pattern="\d{16}" inputMode="numeric" title="NIK harus 16 digit angka" required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tempat Lahir Ayah</label><input name="tempat_lahir_ayah" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tanggal Lahir Ayah</label><input name="tanggal_lahir_ayah" type="date" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pendidikan Terakhir</label><input name="pendidikan_ayah" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pekerjaan</label><input name="pekerjaan_ayah" style={styles.input} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Penghasilan Ayah</label>
                <select name="penghasilan_ayah" style={styles.input}>
                  <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                  <option value="Di bawah 1 Juta">Di bawah 1 Juta</option>
                  <option value="1 - 3 Juta">1 - 3 Juta</option>
                  <option value="Di atas 3 Juta">Di atas 3 Juta</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Ayah</label>
                <input name="no_wa_ayah" style={{ ...styles.input, borderLeft: '5px solid #1a5d1a' }} placeholder="08xxxx" pattern="0[0-9]{9,13}" inputMode="numeric" title="Nomor WA harus diawali 0 dan 10-14 digit angka" required />
              </div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>IV. Data Ibu Kandung</h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}><label style={styles.label}>Nama Ibu</label><input name="nama_ibu" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK Ibu</label><input name="nik_ibu" style={styles.input} maxLength="16" pattern="\d{16}" inputMode="numeric" title="NIK harus 16 digit angka" required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tempat Lahir Ibu</label><input name="tempat_lahir_ibu" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tanggal Lahir Ibu</label><input name="tanggal_lahir_ibu" type="date" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pendidikan Terakhir</label><input name="pendidikan_ibu" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pekerjaan</label><input name="pekerjaan_ibu" style={styles.input} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Penghasilan Ibu</label>
                <select name="penghasilan_ibu" style={styles.input}>
                  <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                  <option value="Di bawah 1 Juta">Di bawah 1 Juta</option>
                  <option value="1 - 3 Juta">1 - 3 Juta</option>
                  <option value="Di atas 3 Juta">Di atas 3 Juta</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Ibu</label>
                <input name="no_wa_ibu" style={{ ...styles.input, borderLeft: '5px solid #d14d72' }} placeholder="08xxxx" pattern="0[0-9]{9,13}" inputMode="numeric" title="Nomor WA harus diawali 0 dan 10-14 digit angka" required />
              </div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>V. Data Wali (Opsional)</h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}><label style={styles.label}>Nama Wali</label><input name="nama_wali" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>NIK Wali</label><input name="nik_wali" style={styles.input} maxLength="16" pattern="\d{16}" inputMode="numeric" title="NIK harus 16 digit angka" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tempat Lahir Wali</label><input name="tempat_lahir_wali" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Tanggal Lahir Wali</label><input name="tanggal_lahir_wali" type="date" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Hubungan Wali</label><input name="hubungan_wali" style={styles.input} placeholder="Kakek/Paman/Lainnya" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pendidikan Terakhir Wali</label><input name="pendidikan_wali" style={styles.input} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Pekerjaan Wali</label><input name="pekerjaan_wali" style={styles.input} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Penghasilan Wali</label>
                <select name="penghasilan_wali" style={styles.input}>
                  <option value="-">-</option>
                  <option value="Di bawah 1 Juta">Di bawah 1 Juta</option>
                  <option value="1 - 3 Juta">1 - 3 Juta</option>
                  <option value="Di atas 3 Juta">Di atas 3 Juta</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Wali</label>
                <input name="no_wa_wali" style={{ ...styles.input, borderLeft: '5px solid #215280' }} placeholder="08xxxx" pattern="0[0-9]{9,13}" inputMode="numeric" title="Nomor WA harus diawali 0 dan 10-14 digit angka" />
              </div>
            </div>

            <h2 style={styles.sectionTitle}>VI. Upload Dokumen</h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Kartu Keluarga (KK)</label>
                <input name="dokumen_kk" type="file" accept="image/jpeg,image/png,application/pdf" style={styles.input} required />
                <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Format JPG/PNG/PDF, maksimal 5MB.</small>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Akta Kelahiran</label>
                <input name="dokumen_akta" type="file" accept="image/jpeg,image/png,application/pdf" style={styles.input} required />
                <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Format JPG/PNG/PDF, maksimal 5MB.</small>
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? '⌛ Memproses...' : '🚀 Kirim Pendaftaran'}
            </button>
            <p style={styles.recaptchaNotice}>
              Halaman ini dilindungi reCAPTCHA dan tunduk pada{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Kebijakan Privasi</a>{' '}
              dan{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Persyaratan Layanan</a>{' '}
              Google.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
    </>
  );
}

const styles = {
  pageBg: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '100px 20px 40px 20px', fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '900px', margin: '0px auto' },
  header: { textAlign: 'center', marginBottom: '30px' },
  quotaBadge: { display: 'inline-block', marginTop: '12px', padding: '6px 16px', borderRadius: '999px', background: '#f0fdf4', color: '#166534', fontSize: '0.85rem', fontWeight: '600' },
  checkStatusLink: { display: 'inline-block', color: '#1a5d1a', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'underline', textUnderlineOffset: '3px' },
  title: { color: '#1a5d1a', fontSize: '1.6rem', fontWeight: '800', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' },
  card: { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
  sectionTitle: { fontSize: '1.1rem', color: '#1a5d1a', fontWeight: '700', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: '40px 0' },
  btnSubmit: { width: '100%', padding: '18px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '30px' },
  recaptchaNotice: { fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 },
  centerBox: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#1a5d1a' },
  // --- TAMBAHAN STYLE UNTUK PENDAFTARAN DITUTUP ---
  closedCard: {
    background: 'white',
    padding: '60px 40px',
    borderRadius: '35px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #f1f5f9'
  },
  closedIconBox: {
    marginBottom: '30px',
    display: 'inline-block'
  },
  closedTitle: {
    color: '#1e293b',
    fontSize: '2rem',
    fontWeight: '900',
    marginBottom: '15px'
  },
  closedText: {
    color: '#64748b',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '25px'
  },
  closedNotice: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '20px',
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '40px',
    border: '1px dashed #cbd5e1'
  },
  closedActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '30px'
  },
  btnHome: {
    background: '#1a5d1a',
    color: 'white',
    padding: '15px',
    borderRadius: '15px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '1rem',
    transition: '0.3s',
  },
  btnCheck: {
    background: '#f1f5f9',
    color: '#1e293b',
    padding: '15px',
    borderRadius: '15px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '1rem',
    transition: '0.3s',
  },
  closedFooter: {
    fontSize: '0.9rem',
    color: '#94a3b8'
  },
  waLink: {
    color: '#1a5d1a',
    fontWeight: 'bold',
    textDecoration: 'none',
    borderBottom: '2px solid #dcfce7'
  }
};