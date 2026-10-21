import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Pastikan Firebase hanya jalan satu kali dan tidak error saat build
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// --- LOCAL EMULATOR SUITE ---
// Aktif HANYA kalau NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true di .env.local.
// Sengaja pakai env variable eksplisit (bukan cuma cek NODE_ENV) supaya
// tidak ada kejadian "kelupaan" development tembus ke database production
// -- dan sebaliknya, developer bisa dengan sengaja mematikannya kalau
// suatu saat memang perlu test terhadap data production dari localhost.
//
// PENTING: variable ini JANGAN pernah di-set di environment Netlify/production.
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// Guard globalThis supaya tidak connect dua kali saat Fast Refresh/HMR
// (connectFirestoreEmulator dkk akan throw error kalau dipanggil lebih
// dari sekali pada instance yang sama).
if (useEmulator && typeof window !== 'undefined' && !globalThis.__firebaseEmulatorsConnected) {
  connectFirestoreEmulator(db, '127.0.0.1', 8090);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  globalThis.__firebaseEmulatorsConnected = true;
  console.log('%c[DEV] Terhubung ke Firebase Local Emulator Suite -- BUKAN data production.', 'color: orange; font-weight: bold;');
}
