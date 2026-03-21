/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Scale,
  Gavel,
  FileText,
  Target,
  Shield,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
  Brain,
  Search,
  Lock,
  Star
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CaseBreak.ai
            </span>
            <Badge variant="secondary" className="ml-2 text-xs">Enterprise</Badge>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/features">
              <Button variant="ghost" className="hover:bg-blue-50">Features</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="hover:bg-blue-50">Pricing</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="hover:bg-blue-50">About</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-4">
              <Star className="w-3 h-3 mr-1" />
              World's First Adversarial Legal Simulation Platform
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Master Litigation Through
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Adversarial Simulation
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Enterprise-grade legal intelligence platform featuring <strong className="text-slate-900">Adversarial Legal Simulation</strong> and
            <strong className="text-slate-900"> Bates-Strict Evidence Validation</strong>.
            Battle-test your cases against AI opposing counsel before stepping into the courtroom.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Adversarial Testing
                <Gavel className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { icon: <Shield />, label: "SOC 2-Aligned" },
              { icon: <Lock />, label: "End-to-End Encrypted" },
              { icon: <FileText />, label: "Bates Numbering" },
              { icon: <Target />, label: "99.9% Accuracy" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-slate-600">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Enterprise Legal Intelligence
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Two Revolutionary Capabilities
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Purpose-built for BigLaw firms demanding the highest standards of legal preparation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Adversarial Legal Simulation */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-blue-200 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Adversarial Legal Simulation</h3>
                    <Badge variant="secondary" className="mt-1">Core Technology</Badge>
                  </div>
                </div>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Deploy AI opposing counsel, expert witnesses, and judicial agents to stress-test your legal positions.
                  Uncover weaknesses and strategic vulnerabilities before they surface in actual litigation.
                </p>

                <div className="space-y-3">
                  {[
                    "Multi-agent adversarial battle simulation",
                    "Judicial review by Hon. Andrew H. Stone AI",
                    "Real-time weakness identification",
                    "Strategic recommendation engine"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bates-Strict Evidence Validation */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-purple-200 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Bates-Strict Evidence Validation</h3>
                    <Badge variant="secondary" className="mt-1">Precision Technology</Badge>
                  </div>
                </div>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Enterprise-grade document intelligence with strict Bates numbering compliance.
                  Every citation traced to source with confidence scoring and evidence chain validation.
                </p>

                <div className="space-y-3">
                  {[
                    "Automated Bates number verification",
                    "Source citation with confidence scoring",
                    "Evidence chain validation",
                    "OCR confidence thresholding at 85%"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built for Enterprise Legal Teams
            </h2>
            <p className="text-xl text-slate-600">
              Security, compliance, and performance at BigLaw scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Role-Based Access",
                description: "Granular permissions for attorneys, paralegals, and admin staff with organization isolation."
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "AI Legal Agents",
                description: "Specialized AI agents for opposing counsel, judges, witnesses, and expert testimony."
              },
              {
                icon: <Search className="h-8 w-8" />,
                title: "Case Intelligence",
                description: "Deep document analysis with bracketed term matching and statutory cross-referencing."
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Real-Time Analysis",
                description: "Instant case strength assessment with litigation fortress reporting."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl w-fit mb-4">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join elite law firms using adversarial simulation to win more cases.
            Start your enterprise trial and experience the future of legal preparation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Start Enterprise Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="text-blue-100">
              <div className="text-sm">✓ 30-day free trial</div>
              <div className="text-sm">✓ Full access to adversarial simulations</div>
            </div>
          </div>
        </div>
      </section>

      {/* UPL Disclaimer */}
      <div className="bg-slate-100 border-t border-slate-200 py-3">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          CaseBreak AI provides informational analysis only. This is not legal advice. <Link href="/acceptable-use#upl-disclaimer" className="text-blue-600 hover:underline">Read our legal disclaimer</Link>.
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CaseBreak.ai</span>
              </div>
              <p className="text-slate-400 text-sm">
                Enterprise legal simulation platform trusted by top law firms worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <div>Adversarial Simulation</div>
                <div>Evidence Validation</div>
                <div>Case Intelligence</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Security</h4>
              <div className="space-y-2 text-sm">
                <div>SOC 2-Aligned Practices</div>
                <div>End-to-End Encryption</div>
                <div>Role-Based Access</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block hover:text-white">About</Link>
                <Link href="/features" className="block hover:text-white">Features</Link>
                <Link href="/pricing" className="block hover:text-white">Pricing</Link>
                <Link href="/contact" className="block hover:text-white">Contact</Link>
                <Link href="/faq" className="block hover:text-white">FAQ</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/terms" className="block hover:text-white">Terms of Service</Link>
                <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
                <Link href="/acceptable-use" className="block hover:text-white">Acceptable Use</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 AI Venture Holdings LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}