import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="screen-line-before relative mx-auto w-full overflow-hidden px-0 py-0">
      <div className="relative min-h-[520px] w-full overflow-hidden border-t border-border md:min-h-[580px]">
        <Image
          src="/images/euphoria/underwater.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 py-10 sm:px-8 md:px-10 lg:px-12 lg:py-12">
            <div className="max-w-2xl text-left text-white">
              <p className="font-serif text-2xl leading-tight md:text-3xl">
                Klariti
              </p>
              <p className="mt-3 max-w-sm font-serif text-lg leading-relaxed text-white/85 md:text-xl">
                Reclaim human agency
                <br />
                in the digital age.
              </p>

              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Resources
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/join"
                    className="focus-ring inline-flex items-center rounded-full border border-white/30 bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-white/90"
                  >
                    Get started
                  </Link>
                  <a
                    href="https://github.com/klariti-os"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black/35"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://instagram.com/klariti_os"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black/35"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
