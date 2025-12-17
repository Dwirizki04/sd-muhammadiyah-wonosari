// src/app/unggulan/page.js
"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function Unggulan() {
  const [filter, setFilter] = useState('all');

  // Data Program (Pindahan dari JS lama)
  const programs = [
    { name: "Kelas Takhassus Tahfidz", category: "takhassus", image: "/images/TS1.jpg", icon: "fas fa-quran", desc: "Target hafalan intensif." },
    { name: "Baca Tulis Quran", category: "takhassus", image: "/images/TS2.jpg", icon: "fas fa-book-quran", desc: "Metode efektif baca tulis." },
    { name: "Sholat Dhuha", category: "agama", image: "/images/Sholat.jpg", icon: "fas fa-mosque", desc: "Pembiasaan sholat sunnah." },
    { name: "Hafalan Doa", category: "agama", image: "/images/hafalan.jpg", icon: "fas fa-pray", desc: "Doa harian dan hadist." },
    { name: "Life Skill Memasak", category: "keterampilan", image: "/images/LS4.jpg", icon: "fas fa-utensils", desc: "Dasar tata boga." },
    { name: "Berkebun", category: "keterampilan", image: "/images/LS2.jpg", icon: "fas fa-seedling", desc: "Bercocok tanam mandiri." },
    { name: "Outing Class", category: "experiential", image: "/images/oc1.jpg", icon: "fas fa-bus", desc: "Belajar di luar kelas." },
  ];

  // Logic Filter
  const filteredPrograms = filter === 'all' 
    ? programs 
    : programs.filter(p => p.category === filter);

  // Style tombol filter
  const btnStyle = (cat) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    background: filter === cat ? '#1a5d1a' : '#e2e8f0',
    color: filter === cat ? 'white' : '#333',
    fontWeight: '600',
    transition: '0.3s'
  });

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Program Unggulan</h1>
            <p className="school-tagline">Keunggulan akademik dan karakter di SD Muhammadiyah Wonosari</p>
          </div>
        </div>
      </section>

      <section className="programs-section">
        <div className="container">
          {/* Tombol Filter */}
          <div className="program-filter" style={{display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '40px'}}>
            <button style={btnStyle('all')} onClick={() => setFilter('all')}>Semua</button>
            <button style={btnStyle('takhassus')} onClick={() => setFilter('takhassus')}>Kelas Takhassus</button>
            <button style={btnStyle('agama')} onClick={() => setFilter('agama')}>Agama</button>
            <button style={btnStyle('keterampilan')} onClick={() => setFilter('keterampilan')}>Life Skill</button>
            <button style={btnStyle('experiential')} onClick={() => setFilter('experiential')}>Experiential</button>
          </div>

          <div className="programs-grid">
            {filteredPrograms.map((program, index) => (
              <div className="program-card" key={index}>
                <div className="program-image">
                  <Image src={program.image} alt={program.name} width={400} height={250} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
                <div className="program-content">
                  <div className="program-icon" style={{fontSize: '1.5rem', color: '#1a5d1a', marginBottom: '10px'}}>
                    <i className={program.icon}></i>
                  </div>
                  <h3>{program.name}</h3>
                  <p>{program.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}