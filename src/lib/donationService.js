import { db } from './firebase';
import { 
  collection, doc, onSnapshot, updateDoc, 
  increment, query, orderBy 
} from 'firebase/firestore';

/**
 * --- DONATION STATS SERVICES ---
 */

// 1. Pantau statistik dan status buka/tutup secara real-time
export const subscribeDonationStats = (callback) => {
  return onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
    if (doc.exists()) callback(doc.data());
  });
};

// 2. Toggle Status Buka/Tutup Program
export const toggleProgramStatus = async (currentStatus) => {
  return await updateDoc(doc(db, "site_settings", "donation_stats"), { 
    isOpen: !currentStatus 
  });
};

// 3. Reset Dana Terkumpul ke Rp 0
export const resetCollectedAmount = async () => {
  return await updateDoc(doc(db, "site_settings", "donation_stats"), { 
    collected: 0 
  });
};

/**
 * --- DONATION LIST SERVICES ---
 */

// 4. Pantau semua riwayat donasi
export const subscribeDonations = (callback) => {
  const q = query(collection(db, "donations"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// 5. Verifikasi Donasi (Update status dan Tambah ke Total Dana)
export const verifyDonationEntry = async (donasiId, amount) => {
  await updateDoc(doc(db, "donations", donasiId), { status: "verified" });
  return await updateDoc(doc(db, "site_settings", "donation_stats"), {
    collected: increment(amount)
  });
};