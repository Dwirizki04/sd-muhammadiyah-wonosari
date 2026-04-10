"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'; 
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// --- 1. KOMPONEN ANIMASI ANGKA (HERO STATS) ---
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100, duration: 2000 });

  useEffect(() => { if (isInView) motionValue.set(value); }, [isInView, value, motionValue]);
  useEffect(() => {
    return springValue.on("change", (latest) => { if (ref.current) ref.current.textContent = Math.floor(latest); });
  }, [springValue]);

  return <span ref={ref} className="number">0</span>;
}

// --- 2. KOMPONEN SLIDER GAMBAR BERITA (2 FOTO) ---
function NewsSlider({ images, title }) {
  const [index, setIndex] = useState(0);

  // Auto-slide setiap 4 detik jika ada lebih dari 1 gambar
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  // Fallback jika tidak ada gambar
  const displayImages = images && images.length > 0 ? images : ['/placeholder.png'];

  return (
    <div style={sliderContainerStyle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <Image 
            src={displayImages[index]} 
            alt={`${title} - ${index + 1}`} 
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </motion.div>
      </AnimatePresence>

      {/* Indikator Titik Navigasi (Hanya muncul jika ada 2 foto) */}
      {displayImages.length > 1 && (
        <div style={dotContainerStyle}>
          {displayImages.map((_, i) => (
            <div 
              key={i} 
              style={{
                ...dotStyle,
                backgroundColor: i === index ? '#1a5d1a' : 'rgba(255,255,255,0.6)',
                width: i === index ? '20px' : '8px'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 3. HALAMAN UTAMA (HOME) ---
export default function Home() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mengambil data berita secara real-time dari Firebase
  useEffect(() => {
    const qNews = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubNews = onSnapshot(qNews, (snap) => {
      setNewsData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubNews();
  }, []);

  // Data Galeri Statis
  const galleryData = [
    { image: '/images/TS1.jpg', title: 'Kelas Takhassus' },
    { image: '/images/Sholat.jpg', title: 'Sholat Berjamaah' },
    { image: '/images/LS2.jpg', title: 'Praktek Memasak' },
    { image: '/images/oc1.jpg', title: 'Outing Class' },
    { image: '/images/Drumband DIY.jpg', title: 'Drumband' },
    { image: '/images/LS3.jpg', title: 'Berkebun' },
  ];

  const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const scaleUp = { hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } } };

  return (
    <div className="main-wrapper">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <motion.div variants={scaleUp} initial="hidden" animate="visible" className="school-badge">
              <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={80} height={80} priority />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="school-name">
              SD Muhammadiyah Wonosari
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="school-tagline">
              Mencetak Generasi Qurani, Prestasi Tiada Henti
            </motion.p>
            <div className="hero-stats">
              <div className="stat"><AnimatedCounter value={338} /><span className="label">Siswa Aktif</span></div>
              <div className="stat"><AnimatedCounter value={23} /><span className="label">Guru Profesional</span></div>
              <div className="stat"><AnimatedCounter value={13} /><span className="label">Ruang Kelas</span></div>
              <div className="stat"><AnimatedCounter value={1963} /><span className="label">Tahun Berdiri</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM UNGGULAN */}
      <section className="programs-section">
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="section-title">Program Unggulan</motion.h2>
          <div className="programs-grid">
            {[
              { title: "Kelas Takhassus", icon: "fas fa-quran", desc: "Program khusus tahfidz Quran dengan target hafalan." },
              { title: "Pembiasaan Sholat", icon: "fas fa-pray", desc: "Sholat dhuha dan dhuhur berjamaah setiap hari." },
              { title: "Pendidikan Karakter", icon: "fas fa-hands-helping", desc: "Penguatan karakter Islami dan kepedulian sosial." },
              { title: "Life Skill", icon: "fas fa-tools", desc: "Memasak, berkebun, dan kerajinan untuk kemandirian." }
            ].map((item, index) => (
              <motion.div key={index} className="program-card" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ delay: index * 0.1 }}>
                <div className="program-content">
                  <div className="benefit-icon"><i className={item.icon}></i></div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link href="/unggulan" className="program-link">Selengkapnya <i className="fas fa-arrow-right"></i></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BERITA TERKINI - VERSI SLIDER */}
      <section className="news-section">
        <div className="container">
          <motion.h2 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="section-title"
          >
            Berita Terkini
          </motion.h2>

          <div className="news-grid">
            {newsData.length > 0 ? newsData.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="news-card" 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeInUp} 
                transition={{ delay: index * 0.1 }}
              >
                {/* Komponen Slider untuk Gambar Berita */}
                <NewsSlider images={item.images} title={item.title} />

                <div className="news-content">
                  <div className="news-date">{item.date}</div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </motion.div>
            )) : !loading && (
              <p style={{textAlign: 'center', gridColumn: '1/-1', color: '#888'}}>
                Belum ada berita terbaru.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* GALERI KEGIATAN */}
      <section className="gallery-section" style={{background: '#f8f9fa'}}>
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="section-title">Galeri Kegiatan</motion.h2>
          <div className="gallery-grid">
            {galleryData.map((item, index) => (
              <motion.div key={index} className="program-card" style={{border: 'none'}} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                <div className="program-image" style={{height: '250px'}}>
                  <Image src={item.image} alt={item.title} width={400} height={300} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
                <div style={{padding: '15px', textAlign: 'center', fontWeight: 'bold'}}>{item.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- 4. STYLES KHUSUS SLIDER (Letakkan di bawah agar tidak ada ReferenceError) ---
const sliderContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '240px',
  overflow: 'hidden',
  borderRadius: '15px 15px 0 0',
  backgroundColor: '#f1f5f9'
};

const dotContainerStyle = {
  position: 'absolute',
  bottom: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '6px',
  zIndex: 10
};

const dotStyle = {
  height: '8px',
  borderRadius: '4px',
  transition: 'all 0.3s ease'
};