"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await signOut(auth);
      // Hapus data cadangan jika ada di localStorage
      localStorage.clear(); 
      router.replace('/login');
    };
    performLogout();
  }, [router]);

  return (
    // Bagian ini akan menutupi seluruh layar (Header web pun akan tertutup)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a] font-sans">
      <div className="text-center p-10 bg-[#1e293b] rounded-[2rem] border border-slate-700 shadow-2xl max-w-sm w-full mx-4 transform transition-all">
        
        {/* Ikon Gembok Beranimasi */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/10 p-5 rounded-full">
            <span className="text-6xl animate-pulse">🔒</span>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold mb-2 tracking-tight">Sesi Berakhir</h1>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Sistem internal telah dikunci.<br/>
          Terima kasih atas kerja kerasnya, <strong>Pak Admin</strong>.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => router.push('/admin')} // Asumsi halaman login ada di /admin atau buat /login
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Login Kembali
          </button>
          
          <button 
            onClick={() => router.push('/')} 
            className="w-full bg-transparent hover:bg-slate-700 text-slate-400 font-medium py-2 text-xs transition-all uppercase tracking-widest"
          >
            Ke Halaman Utama Web
          </button>
        </div>
        
        <div className="mt-8 border-t border-slate-700 pt-6">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
            Secure Admin Portal v2.0
          </p>
        </div>
      </div>
    </div>
  );
}