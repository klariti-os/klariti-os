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
    <section id="philosophy" className="relative overflow-hidden scroll-section bg-[#1a1714]">
      {/* Curved top edge */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-[var(--paper)] z-10">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1a1714] rounded-t-[50%_100%]" />
      </div>

      <div className="pt-40 pb-32 md:pt-48 md:pb-40 px-6 md:px-12">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-0">
            {values.map((value, i) => (
              <motion.div
                key={value.word}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="px-6 lg:px-8 py-10 text-center relative group"
              >
                {/* Japanese character */}
                <motion.div
                  className="text-4xl md:text-5xl mb-5 font-light text-[#c9a96e]/30 group-hover:text-[#c9a96e]/50 transition-colors duration-500 select-none"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {value.japanese}
                </motion.div>

                {/* English word */}
                <h3 className="text-lg lg:text-xl font-[var(--font-clash)] font-bold tracking-[0.15em] mb-4 text-[#f0ece4]">
                  {value.word}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#a09888] leading-relaxed max-w-[200px] mx-auto">
                  {value.description}
                </p>

                {/* Bottom accent line - visible on first card, revealed on hover for others */}
                <div
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-[var(--rust)] transition-all duration-500 ${
                    i === 0 ? 'w-12' : 'w-0 group-hover:w-12'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[var(--paper)] z-10">
        <div className="absolute top-0 left-0 right-0 h-20 bg-[#1a1714] rounded-b-[50%_100%]" />
      </div>
    </section>
  );
}
