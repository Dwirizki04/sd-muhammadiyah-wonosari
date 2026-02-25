import { db } from './firebase';
import { 
  collection, doc, onSnapshot, updateDoc, 
  query, orderBy, increment, serverTimestamp, deleteDoc 
} from 'firebase/firestore';

/**
 * --- DONATION STATS SERVICES ---
 */

// 1. Ambil statistik donasi secara real-time
export const subscribeDonationStats = (callback) => {
  const docRef = doc(db, "site_settings", "donation_stats");
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  }, (err) => console.error("Gagal memuat statistik:", err));
};

// 2. Toggle Status Program (Buka/Tutup)
export const toggleProgramStatus = async (currentStatus) => {
  const docRef = doc(db, "site_settings", "donation_stats");
  return await updateDoc(docRef, { 
    isOpen: !currentStatus 
  });
};

// 3. Reset Jumlah Dana (Fungsi yang menyebabkan Error Build)
export const resetCollectedAmount = async () => {
  const docRef = doc(db, "site_settings", "donation_stats");
  return await updateDoc(docRef, { 
    collected: 0,
    lastResetAt: serverTimestamp()
  });
};

/**
 * --- DONATION LIST SERVICES ---
 */

// 4. Ambil daftar riwayat donasi
export const subscribeDonations = (callback) => {
  const q = query(collection(db, "donations"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (err) => {
    console.error("Gagal memuat daftar donasi:", err);
    callback([]);
  });
};

// 5. Verifikasi Donasi (Menambah jumlah ke total terkumpul)
export const verifyDonationEntry = async (id, amount) => {
  const donationRef = doc(db, "donations", id);
  const statsRef = doc(db, "site_settings", "donation_stats");

  // 1. Ubah status donasi menjadi terverifikasi
  await updateDoc(donationRef, { 
    isVerified: true,
    verifiedAt: serverTimestamp() 
  });

  // 2. Tambahkan nominal donasi ke total terkumpul secara otomatis
  return await updateDoc(statsRef, { 
    collected: increment(amount) 
  });
};

// 6. Hapus Donasi
export const removeDonationEntry = async (id) => {
  return await deleteDoc(doc(db, "donations", id));
};