"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  uploadMultipleToCloudinary, 
  subscribeNews, 
  createNewsEntry, 
  removeNewsEntry 
} from '@/lib/newsService';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', excerpt: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeNews(setNews);
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 2) {
      Swal.fire('Info', 'Mohon pilih tepat 2 foto kegiatan.', 'info');
      e.target.value = null;
      return;
    }
    setSelectedFiles(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length !== 2) return;

    setLoading(true);
    try {
      const urls = await uploadMultipleToCloudinary(selectedFiles);
      if (urls.length === 2) {
        await createNewsEntry(form.title, form.excerpt, urls);
        setForm({ title: '', excerpt: '' });
        setSelectedFiles([]);
        setPreviews([]);
        Swal.fire({ title: 'Berhasil Terbit!', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal memproses berita', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: 'Hapus Berita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });
    if (res.isConfirmed) {
      await removeNewsEntry(id);
      Swal.fire('Terhapus', '', 'success');
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>📰 Manajemen Berita</h1>
        <p style={{ color: '#64748b' }}>SD Muhammadiyah Wonosari</p>
      </header>

      <div style={adminGrid}>
        {/* KOLOM KIRI: FORM */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Buat Berita Baru</h3>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              style={inputStyle} placeholder="Judul Berita Utama" 
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required 
            />
            
            <div style={uploadBox}>
              <label style={labelStyle}>Pilih 2 Foto (Sekaligus):</label>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.8rem' }} />
              <div style={previewGrid}>
                {previews.map((url, i) => (
                  <motion.img key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={url} style={previewThumb} />
                ))}
              </div>
            </div>

            <textarea 
              style={textareaStyle} placeholder="Ringkasan atau isi berita singkat..." 
              value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} required 
            />

            <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
              {loading ? '⏳ Sedang Mengunggah...' : '🚀 Terbitkan Berita'}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: LIST */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Berita Terbit</h3>
          <div style={listScrollContainer}>
            <AnimatePresence>
              {news.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={newsItemStyle}>
                  <div style={thumbStack}>
                    <img src={item.images?.[0]} style={imgMain} />
                    <img src={item.images?.[1]} style={imgSub} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={itemTitle}>{item.title}</h4>
                    <small style={{ color: '#94a3b8' }}>{item.date}</small>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={btnDelete}>🗑️</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLING (MODERN GREEN THEME) ---
const containerStyle = { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' };
const headerStyle = { marginBottom: '30px' };
const titleStyle = { color: '#1a5d1a', fontSize: '2rem', fontWeight: '800', margin: 0 };
const adminGrid = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const sectionTitle = { fontSize: '1.1rem', marginBottom: '20px', color: '#1e293b' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#f8fafc' };
const textareaStyle = { ...inputStyle, minHeight: '130px', resize: 'none' };
const uploadBox = { padding: '20px', background: '#f1f5f9', borderRadius: '16px', border: '2px dashed #cbd5e1', textAlign: 'center' };
const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', display: 'block' };
const previewGrid = { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' };
const previewThumb = { width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const btnSubmit = { background: '#1a5d1a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed' };

const listScrollContainer = { maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' };
const newsItemStyle = { display: 'flex', alignItems: 'center', gap: '18px', padding: '15px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '12px' };
const thumbStack = { position: 'relative', width: '65px', height: '55px' };
const imgMain = { width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' };
const imgSub = { width: '35px', height: '35px', borderRadius: '8px', objectFit: 'cover', position: 'absolute', bottom: 0, right: 0, border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const itemTitle = { margin: '0 0 3px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: '700' };
const btnDelete = { background: '#fff1f2', color: '#e11d48', border: 'none', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };