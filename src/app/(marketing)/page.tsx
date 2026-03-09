/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function HomePage() {
  return (
    <div className="container mx-auto px-4" id="marketing-home">
      {/* Hero Section */}
      <section className="py-20 text-center" id="hero-section">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6" id="hero-title">
            AI-Powered Legal Practice Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8" id="hero-subtitle">
            Run mock trials with statute-grounded AI judges. Manage cases, analyze documents,
            and test strategies before stepping into real courtrooms.
          </p>
          <div className="space-x-4" id="hero-cta-buttons">
            <a
              href="/sign-up"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-700"
              id="hero-cta-primary"
            >
              Start Free Trial
            </a>
            <a
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-gray-50"
              id="hero-cta-secondary"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="features-section">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" id="features-title">
          Revolutionize Your Legal Practice
        </h2>
        <div className="grid md:grid-cols-3 gap-8" id="features-grid">
          <div className="text-center p-6" id="feature-mock-trials">
            <div className="w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              ⚖️
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Mock Trials</h3>
            <p className="text-gray-600">
              Test your case with AI judges trained on real statutes. Get unbiased rulings
              grounded in actual law, not hallucinations.
            </p>
          </div>

          <div className="text-center p-6" id="feature-case-management">
            <div className="w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📁
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Case Management</h3>
            <p className="text-gray-600">
              Organize cases, track deadlines, manage Rule 26 disclosures,
              and collaborate with your team in one secure platform.
            </p>
          </div>

          <div className="text-center p-6" id="feature-document-analysis">
            <div className="w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🔍
            </div>
            <h3 className="text-xl font-semibold mb-3">Document Intelligence</h3>
            <p className="text-gray-600">
              Upload legal documents and get AI-powered analysis, strategy insights,
              and statute compliance checking.
            </p>
          </div>
        </div>
      </section>

      {/* Blind Testing Section */}
      <section className="py-16 bg-gray-50" id="blind-testing-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6" id="blind-testing-title">
            Validate AI Accuracy with Blind Testing
          </h2>
          <p className="text-lg text-gray-600 mb-8" id="blind-testing-description">
            Compare AI outcomes to real case results. Test past cases to measure
            AI accuracy and build confidence in the system.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center" id="cta-section">
        <h2 className="text-3xl font-bold text-gray-900 mb-4" id="cta-title">
          Ready to Transform Your Practice?
        </h2>
        <p className="text-lg text-gray-600 mb-8" id="cta-subtitle">
          Join forward-thinking attorneys already using AI to win more cases.
        </p>
        <a
          href="/sign-up"
          className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-700"
          id="cta-button"
        >
          Start Your Free Trial
        </a>
      </section>
    </div>
  )
}