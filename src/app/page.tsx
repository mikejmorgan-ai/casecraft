import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/landing/Footer'
import { Scale, Gavel, FileText, Users, MessageSquare } from 'lucide-react'
import { StickyHeader } from '@/components/landing/StickyHeader'
import { HowItWorks } from '@/components/landing/HowItWorks'

export default function HomePage() {
  return (
    <div id="home-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Sticky Header with Glass Effect */}
      <StickyHeader className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8" />
            <span className="text-xl font-serif font-bold">CaseCraft</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Get Started</Button>
            </Link>
          </div>
        </div>
      </StickyHeader>

      {/* Hero */}
      <section id="home-hero" className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            Master Your Legal Strategy
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sharpen your courtroom skills with AI-powered simulations. Practice hearings, depositions,
            and case strategy sessions in a risk-free environment designed for legal professionals.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 cta-button">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="home-features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-center text-primary mb-12">
            Powerful Legal Simulation Tools
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="AI Legal Agents"
              description="Practice against realistic opposing counsel, judges, and witnesses. Build confidence before stepping into the courtroom."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Smart Document Analysis"
              description="Upload your case materials and receive intelligent insights. Agents reference relevant documents during simulations."
            />
            <FeatureCard
              icon={<Gavel className="h-8 w-8" />}
              title="Mock Proceedings"
              description="Conduct realistic hearings, depositions, and mediations. Identify weaknesses in your arguments before trial."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Strategy Sessions"
              description="Collaborate with AI legal experts to refine your case theory and develop winning arguments."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Animated Section */}
      <HowItWorks />

      {/* CTA */}
      <section id="home-cta" className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Elevate Your Legal Practice Today
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of legal professionals who are sharpening their skills with CaseCraft. Start your free trial and experience the future of legal preparation.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="cta-button">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="feature-card bg-white p-6 rounded-lg shadow-sm border cursor-pointer">
      <div className="icon-neon mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
