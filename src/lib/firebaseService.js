import { db, storage } from './firebase';
import { 
  collection, query, orderBy, onSnapshot, doc, 
  deleteDoc, updateDoc, setDoc, serverTimestamp, where, getDocs, addDoc, 
  increment,getDoc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Swal from 'sweetalert2';

// PPDB Status Switch
export const subscribePPDBStatus = (callback) => {
  const docRef = doc(db, "settings", "ppdb_config");
  return onSnapshot(docRef, (snap) => {
    callback(snap.exists() ? snap.data().isOpen : false);
  }, (err) => { console.error("Permission Error PPDB Status:", err); callback(false); });
};

export const updatePPDBStatus = async (newStatus) => {
  const docRef = doc(db, "settings", "ppdb_config");
  return await setDoc(docRef, { isOpen: newStatus, updatedAt: serverTimestamp() }, { merge: true });
};

// --- Kuota Pendaftaran PPDB (mencegah pendaftaran membludak) ---
// Dipakai bareng subscribePPDBStatus (jangan hapus itu, form pendaftaran
// publik masih pakai fungsi itu apa adanya untuk cek buka/tutup).
export const subscribePPDBConfig = (callback) => {
  const docRef = doc(db, "settings", "ppdb_config");
  return onSnapshot(docRef, (snap) => {
    const data = snap.exists() ? snap.data() : {};
    callback({
      isOpen: data.isOpen === true,
      kuota: Number(data.kuota) || 0, // 0 = tanpa batas
      totalPendaftar: Number(data.totalPendaftar) || 0,
    });
  }, (err) => {
    console.error("Permission Error PPDB Config:", err);
    callback({ isOpen: false, kuota: 0, totalPendaftar: 0 });
  });
};

export const updatePPDBKuota = async (newKuota) => {
  const docRef = doc(db, "settings", "ppdb_config");
  return await setDoc(docRef, { kuota: Number(newKuota) || 0, updatedAt: serverTimestamp() }, { merge: true });
};

// Reset counter totalPendaftar -- dipakai kalau admin mau buka gelombang
// pendaftaran baru (misal tahun ajaran berikutnya) tanpa menghapus data lama.
export const resetPPDBCounter = async () => {
  const docRef = doc(db, "settings", "ppdb_config");
  return await setDoc(docRef, { totalPendaftar: 0, updatedAt: serverTimestamp() }, { merge: true });
};

// Hitung ulang totalPendaftar dari jumlah dokumen ppdb_registrations yang
// SUNGGUHAN ada di database, lalu perbaiki angkanya di settings/ppdb_config.
// Dipakai untuk memperbaiki counter yang kebetulan meleset (misal dari bug
// versi lama yang belum mengurangi counter saat hapus data).
export const syncPPDBCounter = async () => {
  const snap = await getDocs(collection(db, "ppdb_registrations"));
  const realCount = snap.size;
  const docRef = doc(db, "settings", "ppdb_config");
  await setDoc(docRef, { totalPendaftar: realCount, updatedAt: serverTimestamp() }, { merge: true });
  return realCount;
};

// PPDB Data List
export const subscribePPDB = (callback) => {
  const q = query(collection(db, "ppdb_registrations"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => { console.error("Permission Error PPDB Data:", err); callback([]); });
};

export const updateStatusPPDB = async (id, newStatus) => {
  return await updateDoc(doc(db, "ppdb_registrations", id), { status: newStatus });
};

export const deletePPDBEntry = async (id) => {
  // PENTING: hapus dokumen pendaftar SEKALIGUS turunkan counter
  // totalPendaftar di settings/ppdb_config -- kalau tidak, counter kuota
  // akan terus "menganggap" pendaftar yang sudah dihapus masih ada,
  // sehingga kuota tersisa jadi tidak akurat (lebih kecil dari yang
  // seharusnya) dan pendaftaran bisa ditolak padahal kuota sebenarnya
  // masih longgar.
  const configRef = doc(db, "settings", "ppdb_config");
  await deleteDoc(doc(db, "ppdb_registrations", id));
  return await updateDoc(configRef, { totalPendaftar: increment(-1) });
};


/**
 * --- NEWS SERVICES ---
 */
// Sebaiknya gunakan env variable untuk keamanan
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "99a8e60c-6a0b-447a-aaa9-5e98458d8567";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dljj4lfvt";

export const uploadNewsImage = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw new Error("Gagal mengunggah ke Cloudinary");
  }
};

export const createNews = async (newsData) => {
  return await addDoc(collection(db, "news"), {
    ...newsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const subscribeNews = (callback) => {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const deleteNews = async (id, imageUrl) => {
  await deleteDoc(doc(db, "news", id));
  
  // CATATAN: Jika imageUrl berasal dari Cloudinary, kode deleteObject di bawah ini 
  // TIDAK AKAN BERJALAN. Hapus bagian ini jika kamu tidak menggunakan Firebase Storage untuk gambar berita.
  if (imageUrl && imageUrl.includes("firebasestorage")) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Gagal hapus di Firebase Storage:", error);
    }
  }
};

/**
 * --- SETTINGS ---
 */
export const updateThemeSettings = async (themeData) => {
  const docRef = doc(db, "settings", "appearance");
  // Gunakan setDoc agar tidak error jika dokumen 'appearance' belum ada
  return await setDoc(docRef, themeData, { merge: true });
};

/**
 * --- Check Status PPDB for Public ---
 * PENTING: Fungsi-fungsi di bawah ini SENGAJA tidak lagi query Firestore
 * langsung dari client (`where("nik", "==", nik)`), karena itu membuat NIK
 * bisa ditebak-tebak (enumerasi) langsung lewat Firebase client SDK dari
 * DevTools browser, tanpa melalui form/UI sama sekali. Sekarang lewat API
 * Route server-side yang menerapkan rate-limiting per-IP.
 */

export const checkPPDBStatus = async (nik) => {
  const res = await fetch('/api/cek-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nik }),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memeriksa status.');
  }
  return await res.json();
};

export const isNikAlreadyRegistered = async (nik) => {
  const res = await fetch('/api/check-nik', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nik }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memeriksa NIK.');
  }
  const data = await res.json();
  return data.exists;
};

