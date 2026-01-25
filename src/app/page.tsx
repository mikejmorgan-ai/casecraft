import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, Gavel, FileText, Users, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div id="home-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header id="home-header" className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8" />
            <span className="text-xl font-serif font-bold">CaseCraft</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-primary-foreground hover:text-secondary">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home-hero" className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            Legal Simulation Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Practice case strategy with AI-powered agents. Run mock hearings, depositions,
            and strategy sessions with intelligent legal personas.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Simulating
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
              description="Interact with intelligent agents playing roles like Judge, Plaintiff Attorney, and Defense Counsel."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Document RAG"
              description="Upload case documents and have agents reference them intelligently during conversations."
            />
            <FeatureCard
              icon={<Gavel className="h-8 w-8" />}
              title="Mock Proceedings"
              description="Run simulated hearings, depositions, and mediations with multiple agents."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Strategy Sessions"
              description="Brainstorm case strategy with AI attorneys who know your case facts."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="home-cta" className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready to transform your legal practice?
          </h2>
          <p className="text-gray-300 mb-8">
            Create your free account and start your first case simulation.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="home-footer" className="bg-[var(--color-legal-navy-dark)] text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-6 w-6" />
            <span className="font-serif font-bold">CaseCraft</span>
          </div>
          <p className="text-gray-400 text-sm">
            AI-powered legal simulation platform
          </p>
        </div>
      </footer>
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
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-secondary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
