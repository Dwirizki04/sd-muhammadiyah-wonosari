"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  uploadMultipleToCloudinary, subscribeNews, 
  createNewsEntry, removeNewsEntry, updateNewsEntry 
} from '@/lib/newsService';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', excerpt: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); // ID jika sedang mode edit

  useEffect(() => {
    const unsub = subscribeNews(setNews);
    return () => unsub();
  }, []);

  // Handle Pilih Gambar (Fleksibel)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls = previews; // Gunakan foto yang sudah ada jika tidak ganti file saat edit

      // Jika ada file baru yang dipilih, upload dulu
      if (selectedFiles.length > 0) {
        imageUrls = await uploadMultipleToCloudinary(selectedFiles);
      }

      if (editId) {
        await updateNewsEntry(editId, form.title, form.excerpt, imageUrls);
        Swal.fire({ title: 'Berita Diperbarui!', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        await createNewsEntry(form.title, form.excerpt, imageUrls);
        Swal.fire({ title: 'Berita Terbit!', icon: 'success', timer: 1500, showConfirmButton: false });
      }

      // Reset
      resetForm();
    } catch (err) {
      Swal.fire('Error', 'Gagal memproses data', 'error');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: '', excerpt: '' });
    setSelectedFiles([]);
    setPreviews([]);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, excerpt: item.excerpt });
    setPreviews(item.images || []);
    setSelectedFiles([]); // Kosongkan agar tidak re-upload jika tidak ganti foto
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({ title: 'Hapus Berita?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' });
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
        {/* FORM INPUT */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>{editId ? '📝 Edit Berita' : '🚀 Buat Berita Baru'}</h3>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              style={inputStyle} placeholder="Judul Berita" 
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required 
            />
            
            <div style={uploadBox}>
              <label style={labelStyle}>Pilih Foto (Boleh banyak):</label>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} />
              <div style={previewGrid}>
                {previews.map((url, i) => (
                  <img key={i} src={url} style={previewThumb} alt="preview" />
                ))}
              </div>
            </div>

            <textarea 
              style={textareaStyle} placeholder="Ringkasan berita..." 
              value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} required 
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
                {loading ? '⏳ Memproses...' : (editId ? 'Simpan Perubahan' : 'Terbitkan Berita')}
              </button>
              {editId && <button type="button" onClick={resetForm} style={btnCancel}>Batal</button>}
            </div>
          </form>
        </div>

        {/* LIST BERITA */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Daftar Berita</h3>
          <div style={listScrollContainer}>
            <AnimatePresence>
              {news.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={newsItemStyle}>
                  <div style={thumbContainer}>
                    <img src={item.images?.[0]} style={imgMain} />
                    {item.images?.length > 1 && (
                      <div style={imgBadge}>+{item.images.length - 1}</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={itemTitle}>{item.title}</h4>
                    <small style={{ color: '#94a3b8' }}>{item.date}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleEdit(item)} style={btnEdit}>✏️</button>
                    <button onClick={() => handleDelete(item.id)} style={btnDelete}>🗑️</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLING ---
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
const previewGrid = { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' };
const previewThumb = { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid white' };
const btnSubmit = { background: '#1a5d1a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', flex: 1 };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed' };
const btnCancel = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer' };
const listScrollContainer = { maxHeight: '600px', overflowY: 'auto' };
const newsItemStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '10px' };
const thumbContainer = { position: 'relative', width: '50px', height: '50px' };
const imgMain = { width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' };
const imgBadge = { position: 'absolute', top: -5, right: -5, background: '#1a5d1a', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', border: '2px solid white' };
const itemTitle = { margin: 0, fontSize: '0.9rem', color: '#1e293b' };
const btnDelete = { background: '#fff1f2', color: '#e11d48', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer' };
const btnEdit = { background: '#f0fdf4', color: '#16a34a', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer' };