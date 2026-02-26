"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="zen-grid"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zen-grid)" />
        </svg>
      </div>

      {/* Floating ensō circles */}
      <motion.div
        className="absolute top-1/4 right-1/4 opacity-[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <svg width="300" height="300" viewBox="0 0 200 200" fill="none">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 opacity-[0.02]"
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 number with zen styling */}
          <div className="relative mb-8">
            <span className="text-[12rem] md:text-[16rem] font-bold font-[family-name:var(--font-clash)] text-[var(--ink)]/5 leading-none select-none">
              404
            </span>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 1, -1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Ensō circle */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                className="text-[var(--ink)]"
              >
                <path
                  d="M60 10C32 10 10 32 10 60s22 50 50 50 50-22 50-50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.15"
                />
              </svg>
            </motion.div>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-clash)] text-[var(--ink)] mb-4">
            Page not found
          </h1>

          <p className="text-[var(--ink-light)] text-lg mb-8 leading-relaxed">
            Like the space between thoughts, this page exists in emptiness.
            Let&apos;s guide you back to clarity.
          </p>

          {/* Breathing indicator */}
          <motion.div
            className="flex justify-center mb-8"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-3 h-3 rounded-full bg-[var(--rust)]/30" />
          </motion.div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-zen group">
              <Home className="w-4 h-4" />
              Return home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-zen-outline group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Go back
            </button>
          </div>
        </motion.div>

        {/* Zen quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-[var(--ink)]/10"
        >
          <p className="text-sm text-[var(--ink-faded)] font-[family-name:var(--font-libre)] italic">
            &ldquo;In the beginner&apos;s mind there are many possibilities, but
            in the expert&apos;s there are few.&rdquo;
          </p>
          <p className="text-xs text-[var(--ink-faded)] mt-2">
            — Shunryu Suzuki
          </p>
        </motion.div>
      </div>
    </div>
  );
}
