import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phone Dashboard',
  description: 'Live file sharing from phone to laptop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
