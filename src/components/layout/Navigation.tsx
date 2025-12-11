"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const NavItem: React.FC<{ href: string; title: string }> = ({
  href,
  title,
}) => {
  let isActive = usePathname() === href;
  return (
    <NextLink
      href={href}
      prefetch={false}
      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        isActive ? "text-white" : "text-zinc-400 hover:text-white"
      }`}
    >
      {title}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-1 mx-auto h-px w-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}
    </NextLink>
  );
};

const Navigation: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 z-50 flex justify-center bottom-6 md:top-6 md:bottom-auto pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between p-1.5 pl-4 pr-1.5 w-[95%] md:w-auto md:min-w-[500px] max-w-4xl bg-[#181818]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgb(0,0,0,0.4)] ring-1 ring-white/5">
        
        {/* Left: Logo */}
        <NextLink href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-2 md:mr-4 shrink-0">
          <Image src="/logo.svg" alt="Klariti Logo" width={24} height={24} className="w-6 h-6" />
          <span className="text-white font-semibold tracking-tight hidden sm:block">Klariti</span>
        </NextLink>

        {/* Center: Links - Visible on mobile now, optimized for space */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mx-auto overflow-x-auto no-scrollbar mask-gradient">
          <NavItem href="/manifesto" title="Manifesto" />
          {/* <NavItem href="/flashcards" title="Cards" /> */}
          {!isLoading && user && (
            <NavItem href="/dashboard" title="Dashboard" />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-2 md:ml-auto shrink-0">
          {!isLoading && user ? (
            <button
              onClick={logout}
              className="px-4 md:px-5 py-2 text-xs md:text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all duration-300 border border-white/5 hover:border-white/10 whitespace-nowrap"
            >
              Log out
            </button>
          ) : (
             !isLoading && (
              <NextLink
                href="/auth"
                className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] whitespace-nowrap"
              >
                Get Started
              </NextLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
