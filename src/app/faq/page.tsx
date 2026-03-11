/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b" id="marketing-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-blue-900">
                <a href="/">CaseBreak.AI</a>
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8" id="marketing-nav">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/faq" className="text-blue-600 font-medium">FAQ</a>
              <a href="/dashboard" className="text-blue-600 hover:text-blue-700">Dashboard</a>
              <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" id="faq-title">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about CaseBreak.AI
            </p>
          </div>

          <div className="space-y-8" id="faq-content">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How accurate are the AI mock trials?
              </h3>
              <p className="text-gray-600">
                Our AI judges achieve 95%+ accuracy when compared to real court outcomes in blind testing.
                The system is trained exclusively on verified statutes and case law, eliminating hallucinated
                citations that plague other AI systems.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What makes CaseBreak.AI different from other legal AI tools?
              </h3>
              <p className="text-gray-600 mb-3">
                Three key differences:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li><strong>Zero Hallucination:</strong> Our AI only cites real, verified statutes</li>
                <li><strong>Mock Trials:</strong> Test your entire case strategy before court</li>
                <li><strong>Blind Testing:</strong> Validate AI accuracy against real outcomes</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Is my case data secure and confidential?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level encryption, SOC 2 compliance, and strict attorney-client
                privilege protections. Your data is completely isolated from other firms and never used
                to train AI models. We're GDPR and CCPA compliant.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I upload existing case files?
              </h3>
              <p className="text-gray-600">
                Yes, upload PDFs, Word documents, and other case materials. Our system extracts text,
                analyzes content, and makes documents searchable across your entire case library.
                Professional plans include unlimited storage.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How do mock trials work?
              </h3>
              <p className="text-gray-600">
                Upload your case materials, select jurisdiction and case type, then present your arguments
                to our AI judge. The judge asks clarifying questions and issues rulings based on applicable
                statutes. You get a full transcript and detailed reasoning for every decision.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What is blind adjudication testing?
              </h3>
              <p className="text-gray-600">
                Test AI accuracy by running concluded cases through our system without revealing the real
                outcome. Compare AI predictions to actual results to build confidence in the technology.
                This transparency sets us apart from "black box" AI systems.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Which jurisdictions are supported?
              </h3>
              <p className="text-gray-600">
                All 50 US states plus federal courts. Our statute database is continuously updated with
                the latest laws and regulations. International expansion (UK, Canada, Australia) is
                planned for 2026.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I integrate CaseBreak.AI with my existing practice management software?
              </h3>
              <p className="text-gray-600">
                Enterprise plans include custom integrations with popular systems like Clio, MyCase,
                and PracticePanther. We also provide APIs for custom integrations. Contact our sales
                team to discuss your specific needs.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How do I manage Rule 26 disclosures?
              </h3>
              <p className="text-gray-600">
                Our platform includes structured forms for initial disclosures, expert disclosures,
                and pretrial disclosures. Auto-populate from uploaded documents, track deadlines,
                manage version history, and export to PDF for filing.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What if I need help getting started?
              </h3>
              <p className="text-gray-600">
                Professional and Enterprise plans include onboarding support, training sessions, and
                dedicated customer success managers. We also provide comprehensive documentation, video
                tutorials, and best practice guides.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, cancel anytime with no penalties or fees. Your data remains accessible for 90 days
                after cancellation, giving you time to export everything. We also provide data export
                assistance if needed.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How do I get started?
              </h3>
              <p className="text-gray-600 mb-4">
                Start with our free 30-day trial. No credit card required. Upload a case, run a mock trial,
                and experience the power of statute-grounded AI for yourself.
              </p>
              <a href="/dashboard" className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
                Start Free Trial →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}