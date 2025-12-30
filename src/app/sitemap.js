// src/app/sitemap.js

export default function sitemap() {
  // Ganti URL ini jika nanti Mas Dwi sudah beli domain .sch.id
  const baseUrl = 'https://sdmuri.netlify.app'; 

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1, // Prioritas Tertinggi (Beranda)
    },
    {
      url: `${baseUrl}/about`, // Halaman Profil
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ekstrakurikuler`, // Halaman Ekskul
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ppdb`, // Halaman Pendaftaran
      lastModified: new Date(),
      changeFrequency: 'weekly', // Sering berubah infonya saat musim daftar
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`, // Halaman Kontak
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}