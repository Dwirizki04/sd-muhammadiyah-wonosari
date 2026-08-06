// src/app/api/donasi-takjil/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// --- RATE LIMITING SEDERHANA (IN-MEMORY, per-IP) ---
const attemptLog = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_ATTEMPTS = 5; // wajar untuk 1 orang tua submit beberapa kali kalau salah input

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

const MAX_PORSI_PER_SUBMIT = 200;

function isValidQty(n) {
  return Number.isInteger(n) && n >= 0 && n <= MAX_PORSI_PER_SUBMIT;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
    const studentClass = typeof body.studentClass === 'string' ? body.studentClass.trim() : '';
    const qtyNasi = Number(body.qtyNasi) || 0;
    const qtyMinum = Number(body.qtyMinum) || 0;

    // --- VALIDASI INPUT ---
    if (!studentName) {
      return NextResponse.json({ success: false, error: 'Nama murid wajib diisi.' }, { status: 400 });
    }
    if (!studentClass) {
      return NextResponse.json({ success: false, error: 'Kelas wajib diisi.' }, { status: 400 });
    }
    if (!isValidQty(qtyNasi) || !isValidQty(qtyMinum)) {
      return NextResponse.json({ success: false, error: 'Jumlah porsi tidak valid.' }, { status: 400 });
    }
    if (qtyNasi === 0 && qtyMinum === 0) {
      return NextResponse.json(
        { success: false, error: 'Isi jumlah porsi Nasi Box atau Minuman.' },
        { status: 400 }
      );
    }

    const statsRef = adminDb.collection('settings').doc('donasi_takjil_stats');
    const takjilCollection = adminDb.collection('donasi_takjil');

    // --- TRANSACTION: cek kuota & update counter secara atomic ---
    // Ini mencegah race condition: kalau 2 orang submit bersamaan saat kuota
    // tersisa sedikit, transaction memastikan tidak ada yang "lolos" melebihi
    // target karena Firestore akan retry otomatis jika ada konflik baca-tulis.
    const result = await adminDb.runTransaction(async (tx) => {
      const statsSnap = await tx.get(statsRef);
      const stats = statsSnap.exists ? statsSnap.data() : {};

      if (stats.isOpen === false) {
        return { success: false, error: 'Program sedekah takjil sudah ditutup.' };
      }

      const targetNasi = Number(stats.targetNasi) || 0;
      const targetMinuman = Number(stats.targetMinuman) || 0;
      const collectedNasi = Number(stats.collectedNasi) || 0;
      const collectedMinuman = Number(stats.collectedMinuman) || 0;

      const sisaNasi = targetNasi > 0 ? Math.max(0, targetNasi - collectedNasi) : Infinity;
      const sisaMinum = targetMinuman > 0 ? Math.max(0, targetMinuman - collectedMinuman) : Infinity;

      if (qtyNasi > sisaNasi && targetNasi > 0) {
        return { success: false, error: `Sisa Nasi Box hanya ${sisaNasi} porsi.` };
      }
      if (qtyMinum > sisaMinum && targetMinuman > 0) {
        return { success: false, error: `Sisa Minuman hanya ${sisaMinum} porsi.` };
      }

      const statsUpdate = { updatedAt: FieldValue.serverTimestamp() };

      if (qtyNasi > 0) {
        const newDocRef = takjilCollection.doc();
        tx.set(newDocRef, {
          studentName,
          studentClass,
          takjilType: 'Nasi Box',
          amount: qtyNasi,
          isVerified: true,
          date: FieldValue.serverTimestamp(),
        });
        statsUpdate.collectedNasi = FieldValue.increment(qtyNasi);
      }

      if (qtyMinum > 0) {
        const newDocRef = takjilCollection.doc();
        tx.set(newDocRef, {
          studentName,
          studentClass,
          takjilType: 'Minuman',
          amount: qtyMinum,
          isVerified: true,
          date: FieldValue.serverTimestamp(),
        });
        statsUpdate.collectedMinuman = FieldValue.increment(qtyMinum);
      }

      tx.set(statsRef, statsUpdate, { merge: true });

      return { success: true };
    });

    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err) {
    console.error('Error donasi-takjil:', err);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}