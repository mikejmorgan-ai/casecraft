import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaseCraft - AI Legal Simulation Platform",
  description: "AI-powered legal simulation for mock hearings, depositions, and case strategy with intelligent multi-agent personas",
  keywords: ["legal simulation", "AI legal", "mock trial", "case strategy", "legal tech"],
  authors: [{ name: "CaseCraft" }],
  openGraph: {
    title: "CaseCraft - AI Legal Simulation Platform",
    description: "AI-powered legal simulation for mock hearings, depositions, and case strategy",
    type: "website",
    locale: "en_US",
    siteName: "CaseCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaseCraft - AI Legal Simulation",
    description: "AI-powered legal simulation for mock hearings and case strategy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
