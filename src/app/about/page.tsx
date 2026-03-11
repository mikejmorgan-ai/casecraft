/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function AboutPage() {
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
              <a href="/about" className="text-blue-600 font-medium">About</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8" id="about-title">
            About CaseBreak.AI
          </h1>

          <div className="prose max-w-none">
            <section className="mb-12" id="about-mission">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                CaseBreak.AI revolutionizes legal practice by providing attorneys with AI-powered tools
                that eliminate guesswork and enhance case strategy. Our platform combines cutting-edge
                artificial intelligence with deep legal expertise to help law firms win more cases.
              </p>
            </section>

            <section className="mb-12" id="about-problem">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Problem We Solve</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Traditional Legal Practice</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Unpredictable case outcomes</li>
                    <li>• Limited strategy testing</li>
                    <li>• Manual document analysis</li>
                    <li>• Time-consuming research</li>
                    <li>• Inconsistent quality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">With CaseBreak.AI</h3>
                  <ul className="text-blue-600 space-y-2">
                    <li>• Predictable AI-tested strategies</li>
                    <li>• Mock trials before court</li>
                    <li>• Automated document insights</li>
                    <li>• Instant statute compliance</li>
                    <li>• Consistent excellence</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12" id="about-technology">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Technology</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Statute-Grounded AI</h3>
                <p className="text-gray-600 mb-4">
                  Unlike other AI systems that hallucinate legal citations, our AI judges are trained
                  exclusively on verified statutes and case law. Every ruling cites real, applicable law.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0%</div>
                    <div className="text-sm text-gray-600">Hallucinated Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600">Real Statutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">95%+</div>
                    <div className="text-sm text-gray-600">Accuracy Rate</div>
                  </div>
                </div>
              </div>
            </section>

            <section id="about-team">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Built by Legal Professionals</h2>
              <p className="text-lg text-gray-600 mb-6">
                Our team combines practicing attorneys, AI researchers, and legal technology experts.
                We understand the law because we practice it, and we build technology that actually
                serves the needs of legal professionals.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <blockquote className="text-lg text-blue-900 italic">
                  "Every feature in CaseBreak.AI was born from a real frustration we experienced
                  in our own practice. We built the platform we wished existed."
                </blockquote>
                <cite className="text-blue-700 font-medium mt-2 block">- CaseBreak.AI Founding Team</cite>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}