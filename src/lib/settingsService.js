import { db } from './firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

// Daftar tema yang tersedia. Tambahkan di sini kalau nanti bikin tema baru lagi.
export const AVAILABLE_THEMES = [
  { id: 'default', label: 'Normal (Default)' },
  { id: 'ramadhan', label: 'Ramadhan' },
  { id: 'independence', label: 'Kemerdekaan 17 Agustus' },
];

// 1. Pantau tema aktif secara real-time.
// Mundur-kompatibel dengan data lama (field `isRamadhanMode`) supaya tidak
// ada downtime saat migrasi: kalau field baru `activeTheme` belum ada tapi
// field lama `isRamadhanMode: true` masih ada, tetap dianggap 'ramadhan'.
export const subscribeThemeMode = (callback) => {
  return onSnapshot(doc(db, 'site_settings', 'theme'), (docSnap) => {
    if (!docSnap.exists()) {
      callback('default');
      return;
    }
    const data = docSnap.data();
    if (data.activeTheme) {
      callback(data.activeTheme);
    } else if (data.isRamadhanMode) {
      callback('ramadhan');
    } else {
      callback('default');
    }
  });
};

// 2. Ganti tema aktif
export const updateActiveTheme = async (themeId) => {
  const themeRef = doc(db, 'site_settings', 'theme');
  // setDoc + merge supaya tetap jalan walau dokumennya belum pernah dibuat sebelumnya
  return await setDoc(themeRef, { activeTheme: themeId }, { merge: true });
};

// Dipertahankan supaya kode lama yang masih memanggil updateRamadhanMode tidak rusak.
// Sebaiknya migrasi ke updateActiveTheme('ramadhan') / updateActiveTheme('default').
export const updateRamadhanMode = async (currentStatus) => {
  return await updateActiveTheme(currentStatus ? 'default' : 'ramadhan');
};
