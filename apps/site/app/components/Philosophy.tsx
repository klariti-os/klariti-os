'use client';

import { motion } from 'framer-motion';

export default function Philosophy() {
  const values = [
    {
      word: 'FOCUS',
      japanese: '集中',
      description: 'Direct your attention with intention. Cut through the noise.',
    },
    {
      word: 'BALANCE',
      japanese: '調和',
      description: 'Technology in harmony with life, not consuming it.',
    },
    {
      word: 'CLARITY',
      japanese: '明晰',
      description: 'See through the algorithmic fog. Know what matters.',
    },
    {
      word: 'MINDFUL',
      japanese: '気づき',
      description: 'Present in each interaction. Conscious of every click.',
    },
    {
      word: 'ZEN',
      japanese: '禅',
      description: 'Inner peace in a world designed to disturb it.',
    },
  ];

  return (
    <section id="philosophy" className="py-32 md:py-40 px-6 md:px-12 relative overflow-hidden scroll-section bg-[var(--paper-dark)]/30">
      {/* Enso circle - zen brush stroke */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <svg width="800" height="800" viewBox="0 0 200 200" fill="none">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="400 100"
            transform="rotate(-45 100 100)"
          />
        </svg>
      </div>

      {/* Breathing dot animation */}
      <motion.div
        className="absolute top-20 right-20 w-3 h-3 rounded-full bg-[var(--rust)]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-2 h-2 rounded-full bg-[var(--forest)]"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-28"
        >
          <span className="badge-zen mb-6">
            Our Philosophy
          </span>
          <h2 className="max-w-3xl mx-auto">
            Five Principles for
            <br />
            <span className="relative inline-block">
              Digital Wellbeing
              <motion.svg
                className="absolute -bottom-3 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.path
                  d="M0 6 Q75 0, 150 6 T300 6"
                  stroke="var(--ochre)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.svg>
            </span>
          </h2>
        </motion.div>

        {/* Values grid - zen cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {values.map((value, i) => (
            <motion.div
              key={value.word}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-zen p-6 lg:p-8 text-center relative group"
            >
              {/* Japanese character */}
              <motion.div
                className="text-4xl md:text-3xl lg:text-4xl mb-4 font-light text-[var(--ink)]/10 group-hover:text-[var(--rust)]/30 transition-colors duration-500"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {value.japanese}
              </motion.div>

              {/* English word */}
              <h3 className="text-lg lg:text-xl font-[var(--font-clash)] font-bold tracking-wider mb-3 text-[var(--ink)] group-hover:text-[var(--rust)] transition-colors duration-300">
                {value.word}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--ink-light)] leading-relaxed">
                {value.description}
              </p>

              {/* Subtle bottom accent on hover */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-[var(--rust)] group-hover:w-16 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Breathing exercise prompt - zen styled */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 px-8 py-5 bg-[var(--paper)] rounded-2xl shadow-sm border border-[var(--ink)]/5">
            <motion.div
              className="w-3 h-3 rounded-full bg-[var(--rust)]/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="text-sm font-[var(--font-libre)] text-[var(--ink-light)] italic">
              Take a breath. You&apos;re in control.
            </span>
            <motion.div
              className="w-3 h-3 rounded-full bg-[var(--forest)]/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
