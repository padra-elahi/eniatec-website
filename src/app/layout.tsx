import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import { site } from '@/data/site';
import './globals.css';

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-vazir',
});

const url = `https://${site.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'انیاتک', 'Eniatec', 'نرم افزار سازمانی', 'CRM فارسی', 'سامانه بازرسی',
    'طراحی سایت', 'Next.js', 'نرم افزار تحت وب', 'ERP ایرانی',
  ],
  authors: [{ name: site.name, url }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/og.svg'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  alternates: { canonical: url },
};

export const viewport: Viewport = {
  themeColor: '#060f1f',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  alternateName: site.nameFa,
  url,
  email: site.email,
  description: site.description,
  sameAs: [site.github],
  makesOffer: [
    { '@type': 'Offer', itemOffered: { '@type': 'SoftwareApplication', name: 'Persian CRM', applicationCategory: 'BusinessApplication' } },
    { '@type': 'Offer', itemOffered: { '@type': 'SoftwareApplication', name: 'Bazrasi', applicationCategory: 'BusinessApplication' } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable} suppressHydrationWarning>
      <head>
        <script
          // Applies the stored theme before first paint so there is no flash.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('eniatec-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
