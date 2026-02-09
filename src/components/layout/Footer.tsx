import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="screen-line-before mx-auto max-w-content px-6 py-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <p className="mb-3 font-editorial text-base text-foreground">
            Klariti
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The new standard
            <br />
            in digital wellness.
          </p>
        </div>

        {/* Company */}
        <nav aria-label="Company links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Company
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/manifesto"
                className="transition-colors hover:text-foreground"
              >
                Manifesto
              </Link>
            </li>
            <li>
              <Link
                href="/join"
                className="transition-colors hover:text-foreground"
              >
                Join
              </Link>
            </li>
          </ul>
        </nav>

        {/* Product */}
        <nav aria-label="Product links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/resources"
                className="transition-colors hover:text-foreground"
              >
                Resources
              </Link>
            </li>
          </ul>
        </nav>

        {/* Connect */}
        <nav aria-label="Social links">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Connect
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
      </div>

      {/* Bottom */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Klariti</p>
        <div className="flex gap-6">
          <Link href="/" className="transition-colors hover:text-foreground">Privacy Policy</Link>
          <Link href="/" className="transition-colors hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
