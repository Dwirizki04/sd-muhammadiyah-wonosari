// src/app/ekstrakurikuler/page.js
"use client";

import { motion } from 'framer-motion';

export default function Ekstrakurikuler() {
  
  // Data Ekstrakurikuler (Tinggal tambah di sini kalau ada baru)
  const activities = [
    { title: "Drumband", icon: "fas fa-drum", desc: "Melatih musikalitas dan kedisiplinan tim.", badge: "Juara Umum" },
    { title: "Tapak Suci", icon: "fas fa-shield-alt", desc: "Seni bela diri untuk ketangkasan dan karakter.", badge: "Prestasi Nasional" },
    { title: "BTA (Baca Tulis Al-Qur'an)", icon: "fas fa-book-quran", desc: "Mendalami kemampuan membaca Al-Qur'an dengan tartil." },
    { title: "Komputer", icon: "fas fa-desktop", desc: "Pengenalan teknologi dasar." },
    { title: "Hizbul Wathan", icon: "fas fa-campground", desc: "Kepanduan Muhammadiyah untuk melatih kemandirian." },
    { title: "English Club", icon: "fas fa-language", desc: "Melatih percakapan bahasa Inggris yang aktif." },
    { title: "Seni Tari", icon: "fas fa-masks-theater", desc: "Melestarikan budaya melalui tarian tradisional." },
    { title: "Sepak Bola", icon: "fas fa-futbol", desc: "Melatih fisik dan kerjasama tim di lapangan." },
    { title: "Seni Musik", icon: "fas fa-music", desc: "Mengembangkan bakat vokal dan instrumen musik." },
    { title: "Renang", icon: "fas fa-person-swimming", desc: "Olahraga air untuk kesehatan dan kebugaran." },
    { title: "Literasi Membaca", icon: "fas fa-book", desc: "Meningkatkan minat baca dan wawasan siswa." },
    { title: "Literasi Numerasi", icon: "fas fa-calculator", desc: "Mengasah kemampuan logika dan berhitung." },
  ];

  // Config Animasi
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Ekstrakurikuler</h1>
            <p className="school-tagline">Mengembangkan potensi, bakat, dan kreativitas siswa di luar kelas</p>
          </div>
        </div>
      </section>

      {/* DAFTAR EKSKUL */}
      <section className="programs-section">
        <div className="container">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            style={{textAlign: 'center', marginBottom: '50px'}}
          >
            <h2 className="section-title">Pilihan Kegiatan</h2>
            <p style={{maxWidth: '700px', margin: '0 auto', color: '#666'}}>
                Kami menyediakan berbagai wadah untuk menyalurkan hobi dan bakat siswa, mulai dari bidang olahraga, seni, hingga keagamaan.
            </p>
          </motion.div>

          <div className="extracurricular-grid">
            {activities.map((item, index) => (
              <motion.div 
                key={index}
                className="extracurricular-card"
                initial="hidden" whileInView="visible" viewport={{ once: true }} 
                variants={fadeInUp} transition={{ delay: index * 0.05 }}
              >
                <div className="extracurricular-icon">
                    <i className={item.icon}></i>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                
                {/* Badge Prestasi (Opsional: Muncul jika ada data badge) */}
                {item.badge && (
                    <div className="achievement-badge" style={{
                        marginTop: '15px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        background: '#fffbeb', 
                        color: '#d97706', 
                        padding: '5px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        border: '1px solid #fcd34d'
                    }}>
                        <i className="fas fa-trophy"></i> {item.badge}
                    </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MANFAAT EKSKUL */}
      <section className="features-section" style={{background: '#e8f5e8'}}>
        <div className="container">
            <h2 className="section-title">Manfaat Mengikuti Ekskul</h2>
            <div className="benefits-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px'}}>
                {[
                    { title: "Pengembangan Bakat", icon: "fas fa-star", desc: "Menemukan potensi terpendam siswa." },
                    { title: "Sosialisasi", icon: "fas fa-users", desc: "Belajar berinteraksi dan bekerjasama." },
                    { title: "Prestasi", icon: "fas fa-medal", desc: "Meraih juara di berbagai kompetisi." },
                    { title: "Kesehatan Mental", icon: "fas fa-smile", desc: "Sarana refreshing yang positif." }
                ].map((benefit, idx) => (
                    <div key={idx} className="benefit-card" style={{background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center'}}>
                        <div style={{fontSize: '2.5rem', color: '#1a5d1a', marginBottom: '15px'}}><i className={benefit.icon}></i></div>
                        <h3 style={{fontSize: '1.2rem', marginBottom: '10px'}}>{benefit.title}</h3>
                        <p style={{color: '#666', fontSize: '0.9rem'}}>{benefit.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </>
  );
}