// src/components/Navbar.jsx
"use client"; // Wajib karena ada interaksi klik (toggle menu)

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // State untuk menu mobile
  const pathname = usePathname(); // Untuk mendeteksi halaman aktif

  // Fungsi cek aktif
  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="container">
          <div className="header-info">
            <span><i className="fas fa-phone"></i> 0852-2644-3646</span>
            <span><i className="fas fa-envelope"></i> sdmuri63@gmail.com</span>
            <span><i className="fas fa-map-marker-alt"></i> Wonosari, Gunungkidul</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <div className="logo-title-wrapper">
              <div className="header-logo left-logo">
                {/* Next.js Image Optimization */}
                <Image src="/images/logo disdakmen .png" alt="Logo Dikdasmen" width={60} height={60} />
              </div>
              <h1 className="school-title">SD Muhammadiyah Wonosari</h1>
              <div className="header-logo right-logo">
                <Image src="/images/logo sdm woonsa.jpg" alt="Logo Sekolah" width={60} height={60} />
              </div>
            </div>

            {/* Menu Navigasi */}
            <nav className={`main-nav ${isOpen ? 'active' : ''}`} id="main-nav">
              <ul>
                <li className={isActive('/')}><Link href="/" onClick={() => setIsOpen(false)}>Beranda</Link></li>
                <li className={isActive('/about')}><Link href="/about" onClick={() => setIsOpen(false)}>Tentang Kami</Link></li>
                <li className={isActive('/unggulan')}><Link href="/unggulan" onClick={() => setIsOpen(false)}>Program Unggulan</Link></li>
                <li className={isActive('/ekstrakurikuler')}><Link href="/ekstrakurikuler" onClick={() => setIsOpen(false)}>Ekstrakurikuler</Link></li>
                <li className={isActive('/ppdb')}><Link href="/ppdb" onClick={() => setIsOpen(false)}>Pendaftaran</Link></li>
                <li className={isActive('/contact')}><Link href="/contact" onClick={() => setIsOpen(false)}>Kontak</Link></li>
              </ul>
            </nav>

            {/* Tombol Burger Mobile */}
            <button 
              className={`menu-toggle ${isOpen ? 'active' : ''}`} 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}