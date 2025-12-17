// src/app/layout.js
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Poppins } from 'next/font/google'; // Import Font

// Konfigurasi Font
const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'SD Muhammadiyah Wonosari',
  description: 'Mencetak Generasi Qurani, Prestasi Tiada Henti',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={poppins.className}>
        <Navbar />
        
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        
        <Footer /> {/* <--- PASANG DI SINI */}
      </body>
    </html>
  );
}