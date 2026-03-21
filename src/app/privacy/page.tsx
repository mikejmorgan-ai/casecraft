import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy - CaseBreak AI",
  description: "CaseBreak AI Privacy Policy. Learn how we collect, use, and protect your data. GDPR and CCPA compliant.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b" id="privacy-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">CaseBreak.AI</Link>
            <nav className="hidden md:flex items-center space-x-8" id="privacy-nav">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 id="privacy-title">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Effective Date: March 20, 2026 | Last Updated: March 20, 2026</p>

          <h2>1. Introduction</h2>
          <p>AI Venture Holdings LLC (&ldquo;Company&rdquo;) operates CaseBreak AI at casebreak.ai. This Privacy Policy explains how we collect, use, disclose, and safeguard your information. We comply with GDPR, CCPA/CPRA, and other applicable privacy regulations.</p>

          <h2>2. Information We Collect</h2>
          <p><strong>Information You Provide:</strong> Account information (name, email, organization), payment information (processed by Stripe), user content (documents and inputs), and communications.</p>
          <p><strong>Automatically Collected:</strong> Device information, usage data, log data, and cookies.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to provide and operate the Service, process payments, analyze uploaded content to generate AI outputs, improve the Service, send service communications, and comply with legal obligations.</p>
          <p><strong>We do NOT:</strong> Sell your personal information, use your case data to train AI models without explicit consent, or share data with advertisers.</p>

          <h2>4. Data Sharing</h2>
          <p>We share data only with service providers (cloud hosting, Stripe), when required by law, in connection with business transfers, and with your explicit consent. We may share aggregated, anonymized data.</p>

          <h2>5. Your Privacy Rights</h2>
          <h3>All Users</h3>
          <p>Access, correction, deletion, data export, and opt-out of marketing.</p>
          <h3>GDPR (EU/EEA/UK Users)</h3>
          <p>Restrict processing, object to processing, withdraw consent, lodge complaints with your DPA, and data portability. Contact: privacy@casebreak.ai</p>
          <h3>CCPA/CPRA (California Residents)</h3>
          <p>Right to know, delete, correct, and opt-out of sale/sharing. We do not sell or share personal information for advertising.</p>

          <h2>6. Data Security</h2>
          <p>AES-256 encryption at rest, TLS 1.3 in transit, role-based access controls, SOC 2-aligned security practices, 24/7 monitoring, and documented incident response.</p>

          <h2>7. Cookie Policy</h2>
          <p>We use strictly necessary cookies (authentication, security), functional cookies (preferences), and analytics cookies (usage patterns). You can control cookies through browser settings. We honor Do Not Track signals.</p>

          <h2>8. AI-Specific Disclosures</h2>
          <p>CaseBreak AI uses NLP, pattern recognition, and predictive analytics. We do not use your uploaded content to train models unless you opt in. No automated decisions with legal effects are made without human review.</p>

          <h2>9. Contact</h2>
          <p>Privacy inquiries: privacy@casebreak.ai<br/>General support: support@casebreak.ai<br/>AI Venture Holdings LLC, Midvale, Utah, USA</p>

          <p className="text-sm text-gray-500 mt-12 border-t pt-4">This document is for informational purposes. Consult a qualified attorney for legal advice specific to your situation.</p>
        </div>
      </main>
    </div>
  )
}
