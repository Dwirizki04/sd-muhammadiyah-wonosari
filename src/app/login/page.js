"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang kembali, Admin!',
        timer: 1500,
        showConfirmButton: false
      });
      
      router.push('/admin');
    } catch (error) {
      console.error(error);
      Swal.fire('Akses Ditolak', 'Email atau Password salah!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-bg">
      <div className="adm-login-card">
        <Image 
          src="/images/logo sdm woonsa.jpg" 
          alt="Logo Sekolah" 
          width={80} 
          height={80} 
          className="adm-login-logo"
        />
        <h2>LOGIN ADMIN</h2>
        <p>SD Muhammadiyah Wonosari</p>

        <form onSubmit={handleLogin}>
          <div className="adm-login-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="adm-login-input"
              placeholder="admin@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="adm-login-group">
            <label>Password</label>
            <input 
              type="password" 
              className="adm-login-input"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="adm-login-btn"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="adm-login-footer">
          <a href="/" className="adm-login-back">
            ← Kembali ke Website Utama
          </a>
        </div>
      </div>
    </div>
  );
}