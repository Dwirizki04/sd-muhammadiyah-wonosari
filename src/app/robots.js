// src/app/robots.js

export default function robots() {
  return {
    rules: {
      userAgent: '*',     // Berlaku untuk semua robot (Google, Bing, Yahoo, dll)
      allow: '/',         // Boleh masuk ke semua halaman...
      disallow: '/admin/', // ...KECUALI halaman Admin (Rahasia!)
    },
    sitemap: 'https://sdmuri.netlify.app/sitemap.xml', // Petunjuk arah peta
  }
}