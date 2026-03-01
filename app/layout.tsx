import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Mono } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ArtVault — Patrimoine Personnel',
  description: 'Suivi de patrimoine personnel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning évite les warnings liés au toggle dark/light côté client
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${dmMono.variable} font-mono min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
