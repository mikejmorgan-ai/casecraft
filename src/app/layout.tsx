import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "CaseBreak AI - AI-Powered Legal Case Analysis & Litigation Simulation",
    template: "%s | CaseBreak AI"
  },
  description: "CaseBreak AI uses artificial intelligence to analyze legal cases, simulate litigation, and automate document review. Built for law firms and legal professionals.",
  keywords: ["legal AI", "case analysis", "litigation simulation", "legal technology", "AI case management", "document review AI", "adversarial simulation"],
  authors: [{ name: "AI Venture Holdings LLC" }],
  creator: "AI Venture Holdings LLC",
  metadataBase: new URL("https://casebreak.ai"),
  openGraph: {
    type: "website",
    siteName: "CaseBreak AI",
    title: "CaseBreak AI - AI-Powered Legal Case Analysis & Litigation Simulation",
    description: "CaseBreak AI uses artificial intelligence to analyze legal cases, simulate litigation, and automate document review.",
    url: "https://casebreak.ai",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaseBreak AI - AI-Powered Legal Case Analysis",
    description: "Adversarial legal simulation and evidence validation for elite law firms.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#1e3a5f",
  },
}

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CaseBreak AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://casebreak.ai",
  "description": "AI-powered legal case analysis, litigation simulation, and document automation platform.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "offerCount": "2"
  },
  "creator": {
    "@type": "Organization",
    "name": "AI Venture Holdings LLC",
    "url": "https://casebreak.ai",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Midvale",
      "addressRegion": "UT",
      "addressCountry": "US"
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://casebreak.ai" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )

  if (!clerkPubKey) {
    return content
  }

  return <ClerkProvider>{content}</ClerkProvider>
}
