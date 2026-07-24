// src/app/sitemap.js

export default function sitemap() {
  // baseUrl TANPA garis miring di akhir
  const baseUrl = 'https://sdmuhwonosari.sch.id'; 

  return [
    {
      url: `${baseUrl}/`, // Beranda (ditambahkan / agar menjadi https://sdmuhwonosari.sch.id/)
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1, // Prioritas Tertinggi (Beranda)
    },
    {
      url: `${baseUrl}/about`, // Menjadi https://sdmuhwonosari.sch.id/about
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ekstrakurikuler`, // Menjadi https://sdmuhwonosari.sch.id/ekstrakurikuler
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ppdb`, // Menjadi https://sdmuhwonosari.sch.id/ppdb
      lastModified: new Date(),
      changeFrequency: 'weekly', // Sering berubah infonya saat musim daftar
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`, // Menjadi https://sdmuhwonosari.sch.id/contact
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}