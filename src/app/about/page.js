"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function About() {
  
  // Konfigurasi Animasi
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const missions = [
    'Menyelenggarakan pendidikan Al Islam, Kemuhammadiyahan, dan Bahasa Arab (ISMUBA) yang efektif.',
    'Menyelenggarakan Ekstrakurikuler Hizbul Wathan dan Tapak Suci.',
    'Mengajarkan konsep Tauhid yang sesuai Himpunan Tarjih Muhammadiyah.',
    'Membiasakan murid untuk melakukan ibadah sesuai Himpunan Putusan Tarjih.',
    'Membentuk karakter murid dengan nilai-nilai Islam yang lurus.',
    'Menciptakan lingkungan yang Islami dan menyediakan fasilitas memadai.',
    'Menyelenggarakan pembelajaran yang mengembangkan kemampuan berpikir kritis.',
    'Menyelenggarakan Program PHBSIM (Perilaku Hidup Bersih Sehat Islami Mandiri).',
    'Memenuhi fasilitas kesehatan yang memadai untuk semua warga sekolah sesuai SNP.'
  ];

  return (
    <div className="main-wrapper">
      
      {/* 1. HERO SECTION (Header Halaman) */}
      <section 
        className="hero-section" 
        style={{ 
            // Pastikan gambar ini ada. Jika tidak, ganti dengan '/images/foto sekolah.jpg'
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('/images/foto sekolah.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '97vh',
            minHeight: '400px',
            marginTop: '-80px',
            paddingTop: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="school-name"
            style={{ fontSize: '3rem', marginBottom: '10px' }}
          >
            Tentang Kami
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            style={{ fontSize: '1.2rem', opacity: 0.9 }}
          >
            Mengenal lebih dekat sejarah, visi, dan misi SD Muhammadiyah Wonosari
          </motion.p>
        </div>
      </section>

      {/* 2. KONTEN UTAMA */}
      <section className="programs-section" style={{ padding: '80px 0' }}>
        <div className="container">
          
          <motion.div 
            className="about-grid" /* Class CSS Baru */
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            
            {/* --- KOLOM KIRI: TEKS & VISI MISI --- */}
            <div className="text-content">
                
                {/* Sejarah */}
                <div style={{ marginBottom: '50px' }}>
                    <h2 className="section-title-left">Sejarah & Profil</h2>
                    <p>
                        Sebagai salah satu sekolah yang berbasis agama, <strong>SD Muhammadiyah Wonosari</strong> berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami.
                    </p>
                    <p>
                        Berdiri sejak tahun 1963, sekolah kami terus berinovasi dalam metode pembelajaran modern yang dipadukan dengan nilai-nilai Al-Qur'an dan As-Sunnah. Kami percaya bahwa setiap anak memiliki potensi unik yang harus dikembangkan dalam lingkungan yang aman, nyaman, dan religius.
                    </p>
                </div>

                {/* Visi Misi */}
                <div>
                    <h2 className="section-title-left">Visi & Misi</h2>
                    
                    {/* KARTU VISI */}
                    <div className="vision-card">
                        <div className="icon-box"><i className="fas fa-lightbulb"></i></div>
                        <div>
                            <h3>Visi Sekolah</h3>
                            <p>"Menyiapkan kader Muhammadiyah yang berkemajuan, sehat, dan berkarakter"</p>
                        </div>
                    </div>

                    {/* DAFTAR MISI */}
                    <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '15px', fontWeight: '700' }}>Misi Sekolah</h3>
                    <ul className="mission-list">
                        {missions.map((item, idx) => (
                            <li key={idx}>
                                <i className="fas fa-check-circle"></i>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* --- KOLOM KANAN: FOTO-FOTO --- */}
            <div className="image-column">
                
                {/* Foto Dulu */}
                <div className="history-image-card">
                    <div className="img-wrapper">
                         {/* Pastikan file ini ada di public/images/ */}
                        <Image 
                            src="/images/foto sekolah dulu.jpg" 
                            alt="Gedung Lama" 
                            fill 
                            style={{objectFit: 'cover'}}
                        />
                    </div>
                    <div className="img-caption">
                        <i className="fas fa-history"></i> Gedung Sekolah Tahun 1985
                    </div>
                </div>

                {/* Foto Sekarang */}
                <div className="history-image-card">
                    <div className="img-wrapper">
                        <Image 
                            src="/images/foto sekolah.jpg" 
                            alt="Gedung Baru" 
                            fill 
                            style={{objectFit: 'cover'}}
                        />
                    </div>
                    <div className="img-caption">
                        <i className="fas fa-building"></i> Gedung Sekolah Saat Ini
                    </div>
                </div>

            </div>

          </motion.div>
        </div>
      </section>
    </div>
  );
}