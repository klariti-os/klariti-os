import { type Metadata, type Viewport } from "next"

import "@/styles/globals.css"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { fontSerif, fontMono, fontSans } from "@/lib/fonts"

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
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://aho0m5pvydzzhrre.public.blob.vercel-storage.com/klariti-melancholy%20mp4.mp4"
          as="video"
          type="video/mp4"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-primary/10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
