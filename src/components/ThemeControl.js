"use client";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import RamadanTheme from "@/themes/RamadanTheme";
import LayoutWrapper from "@/components/LayoutWrapper";
import FloatingDonasi from "@/components/FloatingDonasi";

export default function ThemeControl({ children }) {
  const [isRamadhan, setIsRamadhan] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_settings", "theme"), (docSnap) => {
      if (docSnap.exists()) {
        setIsRamadhan(docSnap.data().isRamadhanMode);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  // LOGIKA: Jika Ramadhan ON dan di Beranda, tampilkan RamadanTheme sebagai konten utamanya
  const content = (isRamadhan && pathname === '/') ? <RamadanTheme /> : children;

  return (
    <LayoutWrapper>
      {content}
      <FloatingDonasi />
    </LayoutWrapper>
  );
}