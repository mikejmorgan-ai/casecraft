'use client'

import { motion, type Variants } from 'framer-motion'
import { Upload, Brain, PlayCircle, Lightbulb, Gavel } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    number: 1,
    title: 'Upload Your Case',
    description: 'Upload pleadings, discovery, and case documents. Our system indexes everything for AI analysis.',
  },
  {
    icon: Brain,
    number: 2,
    title: 'Judge AI Analyzes the Law',
    description: 'Our Judge AI reviews applicable statutes, case law, and your documents to understand the legal landscape.',
  },
  {
    icon: PlayCircle,
    number: 3,
    title: 'Run Legal Simulations',
    description: 'Execute mock hearings, depositions, and strategy sessions with AI agents playing realistic legal roles.',
  },
  {
    icon: Lightbulb,
    number: 4,
    title: 'Get Strategic Insights',
    description: 'Receive actionable recommendations, identify weaknesses, and refine your case strategy.',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const stepVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOut equivalent
    },
  },
}

const judgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOut equivalent
      delay: 0.5,
    },
  },
}

const glowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 30px rgba(65, 105, 225, 0.4), 0 0 60px rgba(65, 105, 225, 0.2)',
      '0 0 40px rgba(65, 105, 225, 0.6), 0 0 80px rgba(65, 105, 225, 0.3)',
      '0 0 30px rgba(65, 105, 225, 0.4), 0 0 60px rgba(65, 105, 225, 0.2)',
    ],
    transition: {
      duration: 3,
      ease: [0.45, 0.05, 0.55, 0.95], // easeInOut equivalent
      repeat: Infinity,
    },
  },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-[var(--color-legal-cream)] to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            How CaseCraft Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A powerful four-step process that transforms how you prepare for legal proceedings
          </p>
        </motion.div>

        {/* Judge AI Central Figure */}
        <motion.div
          variants={judgeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex justify-center mb-16"
        >
          <motion.div
            variants={glowVariants}
            animate="animate"
            className="relative p-8 rounded-full bg-primary"
          >
            <Gavel className="h-16 w-16 text-primary-foreground" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--color-royal-blue)]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                ease: [0.45, 0.05, 0.55, 0.95], // easeInOut equivalent
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-lg font-semibold text-[var(--color-royal-blue)] mb-12"
        >
          The Judge AI: Your Central Source of Legal Authority
        </motion.p>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="how-it-works-step relative bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              {/* Step Number */}
              <motion.div
                className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--color-royal-blue)] text-white flex items-center justify-center font-bold text-lg shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {step.number}
              </motion.div>

              {/* Icon */}
              <motion.div
                className="mb-4 mt-2 icon-neon"
                whileHover={{
                  filter: 'drop-shadow(0 0 16px rgba(65, 105, 225, 0.9))',
                  scale: 1.1,
                }}
                transition={{ duration: 0.2 }}
              >
                <step.icon className="h-10 w-10" />
              </motion.div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connecting line for desktop */}
              {step.number < 4 && (
                <motion.div
                  className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + step.number * 0.2, duration: 0.4 }}
                  style={{
                    background: 'linear-gradient(90deg, var(--color-royal-blue), transparent)',
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to experience the power of AI-driven legal simulation?
          </p>
          <motion.span
            className="text-[var(--color-royal-blue)] font-semibold cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start your first simulation today
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}
