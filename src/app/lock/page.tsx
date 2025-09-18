import React from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            K-switch has been activated
          </h1>
          <p className="text-xl md:text-2xl">
            Go reKlaim your time
          </p>
        </div>

        <div className="pt-8 mt-8">
          <div className="border border-white/30 rounded-lg p-6 bg-black/50 backdrop-blur-sm">
            <blockquote className="mb-3">
              <p className="text-xl italic text-white">&ldquo;{randomQuote.text}&rdquo;</p>
            </blockquote>
            <cite className="text-sm text-white/70 block text-right">— {randomQuote.author}</cite>
          </div>
        </div>
      </div>
    </div>
  );
}
