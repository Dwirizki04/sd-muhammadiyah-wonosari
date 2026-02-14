"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  uploadToCloudinary, 
  subscribeNews, 
  createNewsEntry, 
  removeNewsEntry 
} from '@/lib/newsService';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', excerpt: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeNews(setNews);
    return () => unsub();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return Swal.fire('Peringatan', 'Harap pilih foto!', 'warning');

    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(imageFile);
      if (!imageUrl) throw new Error("Upload gagal");

      await createNewsEntry(form.title, form.excerpt, imageUrl);

      setForm({ title: '', excerpt: '' });
      setImageFile(null);
      setImagePreview(null);
      Swal.fire({ title: 'Berhasil!', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'Gagal menerbitkan berita.', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Berita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await removeNewsEntry(id);
        Swal.fire('Terhapus!', 'Berita telah dihapus.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus.', 'error');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>📰 Manajemen Berita Sekolah</h1>
      <div style={adminGrid}>
        {/* FORM SECTION */}
        <div style={cardStyle}>
          <h3>Tambah Berita</h3>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              style={inputStyle} placeholder="Judul Berita" 
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required 
            />
            <div style={uploadBox}>
              <label style={labelStyle}>Foto Berita:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && <img src={imagePreview} alt="Preview" style={previewStyle} />}
            </div>
            <textarea 
              style={textareaStyle} placeholder="Ringkasan Berita..." 
              value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} required 
            />
            <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
              {loading ? '⏳ Memproses...' : '🚀 Terbitkan Berita'}
            </button>
          </form>
        </div>

        {/* LIST SECTION */}
        <div style={cardStyle}>
          <h3>Daftar Berita</h3>
          <div style={listScrollContainer}>
            {news.map((item) => (
              <div key={item.id} style={newsItemStyle}>
                <img src={item.image} alt="news" style={newsThumbStyle} />
                <div style={{ flex: 1 }}>
                  <h4 style={itemTitleStyle}>{item.title}</h4>
                  <small style={{ color: '#64748b' }}>{item.date}</small>
                </div>
                <button onClick={() => handleDelete(item.id)} style={btnDelete}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' };
const titleStyle = { color: '#1a5d1a', marginBottom: '30px', textAlign: 'center' };
const adminGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' };
const textareaStyle = { ...inputStyle, minHeight: '120px', resize: 'vertical' };
const labelStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', display: 'block' };
const uploadBox = { padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '2px dashed #cbd5e1' };
const previewStyle = { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' };
const btnSubmit = { background: '#1a5d1a', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed' };
const listScrollContainer = { maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' };
const newsItemStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px' };
const newsThumbStyle = { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' };
const itemTitleStyle = { margin: '0 0 5px 0', fontSize: '1rem' };
const btnDelete = { background: '#fee2e2', color: '#dc2626', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };