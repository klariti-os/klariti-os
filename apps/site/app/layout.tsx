import type { Metadata } from "next";
import { Syne, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Syne - bold, geometric display font with character
const syne = Syne({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap",
});

// Libre Baskerville - elegant editorial serif for body text
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

// JetBrains Mono - characterful monospace for typewriter effects
const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Klariti | Reclaim Your Digital Wellbeing",
    template: "%s | Klariti",
  },
  description:
    "Tools that empower you to enjoy technology's benefits while fostering a healthy, mindful relationship with it. Reclaim your attention, find your balance.",
  keywords: [
    "digital wellness",
    "digital wellbeing",
    "mindful technology",
    "screen time management",
    "focus tools",
    "attention economy",
    "digital balance",
    "tech mindfulness",
  ],
  authors: [{ name: "Klariti" }],
  creator: "Klariti",
  publisher: "Klariti",
  metadataBase: new URL("https://klariti.so"),
  openGraph: {
    title: "Klariti | Reclaim Your Digital Wellbeing",
    description:
      "Technology should enhance life, not consume it. Tools for mindful digital living.",
    url: "https://klariti.so",
    siteName: "Klariti",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Klariti | Reclaim Your Digital Wellbeing",
    description:
      "Technology should enhance life, not consume it. Tools for mindful digital living.",
    creator: "@klaritiso",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable}`}
      >
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
