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

// ===== PEMETAAN KOLOM: kunci data server -> nama input & label di form =====
// (dibuat otomatis dari form ini, supaya nama kolom di pesan error sama
// persis dengan label yang dilihat pengguna di layar)
const FIELD_INFO = {
  "namaLengkap": { "name": "nama_lengkap", "label": "Nama Lengkap" },
  "nisn": { "name": "nisn", "label": "NISN" },
  "jenisKelamin": { "name": "jenis_kelamin", "label": "Jenis Kelamin" },
  "tempatLahir": { "name": "tempat_lahir", "label": "Tempat Lahir" },
  "tanggalLahir": { "name": "tanggal_lahir", "label": "Tanggal Lahir" },
  "agama": { "name": "agama", "label": "Agama" },
  "anakKe": { "name": "anak_ke", "label": "Anak ke" },
  "jumlahSaudara": { "name": "jumlah_saudara", "label": "Jumlah Saudara" },
  "asalTK": { "name": "asal_tk", "label": "Asal TK" },
  "alamatTK": { "name": "alamat_tk", "label": "Alamat TK" },
  "alamatJalan": { "name": "alamat_jalan", "label": "Alamat (Dusun/Jalan/No. Rumah)" },
  "rt": { "name": "rt", "label": "RT" },
  "rw": { "name": "rw", "label": "RW" },
  "desaKelurahan": { "name": "desa", "label": "Desa/Kelurahan" },
  "kecamatan": { "name": "kecamatan", "label": "Kecamatan" },
  "kabupatenKota": { "name": "kabupaten", "label": "Kabupaten/Kota" },
  "kodePos": { "name": "kode_pos", "label": "Kode Pos" },
  "namaAyah": { "name": "nama_ayah", "label": "Nama Ayah" },
  "nikAyah": { "name": "nik_ayah", "label": "NIK Ayah" },
  "tempatLahirAyah": { "name": "tempat_lahir_ayah", "label": "Tempat Lahir Ayah" },
  "tanggalLahirAyah": { "name": "tanggal_lahir_ayah", "label": "Tanggal Lahir Ayah" },
  "pendidikanAyah": { "name": "pendidikan_ayah", "label": "Pendidikan Ayah" },
  "pekerjaanAyah": { "name": "pekerjaan_ayah", "label": "Pekerjaan Ayah" },
  "penghasilanAyah": { "name": "penghasilan_ayah", "label": "Penghasilan Ayah" },
  "noWaAyah": { "name": "no_wa_ayah", "label": "WhatsApp Ayah" },
  "namaIbu": { "name": "nama_ibu", "label": "Nama Ibu" },
  "nikIbu": { "name": "nik_ibu", "label": "NIK Ibu" },
  "tempatLahirIbu": { "name": "tempat_lahir_ibu", "label": "Tempat Lahir Ibu" },
  "tanggalLahirIbu": { "name": "tanggal_lahir_ibu", "label": "Tanggal Lahir Ibu" },
  "pendidikanIbu": { "name": "pendidikan_ibu", "label": "Pendidikan Ibu" },
  "pekerjaanIbu": { "name": "pekerjaan_ibu", "label": "Pekerjaan Ibu" },
  "penghasilanIbu": { "name": "penghasilan_ibu", "label": "Penghasilan Ibu" },
  "noWaIbu": { "name": "no_wa_ibu", "label": "WhatsApp Ibu" },
  "namaWali": { "name": "nama_wali", "label": "Nama Wali" },
  "nikWali": { "name": "nik_wali", "label": "NIK Wali" },
  "tempatLahirWali": { "name": "tempat_lahir_wali", "label": "Tempat Lahir Wali" },
  "tanggalLahirWali": { "name": "tanggal_lahir_wali", "label": "Tanggal Lahir Wali" },
  "hubunganWali": { "name": "hubungan_wali", "label": "Hubungan Wali" },
  "pendidikanWali": { "name": "pendidikan_wali", "label": "Pendidikan Wali" },
  "pekerjaanWali": { "name": "pekerjaan_wali", "label": "Pekerjaan Wali" },
  "penghasilanWali": { "name": "penghasilan_wali", "label": "Penghasilan Wali" },
  "noWaWali": { "name": "no_wa_wali", "label": "WhatsApp Wali" },
  "nik": { "name": "nik", "label": "NIK Siswa" }
};

