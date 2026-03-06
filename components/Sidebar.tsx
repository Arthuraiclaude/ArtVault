'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href:  '/',
    label: 'Patrimoine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href:  '/budget',
    label: 'Budget',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="1" />
        <path d="M2 10h20M7 15h2M12 15h5" />
      </svg>
    ),
  },
  {
    href:  '/sankey',
    label: 'Flux Financiers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 3h7v5H3zM14 3h7v5h-7zM3 16h7v5H3zM14 16h7v5h-7z" />
        <path d="M10 5.5h4M10 18.5h4M6.5 8v8M17.5 8v8" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const w = collapsed ? 60 : 220

  return (
    <aside
      className="flex-shrink-0 flex flex-col border-r transition-all duration-300"
      style={{
        width:           w,
        minHeight:       '100vh',
        backgroundColor: 'var(--bg2, #111111)',
        borderColor:     'var(--border, rgba(255,255,255,0.07))',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 py-6 border-b"
        style={{ borderColor: 'var(--border, rgba(255,255,255,0.07))' }}
      >
        {!collapsed && (
          <div className="flex items-baseline gap-0">
            <span
              className="font-serif text-lg font-light tracking-[0.18em] uppercase"
              style={{ color: 'var(--text, #f0ece4)' }}
            >
              Art
            </span>
            <span
              className="font-serif text-lg font-light tracking-[0.18em] uppercase"
              style={{ color: '#c9a84c' }}
            >
              Vault
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: 'var(--text2, rgba(240,236,228,0.4))' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2, rgba(240,236,228,0.4))')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 mb-1 transition-all duration-200 rounded-sm group"
              style={{
                backgroundColor: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                color:           active ? '#c9a84c' : 'var(--text2, rgba(240,236,228,0.4))',
                borderLeft:      active ? '2px solid #c9a84c' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color           = 'var(--text, #f0ece4)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color           = 'var(--text2, rgba(240,236,228,0.4))'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-[11px] tracking-[0.2em] uppercase whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Version */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: 'var(--border, rgba(255,255,255,0.07))' }}
      >
        {!collapsed ? (
          <p className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'var(--text3, rgba(240,236,228,0.2))' }}>
            ArtVault v0.1
          </p>
        ) : (
          <p className="text-[9px] text-center" style={{ color: 'var(--text3, rgba(240,236,228,0.2))' }}>v1</p>
        )}
      </div>
    </aside>
  )
}
