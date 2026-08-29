import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AppProviders } from "@/components/site/providers";
import { profile } from "@/lib/portfolio";

// Optimized self-hosted fonts via next/font (zero layout shift)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TODO(owner): set to your production domain
const siteUrl = "https://alexvolkov.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — Independent Developer`,
    template: `%s · ${profile.name}`,
  },
  description:
    "Portfolio of Alex Volkov, independent developer: web platforms, desktop software, CLI tools and open source. Портфолио независимого разработчика.",
  keywords: [
    "Alex Volkov",
    "developer",
    "portfolio",
    "independent developer",
    "web development",
    "open source",
    "разработчик",
    "портфолио",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  alternates: {
    canonical: "/",
    languages: { "en-US": "/", "ru-RU": "/" },
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: `${profile.name} — Projects` },
        { url: "/notes.xml", title: `${profile.name} — Notes` },
      ],
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: profile.name,
    title: `${profile.name} — Independent Developer`,
    description:
      "Web platforms, desktop apps, CLI tools and open source. Made with care.",
    images: [
      {
        url: "/images/profile/og-image.png",
        width: 1344,
        height: 768,
        alt: `${profile.name} — portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Independent Developer`,
    description: "Web platforms, desktop apps, CLI tools and open source.",
    images: ["/images/profile/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0F14" },
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
