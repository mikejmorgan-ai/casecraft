import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseCraft - Legal Simulation Platform",
  description: "Practice case strategy with AI-powered agents. Run mock hearings, depositions, and strategy sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
