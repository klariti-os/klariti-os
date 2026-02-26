'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Zap, Chrome } from 'lucide-react';

export default function Superfilter() {
  const blockedExamples = [
    {
      platform: 'YouTube',
      blocked: ['Shorts tab', 'Recommended sidebar', 'Autoplay'],
      kept: ['Subscriptions', 'Search', 'Watch history'],
      color: 'var(--rust)',
    },
    {
      platform: 'Instagram',
      blocked: ['Reels tab', 'Explore page', 'Suggested posts'],
      kept: ['Your feed', 'Stories', 'DMs'],
      color: 'var(--forest)',
    },
    {
      platform: 'X / Twitter',
      blocked: ['For You tab', 'Trending', 'Who to follow'],
      kept: ['Following feed', 'Search', 'Notifications'],
      color: 'var(--ink)',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Surgical Precision',
      description: 'Block only the addictive parts. Keep the useful ones.',
    },
    {
      icon: Eye,
      title: 'Your Rules',
      description: 'Customize what you see on every platform.',
    },
    {
      icon: Zap,
      title: 'Instant Effect',
      description: 'One click to reclaim your attention.',
    },
  ];

  return (
    <section id="tools" className="py-24 md:py-32 px-6 md:px-12 bg-[var(--paper)] relative overflow-hidden">
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg width="100%" height="100%">
          <pattern id="superfilter-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#superfilter-dots)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="badge-zen">Flagship Tool</span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--paper-dark)]/50 border border-[var(--ink)]/10 rounded-full text-xs font-[var(--font-jetbrains)] tracking-wider">
              <Chrome className="w-3.5 h-3.5" />
              Chrome Extension
            </span>
          </div>

          <h2 className="mb-6">
            The Klariti
            <br />
            <span className="relative inline-block">
              <span className="text-[var(--rust)]">Superfilter</span>
              {/* Emphasis marks */}
              <svg className="absolute -right-8 -top-4 w-6 h-6 text-[var(--ochre)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" />
              </svg>
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-[var(--ink-light)] max-w-2xl leading-relaxed font-[var(--font-libre)]">
            A surgical tool that removes only the <span className="typewriter">distracting parts</span> of
            websites—so you can use the internet for what <em>you</em> actually want.
          </p>
        </motion.div>

        {/* Main product showcase */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Left: Visual demo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="card-zen p-6 md:p-8">
              {/* Browser mockup header */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--ink)]/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--rust)]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--ochre)]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--forest)]/60" />
                </div>
                <div className="flex-1 mx-4 px-3 py-1.5 bg-[var(--paper-dark)]/50 rounded-lg text-xs font-[var(--font-jetbrains)] text-[var(--ink-faded)]">
                  youtube.com
                </div>
                <div className="w-8 h-8 rounded-lg bg-[var(--rust)]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[var(--rust)]" />
                </div>
              </div>

              {/* YouTube mockup */}
              <div className="space-y-4">
                {/* Navigation */}
                <div className="flex gap-4 text-sm font-[var(--font-clash)] uppercase tracking-wider">
                  <span className="text-[var(--ink)]">Home</span>
                  <span className="relative text-[var(--ink-faded)]">
                    <span className="line-through">Shorts</span>
                    <motion.span
                      className="absolute -top-1 -right-4 text-[var(--rust)] text-xs"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                    >
                      blocked
                    </motion.span>
                  </span>
                  <span className="text-[var(--ink)]">Subscriptions</span>
                </div>

                {/* Content area */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Video thumbnails */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="aspect-video bg-[var(--paper-dark)]/50 rounded-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--ink)]/10 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[8px] border-l-[var(--ink)]/60 border-y-[5px] border-y-transparent ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Blocked sidebar indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-3 p-3 bg-[var(--rust)]/10 rounded-lg"
                >
                  <EyeOff className="w-4 h-4 text-[var(--rust)]" />
                  <span className="text-xs font-[var(--font-jetbrains)] text-[var(--rust)]">
                    Recommended sidebar: BLOCKED
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-3 -right-3 md:-right-6"
            >
              <div className="badge-zen text-[var(--forest)] bg-[var(--paper)] shadow-lg px-4 py-2">
                No more doom scrolling
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Platform examples */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {blockedExamples.map((example, i) => (
              <motion.div
                key={example.platform}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="p-6 bg-[var(--paper)] border border-[var(--ink)]/10 rounded-2xl relative group hover:-translate-y-1 transition-all hover:shadow-lg"
              >
                <h4 className="font-[var(--font-clash)] font-bold text-lg mb-4 flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: example.color }}
                  />
                  {example.platform}
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Blocked */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[var(--rust)]">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="font-[var(--font-jetbrains)] uppercase tracking-wider text-xs">
                        Blocked
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {example.blocked.map((item) => (
                        <li key={item} className="text-[var(--ink-faded)] line-through">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kept */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[var(--forest)]">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="font-[var(--font-jetbrains)] uppercase tracking-wider text-xs">
                        Kept
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {example.kept.map((item) => (
                        <li key={item} className="text-[var(--ink-light)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-4 p-6 bg-[var(--paper-dark)]/30 rounded-2xl hover:bg-[var(--paper-dark)]/50 transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-[var(--paper)] rounded-xl border border-[var(--ink)]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-[var(--font-clash)] font-semibold mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-[var(--ink-faded)]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <button className="btn-zen group">
              <Chrome className="w-4 h-4" />
              Add to Chrome — Free
              <span className="text-[var(--paper)]/60 text-xs ml-1">(Coming Soon)</span>
            </button>
            <span className="text-sm text-[var(--ink-faded)] font-[var(--font-jetbrains)]">
              Join 2,400+ on the waitlist
            </span>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-[var(--ink-faded)] font-[var(--font-jetbrains)] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--forest)] rounded-full" />
              No data collection
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--forest)] rounded-full" />
              Open source
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--forest)] rounded-full" />
              Works offline
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
