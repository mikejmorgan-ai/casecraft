import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseBrake.ai - Legal Simulation Platform",
  description: "Practice case strategy with AI-powered agents. Run mock hearings, depositions, and strategy sessions.",
};

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
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
