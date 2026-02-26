'use client';

import { motion } from 'framer-motion';

interface ZenLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function ZenLoader({ size = 'md', text }: ZenLoaderProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', circle: 60, stroke: 2 },
    md: { container: 'w-16 h-16', circle: 120, stroke: 2 },
    lg: { container: 'w-24 h-24', circle: 180, stroke: 3 },
  };

  const config = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Ensō circle loader */}
      <div className={`relative ${config.container}`}>
        {/* Outer breathing circle */}
        <motion.div
          className="absolute inset-0 rounded-full border border-[var(--ink)]/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main ensō */}
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${config.circle} ${config.circle}`}
          fill="none"
        >
          <motion.circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={config.circle / 2 - 10}
            stroke="var(--ink)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            fill="none"
            opacity={0.15}
            strokeDasharray={`${config.circle * 2.5} ${config.circle * 0.8}`}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ transformOrigin: 'center' }}
          />
        </svg>

        {/* Center breathing dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--rust)]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Optional loading text */}
      {text && (
        <motion.p
          className="text-sm text-[var(--ink-faded)] font-[family-name:var(--font-libre)] italic"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Full page loader variant
export function ZenPageLoader() {
  return (
    <div className="fixed inset-0 bg-[var(--paper)] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <ZenLoader size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-[var(--ink-light)] font-[family-name:var(--font-libre)]"
        >
          Finding your center...
        </motion.p>
      </motion.div>
    </div>
  );
}

// Inline skeleton loader for content
export function ZenSkeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-[var(--paper-dark)]/50 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
