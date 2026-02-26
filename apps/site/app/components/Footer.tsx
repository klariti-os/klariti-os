'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { name: 'Manifesto', href: '#manifesto' },
      { name: 'Mission', href: '#mission' },
      { name: 'Tools', href: '#tools' },
    ],
    social: [
      { name: 'Twitter', href: 'https://twitter.com/klaritiso' },
      { name: 'Instagram', href: 'https://instagram.com/klaritiso' },
      { name: 'Email', href: 'mailto:hello@klariti.so' },
    ],
  };

  return (
    <footer className="border-t border-[var(--ink)]/10 bg-[var(--paper)]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <svg
                width="32"
                height="32"
                viewBox="0 0 36 36"
                fill="none"
                className="transition-transform group-hover:rotate-6"
              >
                <path
                  d="M18 3C10 3 4 9 3 17c-1 8 5 15 13 16 8 1 15-4 16-12 1-8-5-16-14-18z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M12 10v16M12 18l10-8M16 18l8 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-lg font-bold tracking-tight font-[var(--font-clash)]">
                klariti
              </span>
            </Link>

            <p className="text-[var(--ink-light)] leading-relaxed mb-6 max-w-sm">
              Handcrafted tools for a healthier relationship with technology.
              Fighting back against the attention economy, one user at a time.
            </p>

            {/* Newsletter signup - zen styled */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-[var(--paper-dark)]/50 border border-[var(--ink)]/10 rounded-xl font-[var(--font-jetbrains)] text-sm placeholder:text-[var(--ink-faded)] focus:outline-none focus:border-[var(--ink)]/30 focus:bg-white transition-all duration-300"
              />
              <button className="px-6 py-3 bg-[var(--ink)] text-[var(--paper)] font-[var(--font-clash)] font-semibold text-sm rounded-xl hover:bg-[var(--ink-light)] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </motion.div>

          {/* Links columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3 md:col-start-7"
          >
            <h4 className="font-[var(--font-clash)] font-semibold text-sm uppercase tracking-wider mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[var(--rust)] group-hover:w-4 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3"
          >
            <h4 className="font-[var(--font-clash)] font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {links.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[var(--rust)] group-hover:w-4 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider - zen style */}
        <div className="divider-zen my-12" />

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <p className="text-sm text-[var(--ink-faded)] font-[var(--font-jetbrains)]">
            &copy; {currentYear} Klariti. Handcrafted with intention.
          </p>

          <div className="flex items-center gap-6 text-sm text-[var(--ink-faded)]">
            <a href="#" className="hover:text-[var(--ink)] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--ink)] transition-colors">
              Terms
            </a>
            <span className="badge-zen text-[var(--forest)]">
              Made with care
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
