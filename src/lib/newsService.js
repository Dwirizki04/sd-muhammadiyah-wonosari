import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

// 1. Logic Cloudinary
export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    return data.secure_url || null;
  } catch (err) {
    console.error("Cloudinary Error:", err);
    return null;
  }
};

// 2. Logic Firestore: Subscribe
export const subscribeNews = (callback) => {
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

// 3. Logic Firestore: Create
export const createNewsEntry = async (title, excerpt, imageUrl) => {
  return await addDoc(collection(db, "news"), {
    title,
    excerpt,
    image: imageUrl,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    createdAt: serverTimestamp()
  });
};

// 4. Logic Firestore: Delete
export const removeNewsEntry = async (id) => {
  return await deleteDoc(doc(db, "news", id));
};