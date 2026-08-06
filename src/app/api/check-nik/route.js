// src/app/api/check-nik/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Rate limiting in-memory sederhana (lihat catatan yang sama di /api/cek-status/route.js)
const attemptLog = new Map();
const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_ATTEMPTS = 10; // sedikit lebih longgar karena ini dipanggil legit saat isi form

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

function isValidNik(nik) {
  return typeof nik === 'string' && /^\d{16}$/.test(nik);
}

export async function POST(request) {
  try {
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

    const { nik } = await request.json();

    if (!isValidNik(nik)) {
      return NextResponse.json({ error: 'Format NIK tidak valid.' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('ppdb_registrations')
      .where('nik', '==', nik)
      .limit(1)
      .get();

    // Hanya kembalikan boolean — tidak ada data pribadi sama sekali di response ini.
    return NextResponse.json({ exists: !snapshot.empty });
  } catch (err) {
    console.error('Error check-nik:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}