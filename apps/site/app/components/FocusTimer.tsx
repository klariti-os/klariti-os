'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface FocusTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export default function FocusTimer({ defaultMinutes = 25, onComplete }: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, onComplete]);

  const toggleTimer = useCallback(() => {
    if (isComplete) {
      // Reset if complete
      setRemainingSeconds(totalSeconds);
      setIsComplete(false);
    } else {
      setIsRunning((prev) => !prev);
    }
  }, [isComplete, totalSeconds]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setIsComplete(false);
  }, [totalSeconds]);

  const presets = [
    { label: '5m', minutes: 5 },
    { label: '15m', minutes: 15 },
    { label: '25m', minutes: 25 },
    { label: '45m', minutes: 45 },
  ];

  const setPreset = (mins: number) => {
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    setIsRunning(false);
    setIsComplete(false);
  };

  return (
    <div className="bg-[var(--paper)] border border-[var(--ink)]/5 rounded-2xl p-6">
      <div className="text-center">
        {/* Timer display */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--paper-dark)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isComplete ? 'var(--forest)' : 'var(--rust)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              initial={false}
              animate={{
                strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-[var(--forest)]"
                >
                  <Check className="w-12 h-12" />
                </motion.div>
              ) : (
                <motion.div
                  key="time"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <span className="text-4xl font-bold font-[family-name:var(--font-clash)] text-[var(--ink)]">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-[var(--ink-faded)] mt-1">
                    {isRunning ? 'focusing...' : 'ready'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Breathing indicator when running */}
          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--rust)]/20"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>

        {/* Preset buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {presets.map((preset) => (
            <button
              key={preset.minutes}
              onClick={() => setPreset(preset.minutes)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                totalSeconds === preset.minutes * 60
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : 'bg-[var(--paper-dark)]/50 text-[var(--ink-light)] hover:bg-[var(--paper-dark)]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isComplete
                ? 'bg-[var(--forest)] text-[var(--paper)]'
                : isRunning
                ? 'bg-[var(--ink)]/10 text-[var(--ink)]'
                : 'bg-[var(--ink)] text-[var(--paper)]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isComplete ? (
              <RotateCcw className="w-5 h-5" />
            ) : isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>

          {(isRunning || remainingSeconds !== totalSeconds) && !isComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-[var(--paper-dark)]/50 text-[var(--ink-light)] flex items-center justify-center hover:bg-[var(--paper-dark)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Completion message */}
        <AnimatePresence>
          {isComplete && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 text-sm text-[var(--forest)] font-medium"
            >
              Focus session complete. Well done!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
