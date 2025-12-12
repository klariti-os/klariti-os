import { type Metadata } from "next"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full antialiased bg-zinc-950 text-zinc-100 bg-fixed bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/40 to-zinc-950 ${ppEditorial.variable}`}>
      <body className="antialiased h-full selection:bg-emerald-500/30">
        <QueryProvider>
          <AuthProvider>
            <BaseLayout>{children}</BaseLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