// Pesan dari server yang menyebut kolom tertentu tanpa pola `Field "x"`
const PESAN_KE_KOLOM = [
  [/NIK Siswa/i, 'nik'],
  [/NIK Ayah/i, 'nik_ayah'],
  [/NIK Ibu/i, 'nik_ibu'],
  [/NIK Wali/i, 'nik_wali'],
  [/WA Ayah/i, 'no_wa_ayah'],
  [/WA Ibu/i, 'no_wa_ibu'],
  [/WA Wali/i, 'no_wa_wali'],
  [/Kartu Keluarga/i, 'dokumen_kk'],
  [/Akta/i, 'dokumen_akta'],
];

const TIPE_DOKUMEN_OK = ['image/jpeg', 'image/png', 'application/pdf'];
const formatMB = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Tandai & arahkan pengguna ke kolom yang bermasalah
function fokuskanKolom(name) {
  const el = document.querySelector(`[name="${name}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
  const asli = { outline: el.style.outline, boxShadow: el.style.boxShadow };
  el.style.outline = '2px solid #ef4444';
  el.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.18)';
  setTimeout(() => { el.style.outline = asli.outline; el.style.boxShadow = asli.boxShadow; }, 4000);
}

// Pesan gagal yang konsisten: APA yang salah + APA yang harus dilakukan
function tampilkanGagal({ judul, penyebab, solusi, fieldName, ikon = 'error' }) {
  return Swal.fire({
    icon: ikon,
    title: judul,
    html: `<div style="text-align:left;font-size:0.95rem;line-height:1.6">
      <p style="margin:0 0 10px"><b>Penyebab:</b> ${escapeHtml(penyebab)}</p>
      ${solusi ? `<p style="margin:0"><b>Yang perlu dilakukan:</b> ${escapeHtml(solusi)}</p>` : ''}
    </div>`,
    confirmButtonColor: '#1a5d1a',
    confirmButtonText: 'Mengerti',
  }).then(() => { if (fieldName) fokuskanKolom(fieldName); });
}

// Terjemahkan penolakan dari server (/api/ppdb-register) jadi pesan yang jelas
function jelaskanErrorServer(status, message) {
  const msg = message || '';
  let penyebab = msg || 'Server menolak data pendaftaran.';
  let fieldName = null;

  const fm = msg.match(/Field "(\w+)"/);
  if (fm && FIELD_INFO[fm[1]]) {
    penyebab = `Kolom "${FIELD_INFO[fm[1]].label}" belum diisi.`;
    fieldName = FIELD_INFO[fm[1]].name;
  } else {
    const hit = PESAN_KE_KOLOM.find(([re]) => re.test(msg));
    if (hit) fieldName = hit[1];
  }

  if (/reCAPTCHA|keamanan/i.test(msg) || status === 403) {
    return { judul: 'Verifikasi Keamanan Gagal', penyebab,
      solusi: 'Coba kirim ulang sekali lagi. Jika tetap gagal, matikan ad-blocker/VPN lalu muat ulang halaman (isian akan terhapus, jadi siapkan datanya).' };
  }
  if (status === 429) {
    return { judul: 'Terlalu Banyak Percobaan', penyebab,
      solusi: 'Tunggu sekitar 30 menit, lalu kirim ulang. Jika mendesak, hubungi admin sekolah.' };
  }
  if (status === 409) {
    if (/NIK/i.test(msg)) return { judul: 'NIK Sudah Terdaftar', penyebab, fieldName: 'nik',
      solusi: 'Cek status pendaftaran lewat tautan "Cek status" di atas formulir. Jika Ananda belum pernah mendaftar, hubungi admin sekolah.' };
    if (/ditutup/i.test(msg)) return { judul: 'Pendaftaran Sedang Ditutup', penyebab,
      solusi: 'Pendaftaran belum dibuka atau sudah ditutup. Hubungi admin sekolah untuk informasi jadwal.' };
    if (/kuota/i.test(msg)) return { judul: 'Kuota Pendaftaran Penuh', penyebab,
      solusi: 'Hubungi admin sekolah untuk menanyakan daftar tunggu.' };
    return { judul: 'Pendaftaran Ditolak', penyebab, solusi: 'Hubungi admin sekolah jika masalah berlanjut.' };
  }
  if (status === 400) {
    return { judul: 'Data Belum Sesuai', penyebab, fieldName,
      solusi: fieldName ? 'Perbaiki kolom yang ditandai merah, lalu kirim ulang. Isian lain tidak hilang.' : 'Periksa kembali isian formulir, lalu kirim ulang. Isian tidak hilang.' };
  }
  return { judul: 'Server Sedang Bermasalah', penyebab: 'Terjadi gangguan di server (kode ' + status + ').',
    solusi: 'Data kamu bukan penyebabnya dan isian tidak hilang. Coba lagi beberapa saat lagi; jika terus terjadi, hubungi admin sekolah.' };
}

// Terjemahkan error yang dilempar di sisi browser (upload, jaringan, reCAPTCHA)
function jelaskanErrorLain(error) {
  const solusiJaringan = 'Periksa koneksi internet, lalu kirim ulang. Isian formulir tidak hilang.';
  switch (error.kind) {
    case 'upload':
      return { judul: `Gagal Mengunggah ${error.label}`, penyebab: error.message, fieldName: error.fieldName,
        solusi: 'Pilih ulang file (JPG, PNG, atau PDF yang tidak rusak, maksimal 5MB), lalu kirim ulang.' };
    case 'jaringan':
      return { judul: 'Koneksi Bermasalah', penyebab: error.message, solusi: solusiJaringan };
    case 'recaptcha':
      return { judul: 'Verifikasi Keamanan Gagal', penyebab: 'Layanan reCAPTCHA dari Google tidak dapat dijalankan di perangkat ini.',
        solusi: 'Matikan ad-blocker/VPN, lalu kirim ulang. Jika tetap gagal, muat ulang halaman (isian akan terhapus).' };
    case 'server-html':
      return { judul: 'Server Sedang Bermasalah', penyebab: `Server mengirim respons yang tidak dikenali (kode ${error.status}).`,
        solusi: 'Data kamu bukan penyebabnya dan isian tidak hilang. Coba lagi beberapa saat lagi; jika terus terjadi, hubungi admin sekolah.' };
    default:
      if (error instanceof TypeError) {
        return { judul: 'Tidak Dapat Terhubung ke Server', penyebab: 'Permintaan tidak sampai ke server (' + error.message + ').', solusi: solusiJaringan };
      }
      return { judul: 'Terjadi Kesalahan', penyebab: error.message || 'Kesalahan yang tidak diketahui.',
        solusi: 'Coba kirim ulang. Jika terus terjadi, hubungi admin sekolah dan sebutkan pesan ini.' };
  }
}

// Terjemahkan pesan error mentah dari Cloudinary
function terjemahkanErrorCloudinary(raw) {
  if (/preset/i.test(raw)) return 'Layanan unggah dokumen belum dikonfigurasi dengan benar (hubungi admin sekolah).';
  if (/size|large|too big/i.test(raw)) return 'Ukuran file terlalu besar.';
  if (/format|not allowed|invalid|unsupported|corrupt/i.test(raw)) return 'File tidak dapat diterima: format tidak didukung atau file rusak.';
  return 'Server penyimpanan menolak file (' + raw + ').';
}

async function uploadDokumen(file, labelDokumen, fieldName) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_DOCS_PRESET);
  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
  } catch {
    const e = new Error(`Koneksi terputus saat mengunggah ${labelDokumen}.`);
    e.kind = 'jaringan';
    throw e;
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const e = new Error(terjemahkanErrorCloudinary(errBody?.error?.message || `status ${res.status}`));
    e.kind = 'upload'; e.label = labelDokumen; e.fieldName = fieldName;
    throw e;
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
    <div style={styles.pageBg} className="ppdb-wrap">
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
            Sistem pendaftaran akan dibuka pada tanggal <b>27 Oktober 2026</b> pukul <b>08.00</b> sampai <b>28 Oktober 2026</b> pukul <b>15.00</b>. 
            Silahkan periksa kembali pada waktu tersebut atau hubungi Admin SPMB.
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
      return tampilkanGagal({ judul: 'NIK Tidak Valid', penyebab: 'NIK Siswa harus 16 digit angka (tanpa spasi atau huruf).', solusi: 'Periksa kembali NIK pada Kartu Keluarga atau Akta Kelahiran.', fieldName: 'nik', ikon: 'warning' });
    }

    const kkFile = formData.get("dokumen_kk");
    const aktaFile = formData.get("dokumen_akta");

    if (!kkFile || kkFile.size === 0) {
      return tampilkanGagal({ judul: 'Dokumen Belum Diunggah', penyebab: 'Foto/scan Kartu Keluarga (KK) belum dipilih.', solusi: 'Pilih file KK (JPG, PNG, atau PDF).', fieldName: 'dokumen_kk', ikon: 'warning' });
    }
    if (!aktaFile || aktaFile.size === 0) {
      return tampilkanGagal({ judul: 'Dokumen Belum Diunggah', penyebab: 'Foto/scan Akta Kelahiran belum dipilih.', solusi: 'Pilih file Akta Kelahiran (JPG, PNG, atau PDF).', fieldName: 'dokumen_akta', ikon: 'warning' });
    }
    for (const [file, label, fieldName] of [[kkFile, 'Kartu Keluarga', 'dokumen_kk'], [aktaFile, 'Akta Kelahiran', 'dokumen_akta']]) {
      if (!TIPE_DOKUMEN_OK.includes(file.type)) {
        return tampilkanGagal({ judul: 'Format File Tidak Didukung', penyebab: `File ${label} bertipe "${file.type || 'tidak dikenali'}".`, solusi: 'Gunakan file JPG, PNG, atau PDF.', fieldName, ikon: 'warning' });
      }
      if (file.size > MAX_DOC_SIZE) {
        return tampilkanGagal({ judul: 'Ukuran File Terlalu Besar', penyebab: `File ${label} berukuran ${formatMB(file.size)}, melebihi batas 5 MB.`, solusi: 'Kecilkan ukuran file (foto ulang dengan resolusi lebih rendah atau kompres PDF), lalu pilih lagi.', fieldName, ikon: 'warning' });
      }
    }

    if (!recaptchaReady || !window.grecaptcha) {
      return tampilkanGagal({ judul: 'Sistem Keamanan Belum Siap', penyebab: 'reCAPTCHA belum selesai dimuat.', solusi: 'Silahkan coba muat ulang halaman atau refresh halaman. Jika tetap begini, matikan ad-blocker lalu muat ulang halaman.', ikon: 'info' });
    }

    setLoading(true);

    try {
      const [kkUrl, aktaUrl] = await Promise.all([
        uploadDokumen(kkFile, 'Kartu Keluarga', 'dokumen_kk'),
        uploadDokumen(aktaFile, 'Akta Kelahiran', 'dokumen_akta'),
      ]);

      const recaptchaToken = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(SITE_KEY, { action: 'ppdb_submit' })
            .then(resolve)
            .catch(reject);
        });
      }).catch(() => {
        const e = new Error('reCAPTCHA gagal dijalankan.');
        e.kind = 'recaptcha';
        throw e;
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
        asalTk: formData.get("asal_Tk") || "-",
        alamatTk: formData.get("alamat_Tk") || "-",

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
        const e = new Error('Respons server bukan JSON.');
        e.kind = 'server-html';
        e.status = res.status;
        throw e;
      }

      const result = await res.json();

      if (!res.ok) {
        return tampilkanGagal(jelaskanErrorServer(res.status, result.error));
      }

      await Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Data ananda telah tersimpan.',
        confirmButtonColor: '#1a5d1a'
      });

      const pesanWA = `Halo Admin SPMB SDM Wonosari,\nSaya mendaftarkan anak saya:\n*Nama:* ${dataPendaftaran.namaLengkap}\n*NIK:* ${dataPendaftaran.nik}\n\nMohon info selanjutnya.`;
      window.open(`https://wa.me/6285226443646?text=${encodeURIComponent(pesanWA)}`, '_blank');

      e.target.reset();
      router.push('/');
    } catch (error) {
      tampilkanGagal(jelaskanErrorLain(error));
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
    <style jsx global>{`
        .ppdb-wrap { overflow-x: hidden; }
        .ppdb-wrap input, .ppdb-wrap select, .ppdb-wrap textarea { max-width: 100%; }
        @media (max-width: 768px) {
          /* iOS menggambar input tanggal lebih pendek dari input lain */
          .ppdb-wrap input[type="date"] { -webkit-appearance: none; appearance: none; background-color: #fff; min-height: 46px; }
          .ppdb-wrap input[type="file"] { font-size: 0.9rem !important; padding: 10px !important; }
        }
      `}</style>
    <div style={styles.pageBg} className="ppdb-wrap">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>FORMULIR PENDAFTARAN INDEN MURID BARU</h1>
          <p style={styles.subtitle}>SD MUHAMMADIYAH WONOSARI • TAHUN AJARAN 2027/2028</p>
          {ppdbConfig.kuota > 0 && (
            <div style={styles.quotaBadge}>
              Sisa kuota: <strong>{Math.max(0, ppdbConfig.kuota - ppdbConfig.totalPendaftar)}</strong> dari {ppdbConfig.kuota}
            </div>
          )}
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
              <div style={styles.inputGroup}><label style={styles.label}>NISN</label><input name="nisn" style={styles.input} maxLength="10" pattern="\d{10}" inputMode="numeric" title="NISN harus 10 digit angka" required /></div>
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
              <div style={styles.inputGroup}><label style={styles.label}>Asal TK</label><input name="asal_Tk" style={styles.input} required /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Alamat TK</label><input name="alamat_Tk" style={styles.input} required /></div>
            </div>

            <div style={styles.divider} />

            <h2 style={styles.sectionTitle}>II. Alamat Domisili</h2>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Dusun / Nama Jalan / No. Rumah</label>
                <input name="alamat_jalan" style={styles.input} required />
            </div>
            <div style={{...styles.grid, marginTop:'15px'}}>
                <div style={styles.inputGroup}><label style={styles.label}>RT</label><input name="rt" inputMode="numeric" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>RW</label><input name="rw" inputMode="numeric" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Desa/Kelurahan</label><input name="desa" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kecamatan</label><input name="kecamatan" style={styles.input} required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kabupaten/Kota</label><input name="kabupaten" style={styles.input} defaultValue="Gunungkidul" required /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Kode Pos</label><input name="kode_pos" inputMode="numeric" autoComplete="postal-code" style={styles.input} required /></div>
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
                <label style={styles.label}>No HP Ayah</label>
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
                <label style={styles.label}>No HP Ibu</label>
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
                <label style={styles.label}>No HP Wali</label>
                <input name="no_hp_wali" style={{ ...styles.input, borderLeft: '5px solid #215280' }} placeholder="08xxxx" pattern="0[0-9]{9,13}" inputMode="numeric" title="Nomor HP harus diawali 0 dan 10-14 digit angka" />
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
  pageBg: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '100px clamp(12px, 4vw, 20px) max(40px, env(safe-area-inset-bottom)) clamp(12px, 4vw, 20px)', fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '900px', margin: '0px auto' },
  header: { textAlign: 'center', marginBottom: '30px' },
  quotaBadge: { display: 'inline-block', marginTop: '12px', padding: '6px 16px', borderRadius: '999px', background: '#f0fdf4', color: '#166534', fontSize: '0.85rem', fontWeight: '600' },
  checkStatusLink: { display: 'inline-block', padding: '8px 4px', lineHeight: 1.5, color: '#1a5d1a', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'underline', textUnderlineOffset: '3px' },
  title: { color: '#1a5d1a', fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: '800', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' },
  card: { background: 'white', padding: 'clamp(18px, 5vw, 40px)', borderRadius: 'clamp(14px, 3vw, 20px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
  sectionTitle: { fontSize: '1.1rem', color: '#1a5d1a', fontWeight: '700', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 'clamp(14px, 3vw, 20px)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151' },
  input: { padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', width: '100%', minWidth: 0, minHeight: '46px', boxSizing: 'border-box' },
  divider: { height: '1px', backgroundColor: '#f3f4f6', margin: 'clamp(24px, 5vw, 40px) 0' },
  btnSubmit: { width: '100%', boxSizing: 'border-box', minHeight: '54px', padding: '18px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '30px' },
  recaptchaNotice: { fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 },
  centerBox: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#1a5d1a' },
  // --- TAMBAHAN STYLE UNTUK PENDAFTARAN DITUTUP ---
  closedCard: {
    background: 'white',
    padding: 'clamp(28px, 8vw, 60px) clamp(18px, 5vw, 40px)',
    borderRadius: 'clamp(22px, 5vw, 35px)',
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
    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
    fontWeight: '900',
    marginBottom: '15px'
  },
  closedText: {
    color: '#64748b',
    fontSize: 'clamp(0.95rem, 3.6vw, 1.1rem)',
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