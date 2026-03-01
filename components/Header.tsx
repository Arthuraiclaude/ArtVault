'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [isDark, setIsDark] = useState(true)
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const today = new Date()
    const formatted = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    setDateStr(formatted.charAt(0).toUpperCase() + formatted.slice(1))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
    }
    setIsDark(!isDark)
  }

  return (
    <header
      className="flex items-center justify-between px-8 py-6 border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Logo + sous-titre */}
      <div>
        <div className="flex items-baseline">
          <span
            className="font-serif text-2xl font-light tracking-[0.18em] uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            Art
          </span>
          <span
            className="font-serif text-2xl font-light tracking-[0.18em] uppercase"
            style={{ color: '#c9a84c' }}
          >
            Vault
          </span>
        </div>
        <p
          className="text-[10px] tracking-[0.3em] uppercase mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Patrimoine Personnel
        </p>
      </div>

      {/* Date + toggle */}
      <div className="flex items-center gap-6">
        <span
          className="hidden sm:block text-xs tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {dateStr}
        </span>

        {/* Dark / light toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center border transition-colors duration-300"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#c9a84c')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {isDark ? (
            /* Sun */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1"  x2="12" y2="3"  />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1"  y1="12" x2="3"  y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"  />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"  />
            </svg>
          ) : (
            /* Moon */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
