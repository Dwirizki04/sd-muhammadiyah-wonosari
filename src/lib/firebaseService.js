import { db, auth } from './firebase';
import { 
  collection, query, orderBy, onSnapshot, doc, 
  deleteDoc, updateDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/** * --- PPDB SERVICES ---
 */

// Mengambil data pendaftar secara real-time
export const subscribePPDB = (callback) => {
  const q = query(collection(db, "ppdb_registrations"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// Update status (Diterima/Ditolak)
export const updateStatusPPDB = async (id, newStatus) => {
  const docRef = doc(db, "ppdb_registrations", id);
  return await updateDoc(docRef, { 
    status: newStatus,
    updatedAt: serverTimestamp() 
  });
};

// Hapus pendaftar
export const deletePPDBEntry = async (id) => {
  return await deleteDoc(doc(db, "ppdb_registrations", id));
};


/**
 * --- NEWS SERVICES ---
 */
const CLOUDINARY_UPLOAD_PRESET = "99a8e60c-6a0b-447a-aaa9-5e98458d8567"; // Ganti dengan Upload Preset (Unsigned)
const CLOUDINARY_CLOUD_NAME = "dljj4lfvt";     // Ganti dengan Cloud Name kamu

// 1. Upload Gambar ke Cloudinary
export const uploadNewsImage = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url; // Mengembalikan URL gambar yang sudah dioptimasi
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Gagal mengunggah gambar ke Cloudinary");
  }
};

// 2. Simpan Data Berita ke Firestore (Tetap Sama)
export const createNews = async (newsData) => {
  const { db } = await import("./firebase"); // Import dinamis jika perlu
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  
  return await addDoc(collection(db, "news"), {
    ...newsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// 3. Ambil Berita secara Real-time
export const subscribeNews = (callback) => {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// 4. Hapus Berita (Data & Gambar jika ada)
export const deleteNews = async (id, imageUrl) => {
  // Hapus dokumen di Firestore
  await deleteDoc(doc(db, "news", id));
  
  // Jika ada gambar di storage, hapus juga agar tidak menumpuk
  if (imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Gagal menghapus gambar di storage:", error);
    }
  }
};

/** * --- DONASI & SETTINGS (Persiapan) ---
 */
export const updateThemeSettings = async (themeData) => {
  return await updateDoc(doc(db, "settings", "appearance"), themeData);
};