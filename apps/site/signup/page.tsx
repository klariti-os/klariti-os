'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const benefits = [
    'Track your screen time patterns',
    'Focus sessions with gentle reminders',
    'Weekly wellness insights',
    'Community of mindful tech users',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual (reversed from login) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--forest)] to-[var(--ink)] relative overflow-hidden items-center justify-center">
        {/* Animated background circles */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[var(--paper)]/5"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 10 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
            />
          ))}
        </div>

        {/* Central content */}
        <div className="relative z-10 px-12 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Sparkles className="w-12 h-12 text-[var(--paper)]/30 mb-8" />

            <h2 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-clash)] text-[var(--paper)] mb-6 leading-tight">
              Begin your journey to digital balance
            </h2>

            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-[var(--paper)]/80"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--paper)]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[var(--paper)]" />
                  </div>
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[var(--paper)]/10 rounded-full"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="zen-dots-signup" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#zen-dots-signup)" />
          </svg>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--ink-faded)] hover:text-[var(--ink)] transition-colors font-[family-name:var(--font-clash)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md relative z-10"
        >
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M18 3C10 3 4 9 3 17c-1 8 5 15 13 16 8 1 15-4 16-12 1-8-5-16-14-18z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.2"
                  />
                  <path
                    d="M12 10v16M12 18l10-8M16 18l8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <span className="text-xl font-semibold tracking-tight font-[family-name:var(--font-clash)]">
                klariti
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold font-[family-name:var(--font-clash)] text-[var(--ink)] mb-3 leading-tight">
              Create your account
            </h1>
            <p className="text-[var(--ink-light)] text-lg">
              Start your path to a healthier digital life.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--ink)] font-[family-name:var(--font-clash)]"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                required
                className="w-full px-4 py-3.5 bg-[var(--paper)] border-2 border-[var(--ink)]/10 rounded-xl text-[var(--ink)] placeholder:text-[var(--ink-faded)] focus:outline-none focus:border-[var(--ink)]/30 focus:bg-white transition-all duration-300 font-[family-name:var(--font-libre)]"
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--ink)] font-[family-name:var(--font-clash)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 bg-[var(--paper)] border-2 border-[var(--ink)]/10 rounded-xl text-[var(--ink)] placeholder:text-[var(--ink-faded)] focus:outline-none focus:border-[var(--ink)]/30 focus:bg-white transition-all duration-300 font-[family-name:var(--font-libre)]"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--ink)] font-[family-name:var(--font-clash)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3.5 pr-12 bg-[var(--paper)] border-2 border-[var(--ink)]/10 rounded-xl text-[var(--ink)] placeholder:text-[var(--ink-faded)] focus:outline-none focus:border-[var(--ink)]/30 focus:bg-white transition-all duration-300 font-[family-name:var(--font-libre)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-faded)] hover:text-[var(--ink)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[var(--ink-faded)] mt-1">
                At least 8 characters
              </p>
            </div>

            {/* Terms */}
            <p className="text-sm text-[var(--ink-faded)]">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-[var(--ink)] hover:text-[var(--rust)] transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[var(--ink)] hover:text-[var(--rust)] transition-colors">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-[var(--ink)] text-[var(--paper)] rounded-xl font-semibold font-[family-name:var(--font-clash)] text-base flex items-center justify-center gap-3 hover:bg-[var(--ink-light)] transition-colors disabled:opacity-70 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-[var(--paper)]/30 border-t-[var(--paper)] rounded-full"
                />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--ink)]/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[var(--paper)] text-sm text-[var(--ink-faded)]">
                or continue with
              </span>
            </div>
          </div>

          {/* Social signup */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              type="button"
              className="flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-[var(--ink)]/10 rounded-xl hover:border-[var(--ink)]/20 hover:bg-[var(--paper-dark)]/30 transition-all font-[family-name:var(--font-clash)] text-sm font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </motion.button>

            <motion.button
              type="button"
              className="flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-[var(--ink)]/10 rounded-xl hover:border-[var(--ink)]/20 hover:bg-[var(--paper-dark)]/30 transition-all font-[family-name:var(--font-clash)] text-sm font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </motion.button>
          </div>

          {/* Sign in link */}
          <p className="text-center mt-8 text-[var(--ink-light)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--ink)] font-medium hover:text-[var(--rust)] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
