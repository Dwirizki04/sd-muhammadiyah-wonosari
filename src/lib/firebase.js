// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Konfigurasi dari file lama Anda
const firebaseConfig = {
  apiKey: "AIzaSyA0hZ7aqfCuIgxXarhZ19XqK7Nqi69H-DQ",
  authDomain: "ppdb-sdmuri.firebaseapp.com",
  projectId: "ppdb-sdmuri",
  storageBucket: "ppdb-sdmuri.firebasestorage.app",
  messagingSenderId: "1011176808480",
  appId: "1:1011176808480:web:eb9e27019f13e57ca01c45"
};

// Logika Singleton (Agar tidak error "Firebase already initialized" saat development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };