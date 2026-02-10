"use client";

import NextLink from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import KlaritiLogo from "@/components/KlaritiLogo";

const NavItem: React.FC<{
  href: string;
  title: string;
  onClick?: () => void;
}> = ({ href, title, onClick }) => {
  return (
    <NextLink
      href={href}
      prefetch={false}
      onClick={onClick}
      className="block text-sm text-muted-foreground duration-150 hover:text-accent-foreground"
    >
      <span>{title}</span>
    </NextLink>
  );
};

const Navigation: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed  z-50 w-full px-2 lg:px-6">
      <div className="mx-auto  mt-2 max-w-7xl transition-all duration-300">
        <div className="relative flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border/50 bg-background px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/20 lg:gap-0 lg:px-6">
          {/* Left: Logo + Mobile Toggle */}
          <div className="flex w-full justify-between lg:w-auto">
            <NextLink
              href="/"
              aria-label="Klariti home"
              className="flex items-center space-x-2"
            >
              {/* Logo Icon */}
              <KlaritiLogo variant="dark" className="size-7" />
              <span className="font-serif text-lg font-medium tracking-tight text-foreground">
                Klariti
              </span>
            </NextLink>

            {/* Mobile Menu Button */}
            <button
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative -mr-2 block cursor-pointer p-2.5 lg:hidden z-20"
            >
              {/* Hamburger Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={`m-auto size-6 text-foreground transition-all duration-200 ${
                  mobileMenuOpen
                    ? "rotate-180 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              >
                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
              </svg>
              {/* Close Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 256 256"
                className={`absolute inset-0 m-auto size-6 text-foreground transition-all duration-200 ${
                  mobileMenuOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-180 scale-0 opacity-0"
                }`}
              >
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
              </svg>
            </button>
          </div>

          {/* Center: Desktop Nav Links */}
          <div className="absolute inset-0 m-auto hidden size-fit lg:block">
            <ul className="flex gap-8 text-sm">
              <li>
                <NavItem href="/manifesto" title="Manifesto" />
              </li>
              <li>
                <NavItem href="/resources" title="Resources" />
              </li>
              {!isLoading && user && (
                <li>
                  <NavItem href="/dashboard" title="Dashboard" />
                </li>
              )}
            </ul>
          </div>

          {/* Right: CTA / Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && user ? (
              <button
                onClick={logout}
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Log Out
              </button>
            ) : (
              !isLoading && (
                <NextLink
                  href="/auth"
                  className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Get Started
                </NextLink>
              )
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            className={`w-full flex-wrap items-center justify-end space-y-6 rounded-2xl border border-border/50 bg-background p-6 shadow-2xl shadow-black/10 dark:shadow-black/30 lg:hidden transition-all duration-300 ${
              mobileMenuOpen
                ? "mb-2 flex opacity-100 translate-y-0"
                : "hidden opacity-0 -translate-y-4"
            }`}
          >
            {/* Mobile Nav Links */}
            <ul className="w-full space-y-4 text-base">
              <li>
                <NavItem
                  href="/manifesto"
                  title="Manifesto"
                  onClick={closeMobileMenu}
                />
              </li>
              <li>
                <NavItem
                  href="/resources"
                  title="Resources"
                  onClick={closeMobileMenu}
                />
              </li>
              {!isLoading && user && (
                <li>
                  <NavItem
                    href="/dashboard"
                    title="Dashboard"
                    onClick={closeMobileMenu}
                  />
                </li>
              )}
            </ul>

            {/* Mobile Auth Buttons */}
            <div className="flex w-full flex-col space-y-3 pt-4 border-t border-border/50">
              {!isLoading && user ? (
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
                >
                  Log Out
                </button>
              ) : (
                !isLoading && (
                  <NextLink
                    href="/auth"
                    onClick={closeMobileMenu}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Get Started
                  </NextLink>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
