/** @type {import('next').NextConfig} */

const VITE_ROUTES = [
  // Content pages in Vite
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

  // Auth
  '/login',
  '/login-parent',
  '/login-teacher',
  '/login-institute',
  '/login-staff',
  '/admin-login',
  '/teacher-register',

  // Dashboards
  '/admin/dashboard',
  '/teacher/dashboard',
  '/teacher/upload-identity',
  '/parent/dashboard',
  '/super-admin/dashboard',
  '/superadmin/dashboard',
  '/institute/dashboard',
  '/super-admin/forms',
  '/super-admin/blogs',

  // Staff tools
  '/verify-teachers',
  '/monthly-report',
  '/monthly-reports',
  '/manage-forms',
  '/notifications',
  '/job-board',
  '/id-card',
  '/teacher-id-card',
  '/tuition-control-room',
  '/control-room',
  '/google-contacts',
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  async redirects() {
    return VITE_ROUTES.flatMap((route) => [
      {
        source: route,
        destination: `https://app.paramtuitions.com${route}`,
        permanent: false,
      },
      {
        source: `${route}/:path*`,
        destination: `https://app.paramtuitions.com${route}/:path*`,
        permanent: false,
      },
    ]);
  },
};

module.exports = nextConfig;
