// src/components/FloatingDonasi.jsx
"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function FloatingDonasi() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
      if (doc.exists()) setIsVisible(doc.data().isOpen);
    });
    return () => unsub();
  }, []);

  if (!isVisible) return null; // Tombol tidak akan di-render jika isOpen = false

  return (
    <Link href="/donasi" className="floating-donasi">
      <div className="icon-box"><i className="fas fa-hand-holding-heart"></i></div>
      <span className="btn-text">Wakaf Kelas</span>
    </Link>
  );
}