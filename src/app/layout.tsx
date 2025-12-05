import { type Metadata } from "next"

import "@/styles/globals.css"
import BaseLayout from "@/components/layout/BaseLayout"
import { AuthProvider } from "@/contexts/AuthContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="antialiased bg-[#2a2828] selection:bg-white/10 -z-10">
        <AuthProvider>
          <BaseLayout>{children}</BaseLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
