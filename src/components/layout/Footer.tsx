import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="screen-line-before mx-auto max-w-content px-6 py-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <p className="mb-3 font-serif text-base text-foreground">
            Klariti
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Reclaim human agency
            <br />
            in the digital age.
          </p>
        </div>

        {/* Product */}
        <nav aria-label="Product links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/#product" className="transition-colors hover:text-foreground">
                Gray Engine
              </Link>
            </li>
            <li>
              <Link href="/challenges" className="transition-colors hover:text-foreground">
                Challenges
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/resources" className="transition-colors hover:text-foreground">
                Resources
              </Link>
            </li>
          </ul>
        </nav>

        {/* Project */}
        <nav aria-label="Project links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Project
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/manifesto" className="transition-colors hover:text-foreground">
                Manifesto
              </Link>
            </li>
            <li>
              <Link href="/#research" className="transition-colors hover:text-foreground">
                Research
              </Link>
            </li>
            <li>
              <Link href="/join" className="transition-colors hover:text-foreground">
                Join
              </Link>
            </li>
          </ul>
        </nav>

        {/* Community */}
        <nav aria-label="Community links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Community
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://discord.gg/NTKHD9pW"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://github.com/klariti-os"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/klariti_os"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <span className="text-muted-foreground/60">License MIT</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Klariti &middot; Open Source</p>
        <p className="font-mono text-[11px] text-muted-foreground/60">
          Technology should serve people, not exploit them.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
