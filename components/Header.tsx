'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Header() {
  const [isDark,  setIsDark]  = useState(true)
  const [dateStr, setDateStr] = useState('')
  const router = useRouter()

  useEffect(() => {
    const today = new Date()
    const formatted = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric',
    })
    setDateStr(formatted.charAt(0).toUpperCase() + formatted.slice(1))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDark) { html.classList.remove('dark') }
    else        { html.classList.add('dark')    }
    setIsDark(!isDark)
  }

  const handleSignOut = async () => {
    await signOut(auth)
    document.cookie = 'artvault-session=; path=/; max-age=0'
    router.replace('/login')
  }

  const iconBtn = (label: string, onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center border transition-all duration-300"
      style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#c9a84c'
        e.currentTarget.style.color       = '#c9a84c'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color       = 'var(--text2)'
      }}
    >
      {children}
    </button>
  )

  return (
    <header
      className="flex items-center justify-between px-8 py-5 border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <span
        className="hidden sm:block text-[10px] tracking-[0.28em] uppercase"
        style={{ color: 'var(--text2)' }}
      >
        {dateStr}
      </span>

      <div className="flex items-center gap-2 ml-auto">
        {iconBtn('Toggle theme', toggleTheme,
          isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ),
        )}
        {iconBtn('Déconnexion', handleSignOut,
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>,
        )}
      </div>
    </header>
  )
}
