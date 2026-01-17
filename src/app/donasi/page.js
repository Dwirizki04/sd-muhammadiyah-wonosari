"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, onSnapshot, query, orderBy, where, limit, Timestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';

export default function DonasiPage() {
  const [stats, setStats] = useState({ collected: 0, target: 200000000, isOpen: false });
  const [donors, setDonors] = useState([]);
  const [formData, setFormData] = useState({ name: '', amount: '', message: '' });

  useEffect(() => {
    const unsubStats = onSnapshot(doc(db, "site_settings", "donation_stats"), (doc) => {
      if (doc.exists()) setStats(doc.data());
    });

    // Hanya tampilkan donatur yang sudah DI-VERIFIKASI oleh Admin
    const q = query(collection(db, "donations"), where("status", "==", "verified"), orderBy("date", "desc"), limit(10));
    const unsubDonors = onSnapshot(q, (snapshot) => {
      setDonors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubStats(); unsubDonors(); };
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  const amountNum = parseInt(formData.amount);
  const donorName = formData.name || "Hamba Allah";

  try {
    // 1. Simpan ke Firebase
    await addDoc(collection(db, "donations"), {
      name: donorName,
      amount: amountNum,
      message: formData.message,
      status: "pending",
      date: Timestamp.now()
    });

    // 2. Munculkan Pesan Terima Kasih yang Cantik
    Swal.fire({
      title: 'Terima Kasih, Donatur!',
      html: `
        <div style="text-align: center;">
          <p>Data donasi <b>${donorName}</b> sebesar <b>Rp ${amountNum.toLocaleString('id-ID')}</b> telah kami catat.</p>
          <hr>
          <p style="font-size: 0.9rem; color: #555;">Silakan lakukan transfer ke:</p>
          <div style="background: #f1f5f9; padding: 10px; border-radius: 8px; margin: 10px 0;">
            <b>BSI (Bank Syariah Indonesia)</b><br>
            Nomor Rekening: <b>7123456789</b><br>
            a.n <b>SD Muhammadiyah Wonosari</b>
          </div>
          <p style="font-size: 0.8rem;">Mohon konfirmasi dengan mengirimkan bukti transfer melalui tombol di bawah ini:</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: '<i className="fab fa-whatsapp"></i> Konfirmasi via WhatsApp',
      width: '90%',
      maxWidth: '450px',
      confirmButtonColor: '#25D366', // Warna Hijau WhatsApp
      showCancelButton: true,
      cancelButtonText: 'Tutup',
    }).then((result) => {
      if (result.isConfirmed) {
        // Alamat WhatsApp Sekolah
        const phone = "6285226443646"; 
        const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSaya *${donorName}* ingin mengonfirmasi donasi pembangunan kelas sebesar *Rp ${amountNum.toLocaleString('id-ID')}*.\n\nBerikut saya lampirkan bukti transfernya. Terima kasih.`;
        
        // Buka Link WhatsApp Otomatis
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    });

    // 3. Reset Form
    setFormData({ name: '', amount: '', message: '' });

  } catch (error) {
    Swal.fire("Oops!", "Gagal mengirim data: " + error.message, "error");
  }
};

  if (!stats.isOpen) return <div style={{padding:'300px', textAlign:'center'}}><h2>Donasi Ditutup</h2></div>;

  const percentage = Math.min((stats.collected / stats.target) * 100, 100);

  return (
    <div className="donation-container">
      <div className="stats-box">
        <h3>Progres Dana: Rp {stats.collected.toLocaleString('id-ID')}</h3>
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${percentage}%` }}>
            <span className="progress-label">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="donation-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginTop:'30px'}}>
        <div className="form-card" style={{background:'#f8fafc', padding:'25px', borderRadius:'15px'}}>
          <h4>Form Konfirmasi Transfer</h4>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <input type="text" placeholder="Nama Donatur" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required style={{padding:'10px'}}/>
            <input type="number" placeholder="Nominal Rp" value={formData.amount} onChange={e=>setFormData({...formData, amount:e.target.value})} required style={{padding:'10px'}}/>
            <textarea placeholder="Doa/Pesan" value={formData.message} onChange={e=>setFormData({...formData, message:e.target.value})} style={{padding:'10px'}}/>
            <div style={{fontSize:'0.8rem', background:'#e2e8f0', padding:'10px', borderRadius:'5px'}}>
               <strong>Transfer ke:</strong><br/>BSI: 7123456789 (SDM Wonosari)
            </div>
            <button type="submit" style={{padding:'12px', background:'#1a5d1a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Kirim Konfirmasi</button>
          </form>
        </div>

        <div className="list-card">
          <h4>Donatur Terverifikasi</h4>
          {donors.map(d => (
            <div key={d.id} style={{padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <strong>{d.name}</strong> <span style={{color:'#16a34a'}}>+ Rp {d.amount.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}