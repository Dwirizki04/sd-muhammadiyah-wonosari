// src/themes/DefaultTheme.jsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'; 
import { useEffect, useRef } from 'react';

// --- KOMPONEN ANIMASI ANGKA ---
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    damping: 30, 
    stiffness: 100, 
    duration: 2000 
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest);
      }
    });
  }, [springValue]);

  return <span ref={ref} className="number">0</span>;
}

export default function DefaultTheme() {
  // Data Statis Berita
  const newsData = [
    {
      title: 'Rapat Komite & POT',
      date: '10 Desember 2025',
      excerpt: 'Rapat laporan kegiatan semester 1 dan evaluasi pembelajaran.',
      image: '/images/laporan kegiatan.jpg',
    },
    {
      title: 'Siswa Meraih Juara 1',
      date: '23 November 2025',
      excerpt: 'Juara 1 dan Pesilat Terbaik kelas Usia Dini II Kategori A Putra.',
      image: '/images/Tapaksuci1.jpg',
    },
    {
      title: 'Borong Medali Tapak Suci',
      date: '21 November 2025',
      excerpt: 'Meraih tiga emas, lima perak, dan tiga perunggu di PDM CUP #4.',
      image: '/images/Tapaksuci.jpg',
    },
    {
      title: 'SABIT (Sabtu Bina Iman)',
      date: '15 November 2025',
      excerpt: 'Kegiatan SABIT Kelas VI Dalam Rangka Menghadapi TKA.',
      image: '/images/mabit.jpg',
    }
  ];

  // Data Statis Galeri
  const galleryData = [
    { image: '/images/TS1.jpg', title: 'Kelas Takhassus' },
    { image: '/images/Sholat.jpg', title: 'Sholat Berjamaah' },
    { image: '/images/LS2.jpg', title: 'Praktek Memasak' },
    { image: '/images/oc1.jpg', title: 'Outing Class' },
    { image: '/images/Drumband DIY.jpg', title: 'Drumband' },
    { image: '/images/LS3.jpg', title: 'Berkebun' },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const scaleUp = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 0.5 } 
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <motion.div variants={scaleUp} initial="hidden" animate="visible" className="school-badge">
              <Image src="/images/logo sdm woonsa.jpg" alt="Logo" width={80} height={80} priority />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="school-name">
              SD Muhammadiyah Wonosari
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="school-tagline">
              Mencetak Generasi Qurani, Prestasi Tiada Henti
            </motion.p>
            
            <div className="hero-stats">
              <div className="stat"><AnimatedCounter value={337} /><span className="label">Siswa Aktif</span></div>
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

      {/* BERITA TERKINI */}
      <section className="news-section">
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="section-title">Berita Terkini</motion.h2>
          <div className="news-grid">
            {newsData.map((item, index) => (
              <motion.div key={index} className="news-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: index * 0.1 }}>
                <div className="news-image">
                  <Image src={item.image} alt={item.title} width={400} height={250} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <div className="news-content">
                  <div className="news-date" style={{fontSize: '0.85rem', color: '#888', marginBottom: '5px'}}>{item.date}</div>
                  <h3 style={{fontSize: '1.2rem', marginBottom: '10px'}}>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="gallery-section" style={{background: '#f8f9fa'}}>
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="section-title">Galeri Kegiatan</motion.h2>
          <div className="gallery-grid">
            {galleryData.map((item, index) => (
              <motion.div key={index} className="program-card" style={{border: 'none'}} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <div className="program-image" style={{height: '250px'}}>
                  <Image src={item.image} alt={item.title} width={400} height={300} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                <div style={{padding: '15px', textAlign: 'center', fontWeight: 'bold'}}>{item.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}