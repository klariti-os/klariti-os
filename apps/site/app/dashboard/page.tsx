'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const zenQuotes = [
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "The mind is everything. What you think, you become.", author: "Buddha" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Be where you are, not where you think you should be.", author: "Unknown" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Smile, breathe, and go slowly.", author: "Thich Nhat Hanh" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
];
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Bell,
  User,
  ChevronDown,
  Flame,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Moon,
  Sun,
  Leaf,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, active: true },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Focus Sessions', href: '/dashboard/focus', icon: Target },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const stats = [
  {
    label: 'Screen Time Today',
    value: '2h 34m',
    change: '-18%',
    trend: 'down',
    icon: Clock,
    color: 'var(--forest)',
  },
  {
    label: 'Focus Score',
    value: '87',
    change: '+12',
    trend: 'up',
    icon: Target,
    color: 'var(--rust)',
  },
  {
    label: 'Mindful Minutes',
    value: '45',
    change: '+8',
    trend: 'up',
    icon: Leaf,
    color: 'var(--ochre)',
  },
  {
    label: 'Current Streak',
    value: '7 days',
    change: 'Personal best!',
    trend: 'up',
    icon: Flame,
    color: 'var(--crimson)',
  },
];

const recentActivity = [
  { time: '2 hours ago', action: 'Completed 25-minute focus session', type: 'focus' },
  { time: '4 hours ago', action: 'Blocked Instagram for 2 hours', type: 'block' },
  { time: 'Yesterday', action: 'Achieved daily screen time goal', type: 'goal' },
  { time: 'Yesterday', action: 'Started morning mindfulness routine', type: 'mindful' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % zenQuotes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = zenQuotes[quoteIndex];
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[var(--paper)] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--paper)] border-r border-[var(--ink)]/5 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--ink)]/5">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2.5C8.5 2.5 2.5 8.5 2.5 16c0 7.5 6 13.5 13.5 13.5 7.5 0 13.5-6 13.5-13.5C29.5 8.5 23.5 2.5 16 2.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.2"
                />
                <path
                  d="M11 9v14M11 16l8-7M14 16l7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <span className="text-lg font-semibold tracking-tight font-[family-name:var(--font-clash)]">
              klariti
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-[family-name:var(--font-clash)] text-sm ${
                link.active
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : 'text-[var(--ink-light)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)]/50'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-[var(--ink)]/5">
          {/* Zen quote - rotating */}
          <div className="p-4 bg-[var(--paper-dark)]/30 rounded-xl mb-4 min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xs text-[var(--ink-light)] font-[family-name:var(--font-libre)] italic leading-relaxed">
                  &ldquo;{currentQuote.text}&rdquo;
                </p>
                <p className="text-[10px] text-[var(--ink-faded)] mt-2">— {currentQuote.author}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--paper-dark)]/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--ink)] flex items-center justify-center">
                <User className="w-4 h-4 text-[var(--paper)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium font-[family-name:var(--font-clash)]">Alex Chen</p>
                <p className="text-xs text-[var(--ink-faded)]">Free plan</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--ink-faded)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--paper)] border border-[var(--ink)]/10 rounded-xl shadow-xl overflow-hidden"
                >
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--ink-light)] hover:bg-[var(--paper-dark)]/50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--rust)] hover:bg-[var(--paper-dark)]/50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-[var(--ink)]/20 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[var(--paper)] z-50 shadow-2xl"
            >
              {/* Same content as desktop sidebar */}
              <div className="p-6 border-b border-[var(--ink)]/5 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2.5">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2.5C8.5 2.5 2.5 8.5 2.5 16c0 7.5 6 13.5 13.5 13.5 7.5 0 13.5-6 13.5-13.5C29.5 8.5 23.5 2.5 16 2.5z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
                    <path d="M11 9v14M11 16l8-7M14 16l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-lg font-semibold tracking-tight font-[family-name:var(--font-clash)]">klariti</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--paper-dark)]/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-[family-name:var(--font-clash)] text-sm ${
                      link.active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--ink-light)] hover:bg-[var(--paper-dark)]/50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[var(--paper)]/80 backdrop-blur-xl border-b border-[var(--ink)]/5">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--paper-dark)]/50"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search (desktop) */}
            <div className="hidden lg:block flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2.5 pl-10 bg-[var(--paper-dark)]/30 border border-transparent rounded-xl text-sm placeholder:text-[var(--ink-faded)] focus:outline-none focus:border-[var(--ink)]/10 focus:bg-[var(--paper)] transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faded)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button className="p-2.5 rounded-xl hover:bg-[var(--paper-dark)]/50 transition-colors">
                <Sun className="w-5 h-5 text-[var(--ink-faded)]" />
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-[var(--paper-dark)]/50 transition-colors">
                <Bell className="w-5 h-5 text-[var(--ink-faded)]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--rust)] rounded-full" />
              </button>

              {/* Profile (mobile) */}
              <button className="lg:hidden p-1 rounded-full">
                <div className="w-8 h-8 rounded-full bg-[var(--ink)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--paper)]" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-semibold font-[family-name:var(--font-clash)] text-[var(--ink)] mb-2">
              {greeting}, Alex
            </h1>
            <p className="text-[var(--ink-light)]">
              You&apos;re making great progress on your digital wellness journey.
            </p>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-[var(--paper)] border border-[var(--ink)]/5 rounded-2xl p-5 hover:shadow-lg hover:shadow-[var(--ink)]/5 transition-all duration-300"
              >
                {/* Subtle gradient background on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}08 0%, transparent 100%)`,
                  }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon
                        className="w-5 h-5"
                        style={{ color: stat.color }}
                      />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        stat.trend === 'up'
                          ? 'text-[var(--forest)] bg-[var(--forest)]/10'
                          : 'text-[var(--forest)] bg-[var(--forest)]/10'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>

                  <p className="text-2xl font-bold font-[family-name:var(--font-clash)] text-[var(--ink)] mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--ink-faded)]">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Two column layout */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Weekly progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-[var(--paper)] border border-[var(--ink)]/5 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold font-[family-name:var(--font-clash)]">Weekly Progress</h2>
                <button className="text-sm text-[var(--ink-faded)] hover:text-[var(--ink)] transition-colors">
                  View details
                </button>
              </div>

              {/* Simple bar chart visualization */}
              <div className="flex items-end justify-between gap-3 h-48">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [65, 45, 80, 55, 40, 75, 60];
                  const isToday = i === 3;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heights[i]}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        className={`w-full rounded-xl transition-colors ${
                          isToday
                            ? 'bg-[var(--ink)]'
                            : 'bg-[var(--paper-dark)] hover:bg-[var(--ink)]/20'
                        }`}
                      />
                      <span className={`text-xs ${isToday ? 'text-[var(--ink)] font-medium' : 'text-[var(--ink-faded)]'}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--ink)]/5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--ink-faded)] mb-1">Weekly average</p>
                  <p className="text-xl font-bold font-[family-name:var(--font-clash)]">2h 48m</p>
                </div>
                <div className="flex items-center gap-2 text-[var(--forest)] text-sm font-medium">
                  <TrendingDown className="w-4 h-4" />
                  23% less than last week
                </div>
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-[var(--paper)] border border-[var(--ink)]/5 rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold font-[family-name:var(--font-clash)] mb-6">Recent Activity</h2>

              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-[var(--ink)]/20" />
                    <div>
                      <p className="text-sm text-[var(--ink)] leading-relaxed">{activity.action}</p>
                      <p className="text-xs text-[var(--ink-faded)] mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 text-sm font-medium text-[var(--ink-light)] hover:text-[var(--ink)] border border-[var(--ink)]/10 rounded-xl hover:bg-[var(--paper-dark)]/30 transition-all">
                View all activity
              </button>
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 p-6 bg-gradient-to-br from-[var(--ink)] to-[var(--ink-light)] rounded-2xl text-[var(--paper)]"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--paper)]/10 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-[family-name:var(--font-clash)] mb-1">
                    Ready for a focus session?
                  </h3>
                  <p className="text-[var(--paper)]/70 text-sm">
                    Start a 25-minute deep work session and boost your productivity.
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-[var(--paper)] text-[var(--ink)] font-semibold font-[family-name:var(--font-clash)] rounded-xl hover:bg-[var(--paper)]/90 transition-colors whitespace-nowrap">
                Start Focus Mode
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
