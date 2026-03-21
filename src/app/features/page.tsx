import type { Metadata } from "next"
import Link from "next/link"
import { Scale, Target, FileText, Brain, Shield, Clock, BarChart3, Users, Zap, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Features - CaseBreak AI | Case Analysis, Risk Scoring & Document Automation",
  description: "Explore CaseBreak AI features: adversarial legal simulation, AI case analysis, automated document review, predictive analytics, and compliance monitoring for legal professionals.",
}

const features = [
  {
    icon: "Target",
    title: "Adversarial Legal Simulation",
    description: "Deploy AI opposing counsel, expert witnesses, and judicial agents to stress-test your legal positions. Uncover weaknesses and strategic vulnerabilities before they surface in actual litigation.",
    bullets: ["Multi-agent adversarial battle simulation", "AI judicial review with 95%+ accuracy", "Real-time weakness identification", "Strategic recommendation engine"]
  },
  {
    icon: "FileText",
    title: "Bates-Strict Evidence Validation",
    description: "Enterprise-grade document intelligence with strict Bates numbering compliance. Every citation traced to source with confidence scoring and evidence chain validation.",
    bullets: ["Automated Bates number verification", "Source citation with confidence scoring", "Evidence chain validation", "OCR confidence thresholding at 85%"]
  },
  {
    icon: "Brain",
    title: "AI Case Analysis Engine",
    description: "Deep case intelligence that goes beyond keyword matching. Our engine reads case documents, extracts relevant facts, identifies patterns across thousands of comparable cases.",
    bullets: ["Natural language processing for legal documents", "Pattern recognition across case data", "Jurisdiction-aware analysis for all 50 states", "Real-time updates as new data enters"]
  },
  {
    icon: "BarChart3",
    title: "Predictive Analytics Dashboard",
    description: "Multi-case portfolio view of litigation risk. Track trends, identify systemic issues, and benchmark against anonymized industry data from one dashboard.",
    bullets: ["Aggregated risk scores per case and attorney", "30/60/90-day trend visualization", "Case strength ranking", "Export to PDF and Excel"]
  },
  {
    icon: "Clock",
    title: "Deadline and Compliance Tracking",
    description: "Automatically tracks statute of limitations, filing deadlines, and discovery windows across all jurisdictions. Push notifications keep you ahead of every deadline.",
    bullets: ["Auto-calculates SOL by jurisdiction", "Accounts for tolling exceptions", "Calendar integration for deadline syncing", "Dashboard widget sorted by urgency"]
  },
  {
    icon: "Shield",
    title: "Enterprise Security",
    description: "Bank-level security with AES-256 encryption, role-based access controls, and SOC 2-aligned practices. Your case data is completely isolated and never used to train AI models.",
    bullets: ["AES-256 encryption at rest, TLS 1.3 in transit", "Role-based access for attorneys and staff", "Complete data isolation per organization", "GDPR and CCPA compliant"]
  }
]

const iconMap: Record<string, any> = { Target, FileText, Brain, BarChart3, Clock, Shield }

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b" id="features-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">CaseBreak.AI</Link>
            <nav className="hidden md:flex items-center space-x-8" id="features-nav">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/features" className="text-blue-600 font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30" id="features-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Everything You Need to Win More Cases</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">CaseBreak AI combines adversarial simulation, evidence validation, and predictive analytics into one platform built for elite legal teams.</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16" id="features-list">
        <div className="max-w-5xl mx-auto space-y-24">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Target
            const isReversed = i % 2 === 1
            return (
              <div key={i} className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`} id={`features-block-${i}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{feature.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 flex items-center justify-center min-h-[300px]">
                  <Icon className="h-24 w-24 text-blue-300" />
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center" id="features-cta">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to See CaseBreak AI in Action?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Schedule a 15-minute demo or start your free trial today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://calendly.com/ai-consultant/casebreak-ai-demo" className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 font-semibold" target="_blank" rel="noopener noreferrer">Schedule Demo</Link>
            <Link href="/sign-up" className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white/10 font-semibold">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
