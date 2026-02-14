import { db } from './firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

// 1. Pantau Status Tema secara Real-time
export const subscribeThemeMode = (callback) => {
  return onSnapshot(doc(db, "site_settings", "theme"), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().isRamadhanMode);
    }
  });
};

// 2. Fungsi Toggle Mode Ramadhan
export const updateRamadhanMode = async (currentStatus) => {
  const themeRef = doc(db, "site_settings", "theme");
  return await updateDoc(themeRef, { 
    isRamadhanMode: !currentStatus 
  });
};