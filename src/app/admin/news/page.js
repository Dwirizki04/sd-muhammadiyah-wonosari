"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import Swal from 'sweetalert2';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', excerpt: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data Berita Real-time dari Firebase
  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 2. Handle Preview Gambar saat dipilih
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Fungsi Upload ke Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
      throw new Error("Gagal mendapatkan URL gambar");
    } catch (err) {
      console.error("Cloudinary Error:", err);
      return null;
    }
  };

  // 4. Submit Berita (Upload Gambar dulu, lalu Simpan ke Firestore)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      Swal.fire('Peringatan', 'Harap pilih foto berita terlebih dahulu!', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Step A: Upload ke Cloudinary
      const imageUrl = await uploadImageToCloudinary();

      if (!imageUrl) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengunggah gambar.', 'error');
        setLoading(false);
        return;
      }

      // Step B: Simpan ke Firestore
      await addDoc(collection(db, "news"), {
        title: form.title,
        excerpt: form.excerpt,
        image: imageUrl,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        createdAt: serverTimestamp()
      });

      // Reset Form
      setForm({ title: '', excerpt: '' });
      setImageFile(null);
      setImagePreview(null);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Berita sekolah telah diterbitkan.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal menerbitkan berita.', 'error');
    }
    setLoading(false);
  };

  // 5. Hapus Berita
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Berita?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "news", id));
        Swal.fire('Terhapus!', 'Berita telah dihapus.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus berita.', 'error');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>📰 Manajemen Berita Sekolah</h1>
      
      <div style={adminGrid}>
        {/* KOLOM KIRI: FORM INPUT */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px' }}>Tambah Berita</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              style={inputStyle} 
              placeholder="Judul Berita" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})} 
              required 
            />
            
            <div style={uploadBox}>
              <label style={labelStyle}>Foto Berita:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={previewStyle} />
              )}
            </div>

            <textarea 
              style={textareaStyle} 
              placeholder="Ringkasan Berita (Muncul di halaman depan)" 
              value={form.excerpt} 
              onChange={(e) => setForm({...form, excerpt: e.target.value})} 
              required 
            />

            <button type="submit" disabled={loading} style={loading ? btnDisabled : btnSubmit}>
              {loading ? '⏳ Sedang Memproses...' : '🚀 Terbitkan Berita'}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: DAFTAR BERITA */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px' }}>Daftar Berita</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {news.length > 0 ? news.map((item) => (
              <div key={item.id} style={newsItemStyle}>
                <img src={item.image} alt="news" style={newsThumbStyle} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{item.title}</h4>
                  <small style={{ color: '#64748b' }}>{item.date}</small>
                </div>
                <button onClick={() => handleDelete(item.id)} style={btnDelete}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            )) : <p style={{ color: '#94a3b8' }}>Belum ada berita.</p>}
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
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' };
const textareaStyle = { ...inputStyle, minHeight: '120px', resize: 'vertical' };
const labelStyle = { fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', display: 'block' };
const uploadBox = { padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '2px dashed #cbd5e1' };
const previewStyle = { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' };
const btnSubmit = { background: '#1a5d1a', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const btnDisabled = { ...btnSubmit, background: '#94a3b8', cursor: 'not-allowed' };
const newsItemStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px' };
const newsThumbStyle = { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' };
const btnDelete = { background: '#fee2e2', color: '#dc2626', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };