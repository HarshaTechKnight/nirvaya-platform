import type { Metadata, Viewport } from "next"
import { Fraunces, Inter } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a2620" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "CoFlare — Institutional Curator for AP Innovation",
    template: "%s | CoFlare",
  },
  description:
    "The institutional platform connecting Founders, Mentors, and Investors across Andhra Pradesh. Build your startup network, find co-founders, access grants, and grow with India's next-gen innovation ecosystem.",
  keywords: [
    "startup",
    "founder",
    "mentor",
    "investor",
    "Andhra Pradesh",
    "innovation",
    "AP startup ecosystem",
    "co-founder",
    "startup grants",
    "venture capital",
    "incubation",
    "CoFlare",
  ],
  authors: [{ name: "CoFlare", url: "https://coflare.in" }],
  creator: "CoFlare",
  publisher: "CoFlare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://coflare.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "CoFlare",
    title: "CoFlare — Institutional Curator for AP Innovation",
    description:
      "The institutional platform connecting Founders, Mentors, and Investors across Andhra Pradesh.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoFlare — AP Innovation Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoFlare — Institutional Curator for AP Innovation",
    description:
      "The institutional platform connecting Founders, Mentors, and Investors across Andhra Pradesh.",
    images: ["/og-image.png"],
    creator: "@coflare",
  },
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0f6e56",
      },
    ],
  },
  manifest: "/manifest.json",
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/fraunces-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="bg-cream antialiased min-h-screen font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}