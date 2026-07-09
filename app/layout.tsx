import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bhutandevelopersconnect.xyz"),
  verification: {
    google: "GYLBQwvAUlZ6S48oYT-Cp69r-mFE8i8qJcnggDUwH6o",
  },
  title: {
    default: "Bhutan Developer Connect | Professional Technical Collaboration",
    template: "%s | Bhutan Developer Connect"
  },
  description: "The professional technical layer for Bhutan's tech ecosystem. Join verified developers, find technical help, and form teams for impactful projects.",
  keywords: ["Bhutan Tech", "Developers Bhutan", "Tech Collaboration", "Bhutan Developer Network", "Bhutantech Ecosystem", "Professional Identity", "Technical Reputation"],
  authors: [{ name: "BDN Team" }],
  creator: "Bhutan Developer Network",
  publisher: "Bhutan Developer Network",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_BT",
    url: "https://www.bhutandevelopersconnect.xyz",
    siteName: "Bhutan Developer Connect",
    title: "Bhutan Developer Connect | The National Technical Grid",
    description: "Connecting Bhutan's tech community through identity, collaboration, and vetted technical reputation.",
    images: [
      {
        url: "/og-image.png", // We should ensure this exists or create it
        width: 1200,
        height: 630,
        alt: "Bhutan Developer Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhutan Developer Connect (BDN)",
    description: "The professional technical layer for Bhutan's tech ecosystem. Connect, build, and grow.",
    images: ["/og-image.png"],
    creator: "@BhutanDevNet", // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { Toaster } from "sonner";
import { ProfileProvider } from "@/providers/profile-provider";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <ProfileProvider>
          {children}
        </ProfileProvider>
        <Toaster position="top-center" expand={false} richColors />
      </body>
    </html>
  );
}
