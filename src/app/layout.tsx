import { type Metadata, type Viewport } from "next"

import "@/styles/globals.css"
import BaseLayout from "@/components/layout/BaseLayout"
import { AuthProvider } from "@/contexts/AuthContext"
import QueryProvider from "@/components/providers/QueryProvider"

import localFont from "next/font/local";

const ppEditorial = localFont({
  src: [
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-Ultrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/editorial-new/PPEditorialNew-UltraboldItalic.otf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-pp-editorial",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://klariti.so"),
  title: {
    template: "%s — Klariti",
    default: "Klariti — The New Standard in Digital Wellness",
  },
  description: "Develop a healthy relationship with technology. Tools for focus, balance, and clarity.",
  openGraph: {
    siteName: "Klariti",
    type: "website",
    locale: "en_US",
    title: "Klariti — The New Standard in Digital Wellness",
    description: "Develop a healthy relationship with technology.",
    images: [
      {
        url: "/images/pc-land2.png",
        width: 1200,
        height: 630,
        alt: "Klariti — Digital Wellness",
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafaf8",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={ppEditorial.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-primary/10">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <AuthProvider>
            <BaseLayout>{children}</BaseLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
