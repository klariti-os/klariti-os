import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-20 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm dark:border-gray-800/50 dark:bg-black/30">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          © {new Date().getFullYear()} Klariti OS. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/manifesto" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Manifesto
          </Link>
          <Link href="/join" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Join
          </Link>
          <Link href="mailto:hello@klariti.so" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
