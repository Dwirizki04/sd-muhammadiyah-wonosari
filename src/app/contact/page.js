"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  // State untuk form input
  const [formData, setFormData] = useState({
    name: '',
    category: 'Info PPDB',
    message: ''
  });

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi Kirim WA
  const handleWA = (e) => {
    e.preventDefault();
    
    // NOMOR WA SEKOLAH
    const phone = "6285226443646"; 
    
    const text = `Assalamu'alaikum Admin SD Muhammadiyah Wonosari,%0A%0A` +
             `Perkenalkan saya *${formData.name}*.%0A` +
             `Tujuan: *${formData.category}*%0A%0A` +
             `Isi Pesan: %0A${formData.message}`;
    
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Animasi Masuk
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="main-wrapper">
      
      {/* 1. HERO SECTION */}
      <section 
        className="hero-section" 
        style={{ 
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
            Hubungi Kami
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            style={{ fontSize: '1.2rem', opacity: 0.9 }}
          >
            Kami siap melayani pertanyaan Anda seputar pendidikan putra-putri Anda
          </motion.p>
        </div>
      </section>

      {/* 2. KONTAK INFO & FORM */}
      <section className="programs-section" style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container">
          
          <motion.div 
            className="contact-grid"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            
            {/* --- KOLOM KIRI: INFORMASI --- */}
            <div className="contact-info-card">
               <h2 className="section-title-left">Informasi Sekolah</h2>
               <p style={{marginBottom: '30px', color: '#64748b'}}>
                 Silakan datang berkunjung atau hubungi kami melalui kontak di bawah ini.
               </p>
               
               <div className="info-list">
                   
                   <div className="info-item">
                        <div className="icon-box"><i className="fas fa-map-marker-alt"></i></div>
                        <div>
                            <h3>Alamat</h3>
                            <p>Jl. Sumber Agung, Tawarsari, Wonosari, Gunungkidul DIY</p>
                        </div>
                   </div>

                   <div className="info-item">
                        <div className="icon-box"><i className="fas fa-phone-alt"></i></div>
                        <div>
                            <h3>Telepon / WA</h3>
                            <p>0852-2644-3646</p>
                        </div>
                   </div>

                   <div className="info-item">
                        <div className="icon-box"><i className="fas fa-envelope"></i></div>
                        <div>
                            <h3>Email</h3>
                            <p>sdmuri63@gmail.com</p>
                        </div>
                   </div>

                   <div className="info-item">
                        <div className="icon-box"><i className="fas fa-clock"></i></div>
                        <div>
                            <h3>Jam Operasional</h3>
                            <p>Senin - Jumat: 07.00 - 15.00 WIB</p>
                        </div>
                   </div>

               </div>
            </div>

            {/* --- KOLOM KANAN: FORM WA --- */}
            <div className="contact-form-card">
                <h2 className="section-title-left">Kirim Pesan</h2>
                <p style={{marginBottom: '20px', color: '#64748b'}}>
                  Langsung terhubung dengan WhatsApp Admin kami.
                </p>

                <form onSubmit={handleWA}>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input 
                            type="text" name="name" 
                            value={formData.name} onChange={handleChange} required 
                            placeholder="Contoh: Bpk. Ahmad" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Keperluan</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Info PPDB">Info Pendaftaran (PPDB)</option>
                            <option value="Info Sekolah">Pertanyaan Umum Sekolah</option>
                            <option value="Saran & Masukan">Saran & Masukan</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pesan Anda</label>
                        <textarea 
                            name="message" rows="5" 
                            value={formData.message} onChange={handleChange} required 
                            placeholder="Tuliskan pesan Anda..." 
                        ></textarea>
                    </div>
                    
                    <button type="submit" className="btn-wa-submit">
                        <i className="fab fa-whatsapp"></i> Kirim via WhatsApp
                    </button>
                </form>
            </div>

          </motion.div>
          
          {/* 3. PETA LOKASI */}
          <motion.div 
            className="map-section"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          >
             <h2 className="section-title" style={{ marginTop: '60px' }}>Lokasi Sekolah</h2>
             <div className="map-frame">
                 {/* Google Maps Embed (Ganti src dengan embed map asli sekolah jika ada) */}
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5103.831068480097!2d110.60632697602742!3d-7.962414792062329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7bb35bbcb42b6f%3A0x28f84c455a30a898!2sSD%20Muhammadiyah%20Wonosari!5e1!3m2!1sid!2sid!4v1769573601577!5m2!1sid!2sid" 
                    width="100%" 
                    height="450" 
                    style={{border:0}} 
                    allowFullScreen="" 
                    loading="lazy">
                 </iframe>
             </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}