'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden px-6 md:px-12 lg:px-20">
      {/* Zen decorative elements - ensō circles */}
      <motion.div
        className="absolute top-32 right-8 md:right-20 opacity-[0.04]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-8 md:left-16 opacity-[0.03]"
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="1" />
          <circle cx="80" cy="80" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
        </svg>
      </motion.div>

      {/* Breathing dot - zen accent */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-[var(--rust)]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Stamp badge */}
        <motion.div
          initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
          animate={{ opacity: 1, rotate: -3, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="stamp text-[var(--rust)] border-[var(--rust)]">
            Est. 2024 — The Resistance
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h1 className="mb-6 leading-[0.95]">
            Technology{' '}
            <span className="relative inline-block">
              <span className="strike-through">was supposed to</span>
            </span>
            <br />
            <span className="highlight">enhances life</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl max-w-2xl mb-4 font-[var(--font-libre)] leading-relaxed"
        >
          But they turned it into an <span className="typewriter">addictive machine</span> optimized
          to keep you hooked. They invested billions to make sure you&apos;re never free.
        </motion.p>

        {/* Manifesto excerpt */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="pull-quote max-w-xl mb-12"
        >
          This is our attempt to fight back.
        </motion.div>

        {/* CTA buttons - zen styled */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/signup" className="btn-zen group">
            Join the Movement
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <a href="#manifesto" className="btn-zen-outline">
            Read the Manifesto
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-20 pt-8 border-t-2 border-[var(--ink)] border-dashed"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '4.5hrs', label: 'avg daily screen time' },
              { value: '$200B+', label: 'spent on attention capture' },
              { value: '65%', label: 'feel addicted to devices' },
              { value: '1', label: 'movement to fight back' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="text-center md:text-left"
              >
                <div className="text-2xl md:text-3xl font-bold font-[var(--font-clash)] text-[var(--ink)]">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-widest text-[var(--ink-faded)] mt-1 font-[var(--font-jetbrains)]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator - zen style */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <a
          href="#manifesto"
          className="flex flex-col items-center gap-3 text-[var(--ink-faded)] hover:text-[var(--ink)] transition-colors group"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-[var(--font-jetbrains)]">Discover</span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="w-1 h-2 rounded-full bg-current"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </a>
      </motion.div>

      {/* Subtle corner accents */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-[var(--ink)]/10" />
      <div className="absolute top-0 left-0 w-20 h-20 border-l border-t border-[var(--ink)]/10" />
    </section>
  );
}
