// src/lib/firebase-admin.js
// PENTING: File ini HANYA boleh diimport dari API Routes / Server Components.
// Jangan pernah import file ini dari komponen "use client".

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Kredensial Service Account diambil dari Environment Variable,
// JANGAN pernah hardcode / commit ke git.
// Cara dapatkan: Firebase Console > Project Settings > Service Accounts > Generate New Private Key

// Private key dibaca dari base64 (FIREBASE_ADMIN_PRIVATE_KEY_BASE64) --
// ini menghindari masalah karakter newline yang sering rusak kalau
// disimpan sebagai string biasa di .env (khususnya di Windows).
// Tetap ada fallback ke format lama (FIREBASE_ADMIN_PRIVATE_KEY dengan \n
// literal) untuk backward-compatibility kalau ada environment yang masih
// pakai cara lama (misal Netlify yang belum dimigrasi).
function resolvePrivateKey() {
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
  }
  return process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: resolvePrivateKey(),
};

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore(getAdminApp());
