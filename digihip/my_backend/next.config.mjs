/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   basePath: '/phone',
//   async redirects() {
//     return [
//       {
//         source: '/phone',
//         destination: '/phone/',
//         permanent: true,
//       },
//       // Add any other redirects you might need
//     ]
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/phone/api/:path*',
//         destination: 'http://139.91.210.34/api/:path*', // Proxy API requests
//       },
//     ]
//   }
// }

// export default nextConfig
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
