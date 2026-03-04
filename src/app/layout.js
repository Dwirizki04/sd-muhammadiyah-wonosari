import './globals.css';
import { Poppins } from 'next/font/google';
import ThemeControl from '@/components/ThemeControl';

// 1. Konfigurasi Font yang lebih optimal
const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins', // Menambahkan variabel CSS agar mudah digunakan di Tailwind jika perlu
});

// 2. Metadata SEO yang lebih lengkap dan terstruktur
export const metadata = {
  title: {
    default: 'SD Muhammadiyah Wonosari',
    template: '%s | SD Muhammadiyah Wonosari' // Berguna jika nanti ada halaman detail (misal: PPDB | SD Muri)
  },
  description: 'SD Muhammadiyah Wonosari berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami.',
  keywords: ["SD Muhammadiyah Wonosari", "SDM Wonosari", "SDMuri", "Sekolah Dasar Gunungkidul", "PPDB SD Wonosari"],
  authors: [{ name: 'SD Muhammadiyah Wonosari' }],
  metadataBase: new URL('https://sdmuri.netlify.app/'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <head>
        {/* FontAwesome CDN tetap di sini, tapi dirapikan */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          precedence="default"
        />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        {/* suppressHydrationWarning ditambahkan agar tidak error saat ada perbedaan kecil di render server/client */}
        <ThemeControl>
          <main>
            {children}
          </main>
        </ThemeControl>
      </body>
    </html>
  );
}