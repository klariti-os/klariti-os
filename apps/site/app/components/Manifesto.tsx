'use client';

import { motion } from 'framer-motion';

export default function Manifesto() {
  const cards = [
    {
      number: '01',
      title: 'The Promise',
      text: 'Technology was supposed to be a tool to enhance our lives. A tool to help us communicate with our loved ones, learn new things, and grow as individuals.',
      rotation: '-1deg',
      accent: 'var(--forest)',
    },
    {
      number: '02',
      title: 'The Betrayal',
      text: "But let's face it... Uncle Zuckerburger doesn't care about you! They turned what was supposed to enhance our lives into an addictive machine optimized to keep us hooked.",
      rotation: '1deg',
      accent: 'var(--rust)',
    },
    {
      number: '03',
      title: 'The Cost',
      text: 'They turned us into a product, a data point sold to the highest bidder. All at the expense of our mental health and precious time. They invested billions to ensure we are never free.',
      rotation: '-0.5deg',
      accent: 'var(--crimson)',
    },
  ];

  return (
    <section id="manifesto" className="py-24 md:py-32 px-6 md:px-12 relative scroll-section">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <span className="badge-zen mb-4 inline-block">The Reality Check</span>
          <h2 className="mt-4">
            What They <span className="highlight-zen">Don&apos;t</span>
            <br />
            Want You to Know
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card-zen p-8 relative group"
            >
              {/* Card number - zen styled */}
              <div
                className="absolute -top-3 -left-1 w-10 h-10 flex items-center justify-center font-[var(--font-clash)] text-sm font-bold rounded-xl"
                style={{
                  background: `${card.accent}15`,
                  color: card.accent,
                }}
              >
                {card.number}
              </div>

              {/* Card content */}
              <div className="pt-4">
                <h3 className="text-xl md:text-2xl mb-4 font-[var(--font-clash)]">
                  {card.title}
                </h3>
                <p className="text-[var(--ink-light)] leading-relaxed">
                  {card.text}
                </p>
              </div>

              {/* Subtle accent line on hover */}
              <div
                className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: card.accent }}
              />
            </motion.div>
          ))}
        </div>

        {/* The resistance - full width callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 md:mt-24 relative"
        >
          <div className="rounded-2xl p-8 md:p-12 bg-gradient-to-br from-[var(--ink)] to-[var(--ink-light)] text-[var(--paper)] relative overflow-hidden">
            {/* Subtle background circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--paper)]/5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[var(--paper)]/3 translate-y-1/2 -translate-x-1/2" />

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 relative z-10">
              <div className="flex-shrink-0">
                <span className="text-6xl md:text-8xl font-bold font-[var(--font-clash)] text-[var(--paper)]/20">
                  04
                </span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl mb-4 font-[var(--font-clash)] text-[var(--paper)]">
                  The Resistance
                </h3>
                <p className="text-lg md:text-xl text-[var(--paper)]/80 leading-relaxed max-w-2xl">
                  Just quitting digital tools is almost impossible since they&apos;ve become essential.
                  So this is our attempt to <span className="font-semibold text-[var(--ochre)]">fight back</span>—not
                  by rejecting technology, but by <span className="font-semibold text-[var(--paper)]">reclaiming it</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
