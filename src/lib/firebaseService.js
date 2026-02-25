import { db, storage } from './firebase';
import { 
  collection, query, orderBy, onSnapshot, doc, 
  deleteDoc, updateDoc, setDoc, serverTimestamp, where, getDocs 
} from 'firebase/firestore';

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