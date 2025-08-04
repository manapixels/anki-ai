/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'ipgzmkvrluzzgcfnnuqi.supabase.co' },
      { protocol: 'https', hostname: 'breaddie.vercel.app' },
    ],
  },
};
export default nextConfig;
