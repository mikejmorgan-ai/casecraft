import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact CaseBreak AI - Get in Touch",
  description: "Contact the CaseBreak AI team for demos, partnerships, support, or press inquiries. Based in Midvale, Utah.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b" id="contact-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">CaseBreak.AI</Link>
            <nav className="hidden md:flex items-center space-x-8" id="contact-nav">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
              <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16" id="contact-content">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" id="contact-title">Get in Touch</h1>
            <p className="text-xl text-gray-600">Whether you need a demo, have a support question, or want to explore a partnership.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
              <form className="space-y-4" id="contact-form">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company / Firm</label>
                  <input type="text" id="company" name="company" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Contact</label>
                  <select id="reason" name="reason" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="demo">Request a Demo</option>
                    <option value="support">Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold" id="contact-submit-btn">Send Message</button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@casebreak.ai</p>
                      <p className="text-gray-600">sales@casebreak.ai</p>
                      <p className="text-gray-600">press@casebreak.ai</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Headquarters</p>
                      <p className="text-gray-600">AI Venture Holdings LLC</p>
                      <p className="text-gray-600">Midvale, Utah, USA</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Response Time</p>
                      <p className="text-gray-600">We respond within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg" id="contact-demo-cta">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Schedule a Demo</h3>
                <p className="text-gray-600 mb-4">See CaseBreak AI in action with a 15-minute walkthrough.</p>
                <Link href="https://calendly.com/ai-consultant/casebreak-ai-demo" className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium" target="_blank" rel="noopener noreferrer">Book a Demo Call</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
