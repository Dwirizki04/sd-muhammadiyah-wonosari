"use client";

import { motion } from 'framer-motion';

export default function Ekstrakurikuler() {
  
  const activities = [
    { title: "Drumband", icon: "fas fa-drum", desc: "Melatih musikalitas dan kedisiplinan tim.", badge: "Juara Umum" },
    { title: "Tapak Suci", icon: "fas fa-shield-alt", desc: "Seni bela diri untuk ketangkasan dan karakter.", badge: "Prestasi Nasional" },
    { title: "BTA (Baca Tulis Al-Qur'an)", icon: "fas fa-book-quran", desc: "Mendalami kemampuan membaca Al-Qur'an dengan tartil." },
    { title: "Komputer", icon: "fas fa-desktop", desc: "Pengenalan teknologi dasar dan aplikasi produktif." },
    { title: "Hizbul Wathan", icon: "fas fa-campground", desc: "Kepanduan Muhammadiyah untuk melatih kemandirian." },
    { title: "English Club", icon: "fas fa-language", desc: "Melatih percakapan bahasa Inggris yang aktif dan fun." },
    { title: "Seni Tari", icon: "fas fa-masks-theater", desc: "Melestarikan budaya melalui tarian tradisional." },
    { title: "Sepak Bola", icon: "fas fa-futbol", desc: "Melatih fisik dan kerjasama tim di lapangan." },
    { title: "Seni Musik", icon: "fas fa-music", desc: "Mengembangkan bakat vokal dan instrumen musik." },
    { title: "Renang", icon: "fas fa-person-swimming", desc: "Olahraga air untuk kesehatan dan kebugaran." },
    { title: "Literasi Membaca", icon: "fas fa-book", desc: "Meningkatkan minat baca dan wawasan siswa." },
    { title: "Literasi Numerasi", icon: "fas fa-calculator", desc: "Mengasah kemampuan logika dan berhitung." },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="main-wrapper">
      {/* HERO SECTION (Menggunakan style global agar full width) */}
      <section className="hero-section" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('/images/foto sekolah.jpg')" }}>
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="school-name"
          >
            Ekstrakurikuler
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            className="school-tagline"
          >
            Mengembangkan potensi, bakat, dan kreativitas siswa di luar kelas
          </motion.p>
        </div>
      </section>

      {/* DAFTAR EKSKUL */}
      <section className="programs-section">
        <div className="container">
          <motion.div 
            className="text-center mb-5"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <h2 className="section-title">Pilihan Kegiatan</h2>
            <p className="section-subtitle">
                Kami menyediakan berbagai wadah untuk menyalurkan hobi dan bakat siswa, 
                mulai dari bidang olahraga, seni, hingga keagamaan.
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
                
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                
                {/* Badge Prestasi */}
                {item.badge && (
                    <div className="achievement-badge">
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
            <div className="benefit-grid">
                {[
                    { title: "Pengembangan Bakat", icon: "fas fa-star", desc: "Menemukan potensi terpendam siswa." },
                    { title: "Sosialisasi", icon: "fas fa-users", desc: "Belajar berinteraksi dan bekerjasama." },
                    { title: "Prestasi", icon: "fas fa-medal", desc: "Meraih juara di berbagai kompetisi." },
                    { title: "Kesehatan Mental", icon: "fas fa-smile", desc: "Sarana refreshing yang positif." }
                ].map((benefit, idx) => (
                    <motion.div 
                      key={idx} 
                      className="benefit-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                        <div className="benefit-icon"><i className={benefit.icon}></i></div>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}