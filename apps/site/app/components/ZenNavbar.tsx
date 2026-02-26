'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

export default function ZenNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Show navbar when scrolling up or at top
    if (latest < previous || latest < 50) {
      setIsVisible(true);
    } else if (latest > 100 && latest > previous) {
      setIsVisible(false);
    }

    setHasScrolled(latest > 20);
  });

  const links = [
    { name: 'Manifesto', href: '#manifesto' },
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Mission', href: '#mission' },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 md:pt-6"
      >
        <div
          className={`
            max-w-4xl mx-auto transition-all duration-700 ease-out
            ${hasScrolled
              ? 'bg-[var(--paper)]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,23,20,0.08)] border border-[var(--ink)]/5'
              : 'bg-transparent'
            }
            rounded-2xl
          `}
        >
          <div className="px-4 md:px-8">
            <div className="flex justify-between items-center h-16 md:h-18">
              {/* Logo - organic, breathing animation */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <motion.div
                  className="relative"
                  animate={{
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Zen circle - ensō inspired */}
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="transition-all duration-500 group-hover:scale-105"
                  >
                    {/* Outer ensō circle - intentionally imperfect */}
                    <path
                      d="M16 2.5C8.5 2.5 2.5 8.5 2.5 16c0 7.5 6 13.5 13.5 13.5 7.5 0 13.5-6 13.5-13.5C29.5 8.5 23.5 2.5 16 2.5z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.2"
                      className="transition-opacity group-hover:opacity-40"
                    />
                    {/* Inner K - simplified, elegant */}
                    <path
                      d="M11 9v14M11 16l8-7M14 16l7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all"
                    />
                  </svg>
                </motion.div>
                <span className="text-lg font-semibold tracking-tight font-[family-name:var(--font-clash)] text-[var(--ink)]">
                  klariti
                </span>
              </Link>

              {/* Desktop navigation - floating pills */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-1 bg-[var(--paper-dark)]/50 rounded-full px-1.5 py-1.5">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative px-4 py-2 text-sm font-medium text-[var(--ink-light)] hover:text-[var(--ink)] transition-all duration-300 font-[family-name:var(--font-clash)] rounded-full hover:bg-[var(--paper)] group"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors font-[family-name:var(--font-clash)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="relative px-5 py-2.5 text-sm font-semibold text-[var(--paper)] bg-[var(--ink)] rounded-full overflow-hidden group transition-all hover:shadow-lg hover:shadow-[var(--ink)]/20 font-[family-name:var(--font-clash)]"
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    className="absolute inset-0 bg-[var(--rust)]"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </Link>
              </div>

              {/* Mobile menu toggle - zen circle button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--paper-dark)]/50 hover:bg-[var(--paper-dark)] transition-colors"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 text-[var(--ink)]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 text-[var(--ink)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu - zen overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[var(--ink)]/10 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="fixed top-24 left-4 right-4 z-50 bg-[var(--paper)] rounded-2xl shadow-[0_24px_80px_rgba(26,23,20,0.15)] border border-[var(--ink)]/5 overflow-hidden"
            >
              <div className="p-6 space-y-2">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-lg font-medium font-[family-name:var(--font-clash)] text-[var(--ink-light)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)]/50 rounded-xl transition-all"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-4 mt-4 border-t border-[var(--ink)]/10 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-center text-[var(--ink)] font-medium font-[family-name:var(--font-clash)] rounded-xl border border-[var(--ink)]/20 hover:bg-[var(--paper-dark)]/50 transition-all"
                    >
                      Sign in
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-center text-[var(--paper)] bg-[var(--ink)] font-semibold font-[family-name:var(--font-clash)] rounded-xl hover:bg-[var(--rust)] transition-colors"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
