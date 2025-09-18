export default function LockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="font-mono antialiased bg-[#d9d9d9] selection:bg-white/10">
        {children}
      </body>
    </html>
  )
}
