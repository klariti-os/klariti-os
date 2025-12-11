import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full text-white mt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/pc-land2.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          {/* Column 1 */}
          <div>
            <h3 className="font-pp-editorial text-xl mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-white transition-colors">Join</Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-pp-editorial text-xl mb-6">Product</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">Login</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-pp-editorial text-xl mb-6">Connect</h3>
            <ul className="space-y-4 text-sm text-gray-200">
              <li>
                <a href="https://github.com/klariti-os" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Github</a>
              </li>
              <li>
                <a href="https://instagram.com/klariti_os" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">instagram</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col pb-16 md:pb-0 md:flex-row justify-between items-center pt-8 border-t border-white/20 text-sm text-gray-300 font-mono">
          <div>
            © {currentYear} Klariti OS.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
