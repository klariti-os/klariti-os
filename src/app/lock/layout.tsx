export default function LockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="font-mono antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
