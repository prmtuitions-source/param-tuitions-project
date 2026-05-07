/** @type {import('next').NextConfig} */
const VITE_APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

const nextConfig = {
  // Static export for pure SSG (use only if not using ISR or server-side auth)
  // output: 'export',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    unoptimized: false,
  },

  // Proxy all dashboard/auth/internal routes to the existing Vite app
  async rewrites() {
    const proxyRoutes = [
      '/login',
      '/login-parent',
      '/login-teacher',
      '/login-institute',
      '/login-staff',
      '/admin-login',
      '/teacher-register',
      '/admin/dashboard',
      '/teacher/dashboard',
      '/parent/dashboard',
      '/super-admin/dashboard',
      '/institute-dashboard',
      '/verify-teachers',
      '/monthly-reports',
      '/manage-forms',
      '/notifications',
      '/job-board',
      '/id-card',
      '/teacher-id-card',
      '/control-room',
      '/post-inquiry',
      '/booking',
      '/booking-desk',
      '/upload-identity',
      '/thank-you',
      '/apply-school-teacher',
      '/google-contacts',
    ];

    return proxyRoutes.flatMap((route) => [
      {
        source: route,
        destination: `${VITE_APP_URL}${route}`,
      },
      {
        source: `${route}/:path*`,
        destination: `${VITE_APP_URL}${route}/:path*`,
      },
    ]);
  },
};

module.exports = nextConfig;
