// src/lib/newsService.js

import { db } from './firebase';
import { 
  collection, addDoc, onSnapshot, deleteDoc, 
  doc, serverTimestamp, query, orderBy, updateDoc 
} from 'firebase/firestore';

// 1. Upload Banyak Gambar ke Cloudinary (Paralel & Fleksibel)
export const uploadMultipleToCloudinary = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = Array.from(files).map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    
    if (!res.ok) throw new Error("Gagal mengunggah gambar ke Cloudinary");
    
    const data = await res.json();
    return data.secure_url;
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (err) {
    console.error("Cloudinary Error:", err);
    return [];
  }
};

// 2. Simpan Berita Baru ke Firestore
export const createNewsEntry = async (title, excerpt, imageUrls) => {
  return await addDoc(collection(db, "news"), {
    title,
    excerpt,
    images: imageUrls, // Array berisi URL gambar
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    createdAt: serverTimestamp()
  });
};

// 3. Update / Edit Berita yang Sudah Ada
export const updateNewsEntry = async (id, title, excerpt, imageUrls) => {
  const docRef = doc(db, "news", id);
  return await updateDoc(docRef, {
    title,
    excerpt,
    images: imageUrls,
    updatedAt: serverTimestamp() // Mencatat waktu perubahan
  });
};

// 4. Pantau Berita Real-time
export const subscribeNews = (callback) => {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

// 5. Hapus Berita
export const removeNewsEntry = async (id) => {
  return await deleteDoc(doc(db, "news", id));
};