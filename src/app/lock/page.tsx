import React from 'react';
import localFont from 'next/font/local';

// Using PP Editorial New Ultralight from local font files
const ppEditorialUltralight = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-Ultralight.otf',
      weight: '200',
      style: 'normal',
    }
  ],
  variable: '--font-pp-editorial-ultralight',
  display: 'swap',
});

// Using PP Editorial New Regular for "reclaim your time"
const ppEditorialRegular = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-Regular.otf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-pp-editorial-regular',
  display: 'swap',
});

// Using PP Editorial New UltralightItalic for quotes
const ppEditorialUltralightItalic = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-UltralightItalic.otf',
      weight: '200',
      style: 'italic',
    }
  ],
  variable: '--font-pp-editorial-ultralight-italic',
  display: 'swap',
});

export const metadata = {
  title: 'K-Switch Activated',
  description: 'Time to reKlaim your time',
};

export default function LockPage() {
  // Sample quotes that can be shown randomly
  const quotes = [
    {
      text: "The key is not in spending time, but in investing it.",
      author: "Stephen R. Covey"
    },
    {
      text: "Time is the most valuable coin in your life. You and you alone will determine how that coin will be spent.",
      author: "Carl Sandburg"
    },
    {
      text: "Time is what we want most, but what we use worst.",
      author: "William Penn"
    },
    {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi"
    }
  ];

  // Select a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 text-center ${ppEditorialUltralight.variable} ${ppEditorialRegular.variable} ${ppEditorialUltralightItalic.variable}`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-16">
          <h1 className="font-pp-editorial-ultralight text-white text-4xl md:text-6xl mb-8 tracking-wider leading-relaxed">
            Klariti mode has been activated
          </h1>
          <p className="text-white font-pp-editorial-regular text-xl md:text-2xl">
            Go touch grass!
          </p>  
        </div>

        <div className="pt-8 mt-8">
          <div className="border border-white/30 rounded-lg p-6 bg-black/30 backdrop-blur-sm">
            <blockquote className="mb-3">
              <p className="font-pp-editorial-ultralight  text-2xl text-white">&ldquo;{randomQuote.text}&rdquo;</p>
            </blockquote>
            <cite className="text-sm non-italic text-white/70 block uppercase text-right">— {randomQuote.author}</cite>
          </div>
        </div>
      </div>
    </div>
  );
}
