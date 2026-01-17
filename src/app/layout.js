import './globals.css';
import { Poppins } from 'next/font/google';
import LayoutWrapper from '@/components/LayoutWrapper';
import FloatingDonasi from '@/components/FloatingDonasi'; // 1. Import komponen tombol melayang

const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'SD Muhammadiyah Wonosari',
  description: 'SD Muhammadiyah Wonosari berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami',
  verification: {
    google: "0kN048Kn0QyN-ezAPPFauHBPjUxU2m-9MT-WhvPMbcw"
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Font Awesome untuk ikon tombol melayang */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={poppins.className}>
        <LayoutWrapper>
          {children}
          {/* 2. Tambahkan komponen di sini agar muncul di semua halaman */}
          <FloatingDonasi /> 
        </LayoutWrapper>
      </body>
    </html>
  );
}