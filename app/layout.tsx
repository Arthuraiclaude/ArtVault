import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'ArtVault — Patrimoine Personnel',
  description: 'Suivi de patrimoine personnel — Arthur Arenal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="font-mono min-h-screen">
        {children}
      </body>
    </html>
  )
}
