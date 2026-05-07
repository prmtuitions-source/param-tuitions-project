export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin-login',
          '/login',
          '/login-parent',
          '/login-teacher',
          '/login-staff',
          '/login-institute',
          '/teacher/dashboard',
          '/parent/dashboard',
          '/super-admin/',
          '/institute-dashboard',
          '/verify-teachers',
          '/monthly-reports',
          '/manage-forms',
          '/control-room',
          '/id-card',
          '/teacher-id-card',
          '/upload-identity',
          '/job-board',
          '/booking',
          '/booking-desk',
        ],
      },
    ],
    sitemap: 'https://www.paramtuitions.com/sitemap.xml',
  };
}
