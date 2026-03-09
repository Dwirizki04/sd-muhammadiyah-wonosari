// src/components/Footer.jsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  // Konstanta tautan media sosial
  const socialLinks = {
    instagram: "https://www.instagram.com/sdmuh_wonosari",
    youtube: "https://www.youtube.com/@muhammadiyahwonosari29",
    whatsapp: "https://wa.me/6285226443646"
  };

  return (
    <footer className="site-footer">
        <div className="container">
            {/* Logo & Nama Sekolah */}
            <div className="footer-logo">
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <Image 
                        src="/images/logo sdm woonsa.jpg" 
                        alt="Logo SD Muhammadiyah Wonosari" 
                        fill
                        style={{ objectFit: 'contain', borderRadius: '50%' }}
                    />
                </div>
                <h3>SD Muhammadiyah Wonosari</h3>
            </div>
            
            <div className="footer-grid">
                {/* Kolom 1: Tentang */}
                <div className="footer-col">
                    <h3>Tentang Kami</h3>
                    <p>SD Muhammadiyah Wonosari berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami.</p>
                    <div className="social-links">
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                            <i className="fab fa-youtube"></i>
                        </a>
                        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
                            <i className="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>
                
                {/* Kolom 2: Link Cepat */}
                <div className="footer-col">
                    <h3>Link Cepat</h3>
                    <ul className="footer-links">
                        <li><Link href="/">Beranda</Link></li>
                        <li><Link href="/about">Profil Sekolah</Link></li>
                        <li><Link href="/unggulan">Program Unggulan</Link></li>
                        <li><Link href="/ekstrakurikuler">Ekstrakurikuler</Link></li>
                        <li><Link href="/contact">Kontak</Link></li>
                    </ul>
                </div>
                
                {/* Kolom 3: Kontak */}
                <div className="footer-col">
                    <h3>Kontak Kami</h3>
                    <ul className="footer-contact">
                        <li><i className="fas fa-map-marker-alt"></i> Jl. Sumber Agung, Tawarsari, Wonosari, Gunungkidul DIY</li>
                        <li><i className="fas fa-phone"></i> 0852-2644-3646</li>
                        <li><i className="fas fa-envelope"></i> sdmuri63@gmail.com</li>
                        <li><i className="fas fa-clock"></i> Senin - Jumat: 07.00 - 15.00 WIB</li>
                    </ul>
                </div>
            </div>
            
            <div className="copyright">
                <p>&copy; {new Date().getFullYear()} SD Muhammadiyah Wonosari. Semua Hak Dilindungi.</p>
            </div>
        </div>
    </footer>
  );
}