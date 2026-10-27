"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GREETING = 'Assalamu\'alaikum! 👋 Saya asisten virtual SD Muhammadiyah Wonosari. Ada yang bisa saya bantu seputar sekolah atau SPMB?';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      // Delay kecil supaya animasi buka selesai dulu sebelum fokus
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError('');
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(1), // buang pesan sapaan awal dari histori yang dikirim
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        setMessages((prev) => prev.slice(0, -1)); // rollback pesan user kalau gagal
        setInput(text); // kembalikan teksnya supaya user tidak perlu ketik ulang
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setError('Gagal terhubung. Cek koneksi internet kamu.');
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={panel}
          >
            {/* Header */}
            <div style={header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={avatarDot} />
                <div>
                  <div style={headerTitle}>Asisten SDMuri</div>
                  <div style={headerSubtitle}>Biasanya balas dalam beberapa detik</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={closeBtn} aria-label="Tutup chat">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={messagesArea}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? bubbleRowUser : bubbleRowBot}>
                  <div style={m.role === 'user' ? bubbleUser : bubbleBot}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div style={bubbleRowBot}>
                  <div style={bubbleBot}>
                    <TypingDots />
                  </div>
                </div>
              )}
              {error && <div style={errorText}>{error}</div>}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={inputRow}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pertanyaan..."
                maxLength={500}
                disabled={loading}
                style={inputField}
              />
              <button type="submit" disabled={loading || !input.trim()} style={sendBtn}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
            <div style={privacyNotice}>
              Jangan bagikan NIK atau data pribadi di sini. Untuk cek status SPMB, gunakan halaman{' '}
              <a href="/cek-status" style={privacyLink}>Cek Status</a>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol bulat pengambang */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={fab}
        aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? 'close' : 'chat'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex' }}
          >
            <i className={isOpen ? 'fas fa-times' : 'fas fa-comment-dots'} style={{ fontSize: '1.4rem' }}></i>
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8', display: 'inline-block' }}
        />
      ))}
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
// CATATAN: posisi diletakkan di pojok KIRI bawah supaya tidak bentrok
// dengan FloatingDonasi yang kemungkinan ada di pojok kanan bawah.
// Sesuaikan `left`/`right` di bawah kalau posisi FloatingDonasi berbeda.

const wrapper = {
  position: 'fixed',
  bottom: '24px',
  left: '24px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '14px',
  fontFamily: 'inherit',
};

const fab = {
  width: '58px',
  height: '58px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #1a5d1a, #14532d)',
  color: 'white',
  border: 'none',
  boxShadow: '0 8px 24px rgba(26,93,26,0.35)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const panel = {
  width: 'min(360px, calc(100vw - 48px))',
  height: 'min(520px, calc(100vh - 160px))',
  background: 'white',
  borderRadius: '20px',
  boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const header = {
  background: '#1a5d1a',
  color: 'white',
  padding: '16px 18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const avatarDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#4ade80',
  boxShadow: '0 0 0 3px rgba(74,222,128,0.3)',
};

const headerTitle = { fontWeight: 700, fontSize: '0.95rem' };
const headerSubtitle = { fontSize: '0.72rem', opacity: 0.8 };

const closeBtn = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '4px',
};

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  background: '#f8fafc',
};

const bubbleRowBot = { display: 'flex', justifyContent: 'flex-start' };
const bubbleRowUser = { display: 'flex', justifyContent: 'flex-end' };

const bubbleBot = {
  background: 'white',
  color: '#1e293b',
  padding: '10px 14px',
  borderRadius: '14px 14px 14px 4px',
  maxWidth: '80%',
  fontSize: '0.88rem',
  lineHeight: 1.5,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  whiteSpace: 'pre-wrap',
};

const bubbleUser = {
  background: '#1a5d1a',
  color: 'white',
  padding: '10px 14px',
  borderRadius: '14px 14px 4px 14px',
  maxWidth: '80%',
  fontSize: '0.88rem',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
};

const errorText = {
  fontSize: '0.78rem',
  color: '#ef4444',
  textAlign: 'center',
  padding: '4px',
};

const inputRow = {
  display: 'flex',
  gap: '8px',
  padding: '12px',
  borderTop: '1px solid #e2e8f0',
  background: 'white',
};

const inputField = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: '999px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '0.88rem',
  fontFamily: 'inherit',
};

const privacyNotice = {
  fontSize: '0.68rem',
  color: '#94a3b8',
  textAlign: 'center',
  padding: '0 14px 12px',
  lineHeight: 1.4,
  background: 'white',
};

const privacyLink = { color: '#1a5d1a', fontWeight: 600 };

const sendBtn = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  background: '#1a5d1a',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  opacity: 1,
};