// Alias, dipertahankan supaya kode lama yang memanggil checkNikExists tidak rusak
export const checkNikExists = isNikAlreadyRegistered;

// ==========================================
// 2. DONASI TAKJIL SERVICES (BISA DUA SEKALIGUS)
// ==========================================
/**
 * --- DONASI TAKJIL SERVICES (FIXED) ---
 */
export const subscribeDonasiTakjil = (callback) => {
  const q = query(collection(db, 'donasi_takjil'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => { callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
};

// FIX: Menghapus setDoc otomatis agar tidak terjadi reset data saat glitch koneksi
export const subscribeDonasiTakjilStatus = (callback) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        isOpen: data.isOpen ?? true,
        collectedNasi: Number(data.collectedNasi) || 0,
        targetNasi: Number(data.targetNasi) || 0,
        collectedMinuman: Number(data.collectedMinuman) || 0,
        targetMinuman: Number(data.targetMinuman) || 0
      });
    } else {
      // Jika dokumen belum ada, kirim data default ke UI saja, jangan tulis ke DB dulu
      callback({ isOpen: true, collectedNasi: 0, targetNasi: 400, collectedMinuman: 0, targetMinuman: 400 });
    }
  });
};

export const submitDonasiTakjil = async (data) => {
  try {
    const statsRef = doc(db, 'settings', 'donasi_takjil_stats');
    
    // Gunakan setDoc dengan merge: true agar dokumen tercipta jika belum ada tanpa menghapus data
    await setDoc(statsRef, { updatedAt: serverTimestamp() }, { merge: true });
    
    const statsSnap = await getDoc(statsRef);
    const stats = statsSnap.data();
    const qtyNasi = Number(data.qtyNasi) || 0;
    const qtyMinum = Number(data.qtyMinum) || 0;
    
    const currentCollectedNasi = Number(stats.collectedNasi) || 0;
    const currentCollectedMinuman = Number(stats.collectedMinuman) || 0;
    const targetNasi = Number(stats.targetNasi) || 0;
    const targetMinuman = Number(stats.targetMinuman) || 0;

    const sisaNasi = targetNasi > 0 ? Math.max(0, targetNasi - currentCollectedNasi) : 999;
    const sisaMinum = targetMinuman > 0 ? Math.max(0, targetMinuman - currentCollectedMinuman) : 999;

    if (qtyNasi > sisaNasi && targetNasi > 0) return { success: false, error: `Sisa Nasi Box hanya ${sisaNasi} porsi.` };
    if (qtyMinum > sisaMinum && targetMinuman > 0) return { success: false, error: `Sisa Minuman hanya ${sisaMinum} porsi.` };

    const promises = [];
    const statsUpdate = {};

    if (qtyNasi > 0) {
      promises.push(addDoc(collection(db, 'donasi_takjil'), {
        studentName: data.studentName, studentClass: data.studentClass,
        takjilType: 'Nasi Box', amount: qtyNasi, isVerified: true, date: serverTimestamp()
      }));
      statsUpdate.collectedNasi = increment(qtyNasi);
    }

    if (qtyMinum > 0) {
      promises.push(addDoc(collection(db, 'donasi_takjil'), {
        studentName: data.studentName, studentClass: data.studentClass,
        takjilType: 'Minuman', amount: qtyMinum, isVerified: true, date: serverTimestamp()
      }));
      statsUpdate.collectedMinuman = increment(qtyMinum);
    }

    await Promise.all(promises);
    await updateDoc(statsRef, statsUpdate);
    return { success: true };
  } catch (error) {
    console.error("Submit Error:", error);
    return { success: false, error: "Gagal menyimpan data." };
  }
};

export const updateDonasiTakjilTarget = async (type, newValue) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  // Gunakan updateDoc agar hanya field target yang berubah
  await updateDoc(docRef, { [type === 'Nasi Box' ? 'targetNasi' : 'targetMinuman']: Number(newValue) });
};

export const updateDonasiTakjilStatus = async (currentStatus) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  await updateDoc(docRef, { isOpen: !currentStatus });
};

export const deleteDonationTakjilEntry = async (id) => {
  try {
    const docRef = doc(db, 'donasi_takjil', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const isNasi = data.takjilType === 'Nasi Box';
      await updateDoc(doc(db, 'settings', 'donasi_takjil_stats'), {
        [isNasi ? 'collectedNasi' : 'collectedMinuman']: increment(-Number(data.amount || 0))
      });
      await deleteDoc(docRef);
    }
  } catch (error) { console.error("Delete Error:", error); }
};