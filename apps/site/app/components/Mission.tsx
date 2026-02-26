'use client';

import { motion } from 'framer-motion';
import { Clock, Brain, Zap } from 'lucide-react';

export default function Mission() {
  const pillars = [
    {
      icon: Clock,
      title: 'Reclaim Time',
      description: 'Tools designed to minimize distraction and maximize intentionality. Your hours belong to you.',
      number: 'I',
    },
    {
      icon: Brain,
      title: 'Mental Clarity',
      description: 'Interfaces that calm the mind rather than overstimulate it. Peace over engagement metrics.',
      number: 'II',
    },
    {
      icon: Zap,
      title: 'Empowerment',
      description: 'You control the technology, not the other way around. Take back your agency.',
      number: 'III',
    },
  ];

  return (
    <section id="mission" className="py-24 md:py-32 px-6 md:px-12 bg-[var(--ink)] text-[var(--paper)] relative overflow-hidden scroll-section">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ink)] via-[var(--ink)] to-[var(--ink-light)]/20" />

      {/* Floating circles - zen aesthetic */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[var(--paper)]/[0.02] blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-[var(--paper)]/[0.02] blur-2xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <span className="inline-block px-4 py-2 bg-[var(--paper)]/10 rounded-full text-xs font-[var(--font-jetbrains)] uppercase tracking-widest mb-4">
            Our Mission
          </span>
          <h2 className="text-[var(--paper)]">
            Building Tools for
            <br />
            <span className="relative inline-block">
              Digital
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 4 Q50 0, 100 4 T200 4"
                  stroke="var(--rust)"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>{' '}
            Liberation
          </h2>
        </motion.div>

        {/* Mission statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20 md:mb-28"
        >
          <blockquote className="text-2xl md:text-4xl font-[var(--font-libre)] italic leading-relaxed max-w-4xl">
            &ldquo;We are building a suite of tools that empower our generation to{' '}
            <span className="not-italic font-bold text-[var(--ochre)]">enjoy technology&apos;s benefits</span>{' '}
            while fostering a{' '}
            <span className="not-italic font-bold text-[var(--rust)]">healthy relationship</span>{' '}
            with it.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-12 h-0.5 bg-[var(--paper)]" />
            <span className="text-sm font-[var(--font-jetbrains)] uppercase tracking-wider opacity-60">
              The Klariti Manifesto
            </span>
          </div>
        </motion.div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="relative"
              >
                {/* Roman numeral - subtle */}
                <div className="absolute -top-4 -left-1 text-5xl md:text-6xl font-[var(--font-clash)] font-bold text-[var(--paper)]/5">
                  {pillar.number}
                </div>

                {/* Icon - rounded zen style */}
                <div className="w-14 h-14 rounded-2xl bg-[var(--paper)]/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-[var(--paper)]" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-[var(--font-clash)] mb-4 text-[var(--paper)]">
                  {pillar.title}
                </h3>
                <p className="text-[var(--paper)]/70 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 md:mt-28 text-center"
        >
          <p className="text-lg md:text-xl text-[var(--paper)]/80 mb-8 max-w-2xl mx-auto font-[var(--font-libre)]">
            Ready to break free from the algorithmic cage? Join thousands who are taking back control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#tools" className="inline-flex items-center justify-center gap-3 bg-[var(--paper)] text-[var(--ink)] px-8 py-4 rounded-full font-[var(--font-clash)] font-semibold text-sm hover:bg-[var(--ochre)] hover:text-[var(--ink)] transition-all hover:scale-[1.02] group">
              Explore Our Tools
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <button className="inline-flex items-center justify-center gap-3 border border-[var(--paper)]/30 text-[var(--paper)] px-8 py-4 rounded-full font-[var(--font-clash)] font-semibold text-sm hover:bg-[var(--paper)]/10 transition-colors">
              Get Updates
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-[var(--paper)]/10 rounded-tl-2xl" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-[var(--paper)]/10 rounded-br-2xl" />
    </section>
  );
}
