// src/app/api/cek-status/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// --- RATE LIMITING SEDERHANA (IN-MEMORY) ---
// Catatan: penyimpanan in-memory ini reset setiap kali server restart/redeploy,
// dan TIDAK dibagi antar instance jika kamu deploy multi-instance/serverless
// dengan banyak region. Untuk produksi skala lebih besar, ganti dengan
// Upstash Redis / Vercel KV (lihat catatan di bawah file ini).
const attemptLog = new Map(); // ip -> [timestamp, timestamp, ...]

const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_ATTEMPTS = 5; // maksimal 5 percobaan per 10 menit per IP

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

// Validasi format NIK: harus 16 digit angka
function isValidNik(nik) {
  return typeof nik === 'string' && /^\d{16}$/.test(nik);
}

export async function POST(request) {
  try {
    // Ambil IP dari header (tergantung platform hosting: Vercel/Cloudflare dsb.)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { nik } = body;

    if (!isValidNik(nik)) {
      return NextResponse.json(
        { error: 'Format NIK tidak valid. Harus 16 digit angka.' },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection('ppdb_registrations')
      .where('nik', '==', nik)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Data pendaftaran tidak ditemukan. Pastikan NIK sudah benar.' },
        { status: 404 }
      );
    }

    const data = snapshot.docs[0].data();

    let dateStr = '-';
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      dateStr = data.createdAt.toDate().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Hanya kembalikan field yang memang perlu ditampilkan ke publik.
    // Jangan spread seluruh dokumen (data) mentah-mentah, untuk mencegah
    // kebocoran field lain yang mungkin ada di masa depan (misal catatan
    // internal admin, NIK/no-WA orang tua, atau link dokumen KK/Akta --
    // itu tetap harus lewat panel admin, bukan halaman publik ini).
    return NextResponse.json({
      namaLengkap: data.namaLengkap,
      nik: data.nik,
      jenisKelamin: data.jenisKelamin,
      tempatLahir: data.tempatLahir || '-',
      tanggalLahir: data.tanggalLahir || '-',
      alamatLengkap: [data.alamatJalan, data.rt && data.rw ? `RT ${data.rt}/RW ${data.rw}` : null, data.desaKelurahan, data.kecamatan]
        .filter(Boolean)
        .join(', ') || '-',
      namaAyah: data.namaAyah || '-',
      namaIbu: data.namaIbu || '-',
      status: data.status,
      dateStr,
    });
  } catch (err) {
    console.error('Error cek-status:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}