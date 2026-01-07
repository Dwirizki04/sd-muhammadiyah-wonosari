"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function About() {
  
  // Animasi Masuk
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <>
      {/* HERO SECTION (Judul Halaman) */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Tentang Kami</h1>
            <p className="school-tagline">Mengenal lebih dekat SD Muhammadiyah Wonosari</p>
          </div>
        </div>
      </section>

      {/* KONTEN UTAMA (YANG DIPERBAIKI) */}
      <section className="programs-section">
        <div className="container">
          
          {/* GUNAKAN CLASS BARU DI SINI (JANGAN PAKAI STYLE INLINE LAGI) */}
          <motion.div 
            className="responsive-grid-container"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            
            {/* --- BAGIAN KIRI: TEKS --- */}
            <div className="text-content">
                <h2 style={{color: '#1a5d1a', fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold'}}>
                    Sejarah & Profil
                </h2>
                <p style={{lineHeight: '1.8', color: '#334155', marginBottom: '20px'}}>
                    Sebagai salah satu sekolah yang berbasis agama, <strong>SD Muhammadiyah Wonosari</strong> berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami.
                </p>
                <p style={{lineHeight: '1.8', color: '#334155', marginBottom: '20px'}}>
                    Berdiri sejak tahun 1963, sekolah kami terus berinovasi dalam metode pembelajaran modern yang dipadukan dengan nilai-nilai Al-Qur'an dan As-Sunnah. Kami percaya bahwa setiap anak memiliki potensi unik yang harus dikembangkan dalam lingkungan yang aman, nyaman, dan religius.
                </p>

                {/* Visi Misi */}
                <div style={{marginTop: '40px'}}>
                    <h2 style={{color: '#1a5d1a', fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold'}}>
                        Visi & Misi
                    </h2>
                    
                    <div style={{background: '#f0fdf4', padding: '25px', borderRadius: '15px', borderLeft: '5px solid #1a5d1a', marginBottom: '20px'}}>
                        <h3 style={{fontSize: '1.2rem', marginBottom: '10px', color: '#1a5d1a'}}>Visi</h3>
                        <p style={{margin: 0, fontStyle: 'italic', fontWeight: '600'}}>
                            "Menyiapkan kader Muhammadiyah yang berkemajuan, sehat, dan berkarakter"
                        </p>
                    </div>

                    <h3 style={{fontSize: '1.2rem', marginBottom: '15px', color: '#1a5d1a'}}>Misi</h3>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {['Menyelenggarakan pendidikan Al Islam, Kemuhammadiyahan, dan Bahasa Arab (ISMUBA yang efektif dapat membantu murid memahami Akidah Islam yang lurus sesuai Himpunan Putusan Tarjih.', 
                          'Menyelenggarakan Ekstrakurikuler Hizbul Wathan dan Tapak Suci.', 
                          'Mengajarkan konsep Tauhid yang sesuai Himpunan Tarjih Muhammadiyah dan memberikan contoh-contoh yang relavan.', 
                          'Membiasakan murid untuk melakukan ibadah yang sesuai Himpunan Putusan Tarjih Muhammadiyah.',
                          'Membentuk karakter murid dengan mengajarkan nilai-nilai Islam yang sesuai dengan Himpunan Putusan Tarjih Muhammadiyah.',
                          'Menciptakan lingkungan yang Islami dan mendukung dengan menyediakan fasilitas yang memadai untuk kegiatan keagamaan',
                          'Menyelenggarakan pembelajaran yang mampu mengembangkan potensi kemampuan berpikir kritis.',
                          'Menyelenggarakan Program PHBSIM (Perilaku Hidup Bersih Sehat Islami Mandiri)',
                          'Memenuhi fasilitas kesehatan yang memadai untuk semua warga sekolah sesuai SNP.'
                        ].map((item, idx) => (
                            <li key={idx} style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                                <i className="fas fa-check-circle" style={{color: '#1a5d1a', marginTop: '4px'}}></i>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* --- BAGIAN KANAN: FOTO-FOTO --- */}
            <div className="image-content" style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                
                {/* Foto 1 (Pastikan nama file gambar Anda benar) */}
                <div style={{textAlign: 'center'}}>
                    <div style={{position: 'relative', height: '300px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}>
                        <Image 
                            src="/images/foto sekolah dulu.jpg"  /* GANTI DENGAN NAMA FILE FOTO LAMA ANDA */
                            alt="Gedung Lama 1985" 
                            fill 
                            style={{objectFit: 'cover'}}
                        />
                    </div>
                    <p style={{marginTop: '10px', fontStyle: 'italic', color: '#666'}}>Gedung Sekolah Tahun 1985</p>
                </div>

                {/* Foto 2 */}
                <div style={{textAlign: 'center'}}>
                    <div style={{position: 'relative', height: '300px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}>
                        <Image 
                            src="/images/foto sekolah.jpg" /* GANTI DENGAN NAMA FILE FOTO BARU ANDA */
                            alt="Gedung Sekolah Saat Ini" 
                            fill 
                            style={{objectFit: 'cover'}}
                        />
                    </div>
                    <p style={{marginTop: '10px', fontStyle: 'italic', color: '#666'}}>Gedung Sekolah Saat Ini</p>
                </div>

            </div>

          </motion.div>
        </div>
      </section>
    </>
  );
}