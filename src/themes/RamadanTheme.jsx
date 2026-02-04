"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function RamadanTheme() {
  const [newsData, setNewsData] = useState([]);
  const [jadwal, setJadwal] = useState({ Imsak: '04:12', Maghrib: '17:55', Tanggal: 'Memuat...' });

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNewsData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Wonosari&country=Indonesia&method=20')
      .then(res => res.json()).then(data => {
        const t = data.data.timings;
        setJadwal({ Imsak: t.Imsak, Maghrib: t.Maghrib, Tanggal: data.data.date.readable });
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#fdfbf7', minHeight: '100vh' }}>
      
      {/* HERO SECTION RAMADHAN */}
      <section style={heroStyle}>
        <div style={starsOverlay}>
          {[...Array(25)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0, 1, 0] }} transition={{ duration: Math.random()*3+2, repeat: Infinity }}
              style={{ position: 'absolute', top: `${Math.random()*130}%`, left: `${Math.random()*100}%`, width: '2px', height: '2px', backgroundColor: 'white', borderRadius: '50%' }}
            />
          ))}
        </div>

        <motion.div animate={{ y: [0, 15, 0], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity }} style={lanternLeft}>🏮</motion.div>
        <motion.div animate={{ y: [0, 12, 0], rotate: [0, -2, 0] }} transition={{ duration: 6, repeat: Infinity }} style={lanternRight}>🏮</motion.div>

        <div style={mosqueSilhouette}>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '120px', display: 'block' }}>
            <path fill="#fdfbf7" d="M0,224L60,202.7C120,181,240,139,360,144C480,149,600,203,720,213.3C840,224,960,192,1080,165.3C1200,139,1320,117,1380,106.7L1440,96V320H0Z"></path>
          </svg>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ zIndex: 10 }}>
          <span style={ramadanTag}>🌙 MARHABAN YA RAMADHAN</span>
          <h1 style={mainTitle}>Ramadhan Ceria,<br /><span style={{ color: '#FFD700' }}>Raih Keberkahan Bersama</span></h1>
          
          <div style={ayatBox}>
            <p style={{ fontStyle: 'italic', margin: 0 }}>"Berpuasalah kamu agar kamu bertakwa."</p>
            <small style={{ color: '#FFD700', marginTop: '10px', display: 'block' }}>QS. Al-Baqarah: 183</small>
          </div>
        </motion.div>
      </section>

      {/* INFO JADWAL & BERITA */}
      <section style={{ padding: '40px 20px 80px', position: 'relative', zIndex: 20 }}>
        <div style={contentGrid}>
          <div style={infoCard}>
             <h3 style={{ color: '#1a5d1a', marginBottom: '20px' }}>🕒 Jadwal Imsakiyah</h3>
             <div style={timeRow}><span>IMSAK</span><b>{jadwal.Imsak} WIB</b></div>
             <div style={timeRowActive}><span>MAGHRIB</span><b>{jadwal.Maghrib} WIB</b></div>
          </div>

          <div style={infoCard}>
            <h3 style={{ color: '#1a5d1a', marginBottom: '20px' }}>📰 Berita Terbaru</h3>
            {newsData.slice(0, 2).map(n => (
              <div key={n.id} style={{ marginBottom: '15px', textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <b style={{ fontSize: '0.9rem' }}>{n.title}</b>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0' }}>{n.excerpt?.substring(0, 60)}...</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const heroStyle = { minHeight: '80vh', background: 'linear-gradient(135deg, #063306 0%, #1a5d1a 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center' };
const starsOverlay = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
const lanternLeft = { position: 'absolute', top: '15%', left: '10%', fontSize: '3rem' };
const lanternRight = { position: 'absolute', top: '20%', right: '10%', fontSize: '2.5rem' };
const mosqueSilhouette = { position: 'absolute', bottom: -1, left: 0, width: '100%' };
const ramadanTag = { letterSpacing: '3px', fontSize: '0.8rem', fontWeight: 'bold', color: '#FFD700' };
const mainTitle = { fontSize: '3rem', fontWeight: '900', margin: '20px 0' };
const ayatBox = { background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)', maxWidth: '500px', margin: '0 auto' };
const contentGrid = { maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' };
const infoCard = { background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' };
const timeRow = { display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8faf8', borderRadius: '12px', marginBottom: '10px' };
const timeRowActive = { ...timeRow, background: '#1a5d1a', color: 'white' };