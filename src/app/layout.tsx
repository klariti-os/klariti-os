import { type Metadata } from "next"

import "@/styles/globals.css"
import BaseLayout from "@/components/layout/BaseLayout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="font-mono antialiased bg-[#d9d9d9] selection:bg-white/10">
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  )
}
