'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Manifesto', href: '#manifesto' },
    { name: 'Mission', href: '#mission' },
    { name: 'Tools', href: '#tools' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[var(--paper)]/95 backdrop-blur-sm border-b-2 border-[var(--ink)]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Hand-drawn style logo mark */}
            <div className="relative">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                className="transition-transform group-hover:rotate-6"
              >
                {/* Outer rough circle */}
                <path
                  d="M18 3C10 3 4 9 3 17c-1 8 5 15 13 16 8 1 15-4 16-12 1-8-5-16-14-18z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Inner K letterform */}
                <path
                  d="M12 10v16M12 18l10-8M16 18l8 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight font-[var(--font-clash)]">
              klariti
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors font-[var(--font-clash)] uppercase tracking-wider group"
              >
                {link.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[var(--rust)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button className="btn-primary text-sm px-5 py-2.5">
              Join Us
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 border-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[var(--paper)] border-b-2 border-[var(--ink)] overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-lg font-medium font-[var(--font-clash)] uppercase tracking-wider border-l-4 border-transparent hover:border-[var(--rust)] hover:bg-[var(--paper-dark)] transition-all"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <button className="btn-primary w-full justify-center text-sm">
                  Join the Movement
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
