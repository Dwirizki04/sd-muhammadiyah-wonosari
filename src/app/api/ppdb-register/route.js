// src/app/api/ppdb-register/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// --- RATE LIMITING SEDERHANA (IN-MEMORY, per-IP) ---
const attemptLog = new Map();
const WINDOW_MS = 30 * 60 * 1000; // 30 menit
const MAX_ATTEMPTS = 5; // form panjang, wajar kalau submit ulang beberapa kali karena typo

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (attemptLog.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_ATTEMPTS) {
    attemptLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  attemptLog.set(ip, timestamps);
  return false;
}

const NIK_REGEX = /^\d{16}$/;
const PHONE_REGEX = /^0\d{9,13}$/;
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB

// Verifikasi ukuran file SEBENARNYA langsung dari Cloudinary via header
// Content-Length -- tidak bergantung ke pengaturan preset Cloudinary
// (yang ternyata tidak selalu muncul di beberapa akun/plan), dan tidak
// bisa dipalsukan client karena ini nanya langsung ke file aslinya.
async function isFileSizeValid(url, maxBytes) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const len = res.headers.get('content-length');
    if (!len) return true; // Tidak bisa dipastikan -> jangan block, hindari false reject
    return Number(len) <= maxBytes;
  } catch {
    return true; // Kalau gagal cek (jaringan dsb), jangan block pendaftaran gara-gara ini
  }
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

