"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DetailBeritaPage() {
  const params = useParams();
  const router = useRouter();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      if (!params?.id) return;
      try {
        const docRef = doc(db, "news", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBerita({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Gagal mengambil berita:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, [params?.id]);

  if (loading) {
    return <div style={s.centerBox}>⌛ Memuat Artikel...</div>;
  }

  if (!berita) {
    return (
      <div style={s.centerBox}>
        <h2>Artikel Tidak Ditemukan</h2>
        <Link href="/" style={s.btnBack}>← Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div style={s.pageBg}>
      <div style={s.container}>
        {/* Tombol Kembali */}
        <Link href="/" style={s.btnBack}>
          ← Kembali ke Beranda
        </Link>

        <motion.article 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          style={s.articleCard}
        >
          {/* Header Berita */}
          <header style={s.header}>
            <span style={s.dateBadge}>📅 {berita.date || 'Berita SDM'}</span>
            <h1 style={s.title}>{berita.title}</h1>
          </header>

          {/* Galeri / Gambar Utama */}
          {berita.images && berita.images.length > 0 && (
            <div style={s.imageGallery}>
              {berita.images.map((imgUrl, idx) => (
                <div key={idx} style={s.imgWrapper}>
                  <img src={imgUrl} alt={`${berita.title} - ${idx + 1}`} style={s.image} />
                </div>
              ))}
            </div>
          )}

          {/* Isi Lengkap Berita (Rata Kanan-Kiri & Paragraf Rapi) */}
          <div style={s.content}>
            {berita.excerpt}
          </div>
        </motion.article>
      </div>
    </div>
  );
}

// --- STYLES ---
const s = {
  pageBg: { background: '#f8fafc', minHeight: '100vh', padding: '100px 20px 60px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  container: { maxWidth: '800px', margin: '0 auto' },
  centerBox: { minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', color: '#1a5d1a' },
  btnBack: { display: 'inline-block', marginBottom: '25px', color: '#1a5d1a', textDecoration: 'none', fontWeight: '800', fontSize: '0.95rem' },
  articleCard: { background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' },
  header: { marginBottom: '30px' },
  dateBadge: { background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' },
  title: { color: '#1e293b', fontSize: '2rem', fontWeight: '900', marginTop: '15px', lineHeight: '1.3' },
  imageGallery: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' },
  imgWrapper: { borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  image: { width: '100%', height: 'auto', display: 'block', objectFit: 'cover' },
  
  // KUNCI TEXT PARAGRAF & RATA KANAN-KIRI
  content: {
    color: '#334155',
    fontSize: '1.1rem',
    lineHeight: '1.8',
    textAlign: 'justify',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word'
  }
};