import type { Metadata, Viewport } from "next";
import { Host_Grotesk } from "next/font/google";
import Script from "next/script";
import ScreenshotProtection from "@/components/ScreenshotProtection";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://speui.org";
const SITE_NAME = "SPE University of Ibadan Student Chapter";
const SITE_DESCRIPTION =
  "The official website of the Society of Petroleum Engineers (SPE) Student Chapter at the University of Ibadan - connecting students to the global energy industry through technical development, leadership, and professional networking.";

export const metadata: Metadata = {
  /* ── Core ── */
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: "SPE UI",

  /* ── Discovery ── */
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  keywords: [
    "SPE",
    "Society of Petroleum Engineers",
    "University of Ibadan",
    "Student Chapter",
    "petroleum engineering",
    "energy industry",
    "oil and gas",
    "engineering students",
    "technical development",
    "leadership",
    "networking",
    "Nigeria",
    "SPEUI",
  ],

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SPE UI",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SPE University of Ibadan",
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },

  /* ── Icons (file-convention handles favicon.ico, apple-icon.png, icon-*.png) ── */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },

  /* ── Manifest ── */
  manifest: "/manifest.json",

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Misc ── */
  category: "education",
  creator: "SPE University of Ibadan Student Chapter",
  publisher: "SPE University of Ibadan Student Chapter",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SPE UI",
    alternateName: ["SPE University of Ibadan", "SPE-UI", "Society of Petroleum Engineers UI"],
    url: SITE_URL,
  };

  const eduJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "SPE University of Ibadan Student Chapter",
    alternateName: "SPE UI",
    url: SITE_URL,
    logo: `${SITE_URL}/og-icon.png`,
    description: SITE_DESCRIPTION,
    parentOrganization: {
      "@type": "Organization",
      name: "Society of Petroleum Engineers",
      url: "https://www.spe.org",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ibadan",
      addressRegion: "Oyo",
      addressCountry: "NG",
    },
    sameAs: [],
  };

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem('spe_theme');
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${hostGrotesk.variable} antialiased`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P4Z0V881XE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P4Z0V881XE');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eduJsonLd) }}
        />
        <ScreenshotProtection />
        {children}
      </body>
    </html>
  );
}