async function verifyRecaptcha(token, ip) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY tidak diset.');
    return { success: false, reason: 'config' };
  }

  const params = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();

  // reCAPTCHA v3 mengembalikan skor 0.0 (kemungkinan bot) - 1.0 (kemungkinan manusia).
  // 0.5 adalah ambang batas default yang direkomendasikan Google.
  if (!data.success || (typeof data.score === 'number' && data.score < 0.5)) {
    return { success: false, reason: 'low_score', score: data.score };
  }
  return { success: true };
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Silakan coba lagi dalam 30 menit.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { recaptchaToken, data } = body;

    if (!isNonEmptyString(recaptchaToken)) {
      return NextResponse.json({ error: 'Verifikasi reCAPTCHA tidak ditemukan.' }, { status: 400 });
    }

    const captchaResult = await verifyRecaptcha(recaptchaToken, ip);
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: 'Verifikasi keamanan gagal. Silakan coba lagi (refresh halaman kalau perlu).' },
        { status: 403 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap.' }, { status: 400 });
    }

    // --- VALIDASI SERVER-SIDE (jangan cuma percaya validasi di browser) ---
    const requiredStrings = [
      'namaLengkap', 'jenisKelamin', 'agama', 'tempatLahir', 'tanggalLahir',
      'alamatJalan', 'alamatTk', 'asalTk','rt', 'rw', 'desaKelurahan', 'kecamatan',
      'namaAyah', 'tempatLahirAyah', 'tanggalLahirAyah',
      'namaIbu', 'tempatLahirIbu', 'tanggalLahirIbu',
      'noWaAyah', 'noWaIbu',
    ];
    for (const field of requiredStrings) {
      if (!isNonEmptyString(data[field])) {
        return NextResponse.json({ error: `Field "${field}" wajib diisi.` }, { status: 400 });
      }
    }

    if (!NIK_REGEX.test(data.nik || '')) {
      return NextResponse.json({ error: 'NIK Siswa harus 16 digit angka.' }, { status: 400 });
    }
    if (!NIK_REGEX.test(data.nikAyah || '')) {
      return NextResponse.json({ error: 'NIK Ayah harus 16 digit angka.' }, { status: 400 });
    }
    if (!NIK_REGEX.test(data.nikIbu || '')) {
      return NextResponse.json({ error: 'NIK Ibu harus 16 digit angka.' }, { status: 400 });
    }
    if (data.nikWali && data.nikWali !== '-' && !NIK_REGEX.test(data.nikWali)) {
      return NextResponse.json({ error: 'NIK Wali harus 16 digit angka (kosongkan jika tidak ada).' }, { status: 400 });
    }
    if (!PHONE_REGEX.test(data.noWaAyah)) {
      return NextResponse.json({ error: 'Nomor WA Ayah tidak valid.' }, { status: 400 });
    }
    if (!PHONE_REGEX.test(data.noWaIbu)) {
      return NextResponse.json({ error: 'Nomor WA Ibu tidak valid.' }, { status: 400 });
    }
    if (data.noWaWali && data.noWaWali !== '-' && !PHONE_REGEX.test(data.noWaWali)) {
      return NextResponse.json({ error: 'Nomor WA Wali tidak valid.' }, { status: 400 });
    }

    // Dokumen wajib ada dan harus benar-benar hasil upload Cloudinary --
    // mencegah orang mengisi URL sembarangan (misal link ke file berbahaya)
    // langsung lewat request API tanpa lewat form.
    const isValidCloudinaryUrl = (url) =>
      typeof url === 'string' && /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|raw)\/upload\//.test(url);

    if (!isValidCloudinaryUrl(data.kkUrl)) {
      return NextResponse.json({ error: 'Dokumen Kartu Keluarga tidak valid.' }, { status: 400 });
    }
    if (!isValidCloudinaryUrl(data.aktaUrl)) {
      return NextResponse.json({ error: 'Dokumen Akta Kelahiran tidak valid.' }, { status: 400 });
    }

    const [kkSizeOk, aktaSizeOk] = await Promise.all([
      isFileSizeValid(data.kkUrl, MAX_DOC_SIZE),
      isFileSizeValid(data.aktaUrl, MAX_DOC_SIZE),
    ]);
    if (!kkSizeOk) {
      return NextResponse.json({ error: 'Ukuran dokumen Kartu Keluarga melebihi 5MB.' }, { status: 400 });
    }
    if (!aktaSizeOk) {
      return NextResponse.json({ error: 'Ukuran dokumen Akta Kelahiran melebihi 5MB.' }, { status: 400 });
    }

    // --- TRANSACTION: cek status buka/tutup, kuota, NIK duplikat, & simpan ---
    // Semua dicek dalam SATU transaction supaya atomic -- kalau dua orang
    // submit hampir bersamaan pas kuota tersisa 1, tidak akan ada yang
    // "kebobolan" lolos melebihi kuota. Pakai NIK sebagai document ID juga
    // menghilangkan race condition untuk deteksi NIK duplikat.
    const docRef = adminDb.collection('ppdb_registrations').doc(data.nik);
    const configRef = adminDb.collection('settings').doc('ppdb_config');

    const result = await adminDb.runTransaction(async (tx) => {
      // Semua GET harus dilakukan sebelum SET/WRITE apa pun dalam transaction.
      const [existing, configSnap] = await Promise.all([tx.get(docRef), tx.get(configRef)]);

      if (existing.exists) {
        return { success: false, error: 'Ananda dengan NIK ini sudah terdaftar di sistem.' };
      }

      const config = configSnap.exists ? configSnap.data() : {};

      // isOpen default ke false kalau dokumen belum pernah dibuat admin --
      // lebih aman "tertutup by default" daripada tanpa sengaja menerima
      // pendaftaran padahal admin belum pernah mengaktifkan apa pun.
      if (config.isOpen !== true) {
        return { success: false, error: 'Pendaftaran PPDB saat ini sedang ditutup.' };
      }

      const kuota = Number(config.kuota) || 0; // 0 = tanpa batas kuota
      const totalPendaftar = Number(config.totalPendaftar) || 0;
      if (kuota > 0 && totalPendaftar >= kuota) {
        return { success: false, error: 'Mohon maaf, kuota pendaftaran PPDB sudah penuh.' };
      }

      tx.set(docRef, {
        namaLengkap: data.namaLengkap,
        nik: data.nik,
        nisn: data.nisn || '-',
        jenisKelamin: data.jenisKelamin,
        tempatLahir: data.tempatLahir,
        tanggalLahir: data.tanggalLahir,
        agama: data.agama,
        anakKe: data.anakKe,
        jumlahSaudara: data.jumlahSaudara,
        asalTk: data.asalTk || '-',
        alamatTk: data.alamatTk || '-',

        alamatJalan: data.alamatJalan,
        rt: data.rt,
        rw: data.rw,
        desaKelurahan: data.desaKelurahan,
        kecamatan: data.kecamatan,
        kabupatenKota: data.kabupatenKota || 'Gunungkidul',
        kodePos: data.kodePos || '-',

        namaAyah: data.namaAyah,
        nikAyah: data.nikAyah,
        tempatLahirAyah: data.tempatLahirAyah,
        tanggalLahirAyah: data.tanggalLahirAyah,
        pendidikanAyah: data.pendidikanAyah || '-',
        pekerjaanAyah: data.pekerjaanAyah || '-',
        penghasilanAyah: data.penghasilanAyah || '-',
        noWaAyah: data.noWaAyah,

        namaIbu: data.namaIbu,
        nikIbu: data.nikIbu,
        tempatLahirIbu: data.tempatLahirIbu,
        tanggalLahirIbu: data.tanggalLahirIbu,
        pendidikanIbu: data.pendidikanIbu || '-',
        pekerjaanIbu: data.pekerjaanIbu || '-',
        penghasilanIbu: data.penghasilanIbu || '-',
        noWaIbu: data.noWaIbu,

        namaWali: data.namaWali || '-',
        nikWali: data.nikWali || '-',
        tempatLahirWali: data.tempatLahirWali || '-',
        tanggalLahirWali: data.tanggalLahirWali || '-',
        hubunganWali: data.hubunganWali || '-',
        pendidikanWali: data.pendidikanWali || '-',
        pekerjaanWali: data.pekerjaanWali || '-',
        penghasilanWali: data.penghasilanWali || '-',
        noWaWali: data.noWaWali || '-',

        noWa: data.noWaAyah || data.noWaIbu,
        kkUrl: data.kkUrl,
        aktaUrl: data.aktaUrl,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      // Naikkan counter pendaftar secara atomic dalam transaction yang sama
      tx.set(configRef, { totalPendaftar: FieldValue.increment(1) }, { merge: true });

      return { success: true };
    });

    const status = result.success ? 200 : 409;
    return NextResponse.json(result, { status });
  } catch (err) {
    console.error('Error ppdb-register:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' }, { status: 500 });
  }
}
