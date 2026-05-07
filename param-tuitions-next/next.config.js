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
      // Public pages that live in the Vite app
      '/blog',
      '/available-tuitions',
      '/tuitions',
      '/bureau',
      '/why-choose-us',
      '/terms',
      '/post-inquiry',
      '/booking',
      '/booking-desk',
      '/thank-you',
      '/apply-school-teacher',
      '/dashboard',
      '/support-center',

      // Auth routes
      '/login',
      '/login-parent',
      '/login-teacher',
      '/login-institute',
      '/login-staff',
      '/admin-login',
      '/teacher-register',

      // Protected dashboard routes
      '/admin/dashboard',
      '/teacher/dashboard',
      '/teacher/upload-identity',
      '/parent/dashboard',
      '/super-admin/dashboard',
      '/superadmin/dashboard',
      '/institute/dashboard',
      '/super-admin/forms',
      '/super-admin/blogs',

      // Admin / staff tools
      '/verify-teachers',
      '/monthly-report',
      '/monthly-reports',
      '/notifications',
      '/job-board',
      '/teacher-id-card',
      '/tuition-control-room',
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
