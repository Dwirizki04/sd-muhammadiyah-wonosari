/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Mengizinkan semua folder di Cloudinary Mas
      },
    ],
  },
};

export default nextConfig;