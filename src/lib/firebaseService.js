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
  return await deleteDoc(doc(db, "ppdb_registrations", id));
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
 */
export const checkPPDBStatus = async (nik) => {
  try {
    const q = query(collection(db, "ppdb_registrations"), where("nik", "==", nik));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Mengambil data pertama (karena NIK unik)
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() };
    }
    return null;
  } catch (error) {
    console.error("Error checking status:", error);
    throw error;
  }
};
// ==========================================
// 3. DONASI TAKJIL SERVICES (FIXED)
// ==========================================

// 1. Subscribe Data List
export const subscribeDonasiTakjil = (callback) => {
  const q = query(collection(db, 'donasi_takjil'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// 2. Subscribe Stats & Target
export const subscribeDonasiTakjilStatus = (callback) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      setDoc(docRef, { isOpen: true, collected: 0, target: 100 });
      callback({ isOpen: true, collected: 0, target: 100 });
    }
  });
};

// 3. Submit dengan Proteksi Kuota (HARD LIMIT)
export const submitDonasiTakjil = async (data) => {
  try {
    const statsRef = doc(db, 'settings', 'donasi_takjil_stats');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const { collected, target } = statsSnap.data();
      const remaining = target - collected;
      const amountToSubmit = Number(data.quantity);

      if (collected >= target) {
        return { success: false, error: "Afwan, target porsi sudah terpenuhi!" };
      }
      if (amountToSubmit > remaining) {
        return { success: false, error: `Maaf, sisa kuota hanya ${remaining} porsi lagi.` };
      }

      // PROSES SIMPAN DATA (Set isVerified: true secara otomatis)
      await addDoc(collection(db, 'donasi_takjil'), {
        studentName: data.studentName,
        studentClass: data.studentClass,
        takjilType: data.takjilType,
        amount: amountToSubmit,
        message: data.message || '',
        isVerified: true, // <--- OTOMATIS TRUE
        date: serverTimestamp()
      });

      // PROSES UPDATE TOTAL TERKUMPUL (Langsung tambah angka)
      await updateDoc(statsRef, {
        collected: increment(amountToSubmit)
      });

      return { success: true };
    }
  } catch (error) {
    console.error("Error auto-submit:", error);
    return { success: false, error: "Terjadi kesalahan koneksi." };
  }
};

// 4. Verifikasi Infaq
export const verifyDonationTakjilEntry = async (id, quantity) => {
  try {
    const docRef = doc(db, 'donasi_takjil', id);
    await updateDoc(docRef, { isVerified: true });

    const statsRef = doc(db, 'settings', 'donasi_takjil_stats');
    await updateDoc(statsRef, {
      collected: increment(Number(quantity))
    });

    Swal.fire('Berhasil!', 'Takjil telah diverifikasi.', 'success');
  } catch (error) {
    Swal.fire('Error!', 'Gagal verifikasi.', 'error');
  }
};

// 5. Hapus Data & Koreksi Total
export const deleteDonationTakjilEntry = async (id) => {
  try {
    const docRef = doc(db, 'donasi_takjil', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Karena semua otomatis terverifikasi, maka setiap hapus wajib kurangi total
      const statsRef = doc(db, 'settings', 'donasi_takjil_stats');
      await updateDoc(statsRef, {
        collected: increment(-Number(data.amount))
      });
      
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Gagal hapus:", error);
  }
};

// 6. Update Target & Status
export const updateDonasiTakjilTarget = async (newTarget) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  await updateDoc(docRef, { target: Number(newTarget) });
};

export const updateDonasiTakjilStatus = async (currentStatus) => {
  const docRef = doc(db, 'settings', 'donasi_takjil_stats');
  await updateDoc(docRef, { isOpen: !currentStatus });
};