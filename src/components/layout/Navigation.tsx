"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NavItem: React.FC<{ href: string; title: string }> = ({
  href,
  title,
}) => {
  const isActive = usePathname() === href;
  return (
    <NextLink
      href={href}
      prefetch={false}
      className={`focus-ring relative rounded-md px-3 py-1.5 font-mono text-xs tracking-wide transition-colors ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {title}
      {isActive && (
        <span className="absolute inset-x-2 -bottom-[13px] h-px bg-foreground" />
      )}
    </NextLink>
  );
};

const Navigation: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="screen-line-after sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-12 max-w-content items-center justify-between gap-4 px-6"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <NextLink
          href="/"
          className="focus-ring rounded-sm font-editorial text-base font-normal tracking-tight text-foreground transition-opacity hover:opacity-70"
          aria-label="Klariti home"
        >
          Klariti
        </NextLink>

        {/* Center links */}
        <div className="flex items-center gap-1">
          <NavItem href="/manifesto" title="Manifesto" />
          <NavItem href="/resources" title="Resources" />
          {!isLoading && user && (
            <NavItem href="/dashboard" title="Dashboard" />
          )}
        </div>

        {/* Right action */}
        <div className="flex items-center">
          {!isLoading && user ? (
            <button
              onClick={logout}
              className="focus-ring rounded-full border border-border px-4 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Log Out
            </button>
          ) : (
            !isLoading && (
              <NextLink
                href="/auth"
                className="focus-ring rounded-full bg-primary px-4 py-1.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-80"
              >
                Get Started
              </NextLink>
            )
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
