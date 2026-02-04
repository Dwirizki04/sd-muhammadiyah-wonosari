import './globals.css';
import { Poppins } from 'next/font/google';
import ThemeControl from '@/components/ThemeControl';

const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'SD Muhammadiyah Wonosari',
  description: 'SD Muhammadiyah Wonosari berkomitmen tidak hanya berfokus pada pendidikan akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter Islami.',
  keywords: "SD Muhammadiyah Wonosari, SDM Wonosari, Sekolah Dasar Gunungkidul, PPDB SD Wonosari",
  icons: { icon: '/favicon.ico' },
  metadataBase: new URL('https://sdmuri.netlify.app/'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className={poppins.className}>
        {/* HANYA THEME CONTROL. 
            JANGAN ADA LayoutWrapper DI SINI KARENA AKAN DOUBLE. */}
        <ThemeControl>
          {children}
        </ThemeControl>
      </body>
    </html>
  );
}