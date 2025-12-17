// src/app/contact/page.js
"use client";

import { useState } from 'react';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi Kirim WA
  const handleWA = (e) => {
    e.preventDefault();
    
    // GANTI DENGAN NOMOR WA SEKOLAH (Format 62...)
    const phone = "6285226443646"; 
    
    // Format pesan agar rapi (%0A untuk enter/baris baru)
    const text = `Assalamu'alaikum Admin SD Muhammadiyah Wonosari,%0A%0A` +
            `Perkenalkan saya *${formData.name}*.%0A` +
            `Tujuan: *${formData.category}*%0A%0A` +
            `Isi Pesan: %0A${formData.message}`;
    
    // Buka WhatsApp di tab baru
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Hubungi Kami</h1>
            <p className="school-tagline">Kami siap melayani pertanyaan Anda</p>
          </div>
        </div>
      </section>

      {/* KONTAK INFO & FORM */}
      <section className="programs-section">
        <div className="container">
          
          {/* Grid Layout 2 Kolom (Info Kiri, Form Kanan) */}
          <div className="contact-grid">
            
            {/* KOLOM KIRI: INFORMASI */}
            <div className="contact-info">
               <h2 className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>Informasi</h2>
               
               <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                   <div style={{display: 'flex', gap: '15px', alignItems: 'flex-start'}}>
                        <div style={{background: '#e8f5e8', padding: '10px', borderRadius: '50%', color: '#1a5d1a'}}>
                            <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '5px'}}>Alamat</h3>
                            <p style={{margin: 0, color: '#64748b'}}>Jl. Sumber Agung, Tawarsari, Wonosari, Gunungkidul DIY</p>
                        </div>
                   </div>

                   <div style={{display: 'flex', gap: '15px', alignItems: 'flex-start'}}>
                        <div style={{background: '#e8f5e8', padding: '10px', borderRadius: '50%', color: '#1a5d1a'}}>
                            <i className="fas fa-phone"></i>
                        </div>
                        <div>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '5px'}}>Telepon / WA</h3>
                            <p style={{margin: 0, color: '#64748b'}}>0852-2644-3646</p>
                        </div>
                   </div>

                   <div style={{display: 'flex', gap: '15px', alignItems: 'flex-start'}}>
                        <div style={{background: '#e8f5e8', padding: '10px', borderRadius: '50%', color: '#1a5d1a'}}>
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '5px'}}>Email</h3>
                            <p style={{margin: 0, color: '#64748b'}}>sdmuri63@gmail.com</p>
                        </div>
                   </div>

                   <div style={{display: 'flex', gap: '15px', alignItems: 'flex-start'}}>
                        <div style={{background: '#e8f5e8', padding: '10px', borderRadius: '50%', color: '#1a5d1a'}}>
                            <i className="fas fa-clock"></i>
                        </div>
                        <div>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '5px'}}>Jam Kerja</h3>
                            <p style={{margin: 0, color: '#64748b'}}>Senin - Jumat: 07.00 - 16.00 WIB</p>
                        </div>
                   </div>
               </div>
            </div>

            {/* KOLOM KANAN: FORM WA */}
            <div className="contact-form-container">
                <h2 className="section-title" style={{textAlign: 'left', marginBottom: '30px'}}>Kirim Pesan</h2>
                <form onSubmit={handleWA}>
                    <div className="form-group">
                        <label htmlFor="wa-name">Nama Lengkap</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="wa-name" 
                            value={formData.name}
                            onChange={handleChange}
                            required 
                            placeholder="Contoh: Bpk. Ahmad" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="wa-category">Keperluan</label>
                        <select 
                            name="category" 
                            id="wa-category" 
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="Info PPDB">Info Pendaftaran (PPDB)</option>
                            <option value="Info Sekolah">Pertanyaan Umum Sekolah</option>
                            <option value="Saran & Masukan">Saran & Masukan</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="wa-message">Pesan Anda</label>
                        <textarea 
                            name="message" 
                            id="wa-message" 
                            rows="5" 
                            value={formData.message}
                            onChange={handleChange}
                            required 
                            placeholder="Tuliskan pertanyaan atau pesan Anda di sini..." 
                        ></textarea>
                    </div>
                    
                    <button type="submit" style={{
                        background: '#25d366', 
                        color: 'white', 
                        padding: '14px 25px', 
                        border: 'none', 
                        borderRadius: '50px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        marginTop: '10px', 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '10px',
                        fontSize: '1rem',
                        transition: '0.3s'
                    }}>
                        <i className="fab fa-whatsapp" style={{fontSize: '1.2rem'}}></i> Kirim via WhatsApp
                    </button>
                </form>
            </div>

          </div>
          
          {/* Peta Google Maps (Sudah Aman dari Tabrakan) */}
          <div className="map-container" style={{marginTop: '0px'}}>
             <h2 className="section-title">Lokasi Sekolah</h2>
             <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5103.831068480097!2d110.60632697602742!3d-7.962414792062328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7bb35bbcb42b6f%3A0x28f84c455a30a898!2sSD%20Muhammadiyah%20Wonosari!5e1!3m2!1sid!2sid!4v1765947457312!5m2!1sid!2sid" 
                width="100%" 
                height="450" 
                style={{border:0, borderRadius: '12px'}} 
                allowFullScreen="" 
                loading="lazy">
             </iframe>
          </div>

        </div>
      </section>
    </>
  );
}