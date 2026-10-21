// src/themes/IndependenceTheme.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// --- Hitung otomatis "ke berapa tahun" Indonesia merdeka, tanpa perlu update manual tiap tahun ---
function useKemerdekaanCount() {
  const [tahun, setTahun] = useState(0);
  useEffect(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), 7, 17); // 17 Agustus tahun berjalan (bulan index 7 = Agustus)
    const acuanTahun = now >= cutoff ? now.getFullYear() : now.getFullYear() - 1;
    setTahun(acuanTahun - 1945);
  }, []);
  return tahun;
}

// --- Komponen angka yang menghitung naik (dipakai untuk "XX TAHUN") ---
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 22, stiffness: 90 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = Math.floor(latest);
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

// --- Umbul-umbul segitiga bergoyang di tepi atas hero ---
function Bunting() {
  const flags = Array.from({ length: 16 });
  return (
    <div className="bunting-row" aria-hidden="true">
      {flags.map((_, i) => (
        <span
          key={i}
          className="bunting-flag"
          style={{
            background: i % 2 === 0 ? 'var(--merah)' : 'var(--putih)',
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

// --- Ledakan kembang api dekoratif ---
function Fireworks() {
  const bursts = [
    { top: '16%', left: '10%', color: 'var(--emas)', delay: '0s' },
    { top: '26%', left: '84%', color: 'var(--putih)', delay: '1.2s' },
    { top: '8%', left: '48%', color: 'var(--merah)', delay: '2.1s' },
    { top: '42%', left: '22%', color: 'var(--emas)', delay: '3s' },
    { top: '14%', left: '66%', color: 'var(--putih)', delay: '0.8s' },
  ];
  return (
    <div className="fireworks-layer" aria-hidden="true">
      {bursts.map((b, i) => (
        <span
          key={i}
          className="firework-burst"
          style={{ top: b.top, left: b.left, '--fw-color': b.color, animationDelay: b.delay }}
        />
      ))}
    </div>
  );
}

export default function IndependenceTheme() {
  const [newsData, setNewsData] = useState([]);
  const tahunMerdeka = useKemerdekaanCount();

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNewsData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const lomba = [
    { icon: '🥔', name: 'Balap Karung' },
    { icon: '🍥', name: 'Makan Kerupuk' },
    { icon: '🎋', name: 'Panjat Pinang' },
    { icon: '🧦', name: 'Estafet Sarung' },
    { icon: '🪢', name: 'Tarik Tambang' },
    { icon: '🎈', name: 'Pecah Balon' },
  ];

  return (
    <div className="merdeka-wrapper">
      {/* HERO */}
      <section className="merdeka-hero">
        <Bunting />
        <Fireworks />

        <div className="starfield" aria-hidden="true">
          {[...Array(24)].map((_, i) => (
            <span
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 55}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="flag-pole" aria-hidden="true">
          <div className="pole" />
          <div className="flag-cloth" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hero-copy"
        >
          <span className="eyebrow">🇮🇩 17 AGUSTUS 1945 — SEMANGAT MERDEKA</span>
          <h1 className="hero-title">
            MERDEKA!
            <span className="hero-counter">
              <AnimatedCounter value={tahunMerdeka} /> <small>TAHUN INDONESIA</small>
            </span>
          </h1>
          <p className="hero-sub">
            Dirgahayu Republik Indonesia — SD Muhammadiyah Wonosari mengajak Ananda mengenang jasa
            para pahlawan dan menyalakan semangat juang generasi muda.
          </p>
        </motion.div>
      </section>

      {/* KUTIPAN SEMANGAT JUANG */}
      <section className="quote-band">
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          &ldquo;Berikan aku 10 pemuda, niscaya akan kuguncangkan dunia.&rdquo;
          <cite>— Ir. Soekarno</cite>
        </motion.blockquote>
      </section>

      {/* LOMBA & BERITA */}
      <section className="content-section">
        <div className="content-grid">
          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>🎉 Rangkaian Lomba 17 Agustus</h3>
            <div className="lomba-grid">
              {lomba.map((l) => (
                <div key={l.name} className="lomba-item">
                  <span className="lomba-icon">{l.icon}</span>
                  <span>{l.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>📰 Berita Terbaru</h3>
            {newsData.length === 0 ? (
              <p className="empty-note">Belum ada berita terbaru.</p>
            ) : (
              newsData.slice(0, 3).map((n) => (
                <div key={n.id} className="news-row">
                  <b>{n.title}</b>
                  <p>{n.excerpt?.substring(0, 70)}...</p>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        .merdeka-wrapper {
          --merah: #c8102e;
          --putih: #fffdf9;
          --malam: #14162b;
          --malam-2: #1e2140;
          --emas: #ffb100;
          background: var(--putih);
        }

        /* ===== HERO ===== */
        .merdeka-hero {
          position: relative;
          min-height: 85vh;
          margin-top: -80px;
          padding: 140px 20px 70px;
          background: radial-gradient(circle at 50% 0%, var(--malam-2) 0%, var(--malam) 70%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--putih);
        }

        /* Umbul-umbul */
        .bunting-row {
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-evenly;
          padding: 0 4%;
        }
        .bunting-flag {
          width: 22px;
          height: 30px;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top center;
          animation: buntingSway 3s ease-in-out infinite;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }
        @keyframes buntingSway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }

        /* Kembang api */
        .fireworks-layer { position: absolute; inset: 0; pointer-events: none; }
        .firework-burst {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--fw-color);
          box-shadow:
            20px -10px 0 -2px var(--fw-color),
            -20px -10px 0 -2px var(--fw-color),
            20px 10px 0 -2px var(--fw-color),
            -20px 10px 0 -2px var(--fw-color),
            0 -22px 0 -2px var(--fw-color),
            0 22px 0 -2px var(--fw-color);
          animation: fwBurst 3.6s ease-out infinite;
          opacity: 0;
        }
        @keyframes fwBurst {
          0% { transform: scale(0); opacity: 0; }
          15% { transform: scale(1); opacity: 1; }
          60% { opacity: 0.55; }
          100% { transform: scale(2.3); opacity: 0; }
        }

        /* Bintang malam */
        .starfield { position: absolute; inset: 0; }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.9; }
        }

        /* Bendera bergoyang */
        .flag-pole {
          position: absolute;
          right: 6%;
          top: 14%;
          display: none;
        }
        @media (min-width: 900px) {
          .flag-pole { display: block; }
        }
        .pole {
          width: 4px;
          height: 220px;
          background: linear-gradient(to bottom, #d4af37, #8a6d1f);
          border-radius: 2px;
        }
        .flag-cloth {
          position: absolute;
          top: 4px;
          left: 3px;
          width: 90px;
          height: 60px;
          background: linear-gradient(to bottom, var(--merah) 50%, var(--putih) 50%);
          transform-origin: left center;
          animation: flagWave 2.4s ease-in-out infinite;
          box-shadow: 3px 3px 12px rgba(0, 0, 0, 0.35);
        }
        @keyframes flagWave {
          0%, 100% { transform: skewY(-4deg) scaleX(1); }
          50% { transform: skewY(4deg) scaleX(0.96); }
        }

        .hero-copy { position: relative; z-index: 5; max-width: 720px; }
        .eyebrow {
          display: inline-block;
          letter-spacing: 2px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--emas);
          margin-bottom: 18px;
        }
        .hero-title {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: clamp(2.6rem, 9vw, 5.5rem);
          line-height: 1;
          margin: 0 0 20px;
          background: linear-gradient(180deg, #ffffff 0%, var(--emas) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-counter {
          display: block;
          margin-top: 10px;
          font-size: clamp(1.1rem, 4vw, 1.8rem);
          font-weight: 700;
          background: none;
          -webkit-background-clip: initial;
          background-clip: initial;
          -webkit-text-fill-color: initial;
          color: var(--putih);
        }
          
        .hero-counter small {
          font-size: 0.55em;
          opacity: 0.8;
          letter-spacing: 2px;
          font-weight: 600;
        }
        .hero-sub {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          line-height: 1.7;
          opacity: 0.85;
          margin: 0 auto;
        }

        /* ===== KUTIPAN ===== */
        .quote-band {
          position: relative;
          padding: 60px 20px;
          background: repeating-linear-gradient(
            135deg,
            var(--merah) 0px,
            var(--merah) 40px,
            var(--putih) 40px,
            var(--putih) 80px
          );
        }
        .quote-band blockquote {
          max-width: 680px;
          margin: 0 auto;
          background: var(--malam);
          color: var(--putih);
          padding: 36px 40px;
          border-radius: 20px;
          text-align: center;
          font-size: clamp(1.05rem, 2.4vw, 1.4rem);
          font-style: italic;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }
        .quote-band cite {
          display: block;
          margin-top: 16px;
          font-style: normal;
          font-size: 0.85rem;
          color: var(--emas);
          letter-spacing: 1px;
        }

        /* ===== LOMBA & BERITA ===== */
        .content-section { padding: 70px 20px; background: var(--putih); }
        .content-grid {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .info-card {
          background: white;
          border: 1px solid #f1e6e6;
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .info-card h3 { margin: 0 0 20px; color: var(--merah); font-size: 1.15rem; }

        .lomba-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 400px) {
          .lomba-grid { grid-template-columns: 1fr; }
        }
        .lomba-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff6f1;
          border-radius: 12px;
          padding: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
        }
        .lomba-icon { font-size: 1.4rem; }

        .news-row {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
          margin-bottom: 12px;
          text-align: left;
        }
        .news-row:last-child { border-bottom: none; margin-bottom: 0; }
        .news-row b { font-size: 0.95rem; color: #1e293b; }
        .news-row p { font-size: 0.82rem; color: #64748b; margin: 5px 0 0; }
        .empty-note { color: #94a3b8; font-size: 0.85rem; }

        @media (prefers-reduced-motion: reduce) {
          .bunting-flag,
          .firework-burst,
          .star,
          .flag-cloth {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
