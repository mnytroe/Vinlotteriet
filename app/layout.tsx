import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vinlotteriet',
  description: 'Lotteri app for jobben',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
