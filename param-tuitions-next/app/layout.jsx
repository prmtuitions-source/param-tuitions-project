import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import AnimationObserver from './components/AnimationObserver';

export const metadata = {
  metadataBase: new URL('https://www.paramtuitions.com'),
  title: {
    default: 'Param Tuition Bureau – Best Home Tutors in Varanasi',
    template: '%s | Param Tuition Bureau',
  },
  description:
    'Param Tuition Bureau is Varanasi\'s most trusted home tuition consultancy with 3,000+ verified tutors for CBSE, ICSE and UP Board students.',
  keywords: ['home tutor varanasi', 'home tuition varanasi', 'private tutor varanasi', 'param tuition bureau'],
  authors: [{ name: 'Param Tuition Bureau' }],
  creator: 'Param Tuition Bureau',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Param Tuition Bureau',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Param Tuition Bureau' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Param Tuition Bureau – Best Home Tutors in Varanasi',
    description: 'Connect with 3,000+ verified home tutors in Varanasi. CBSE, ICSE, UP Board.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AnimationObserver />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
