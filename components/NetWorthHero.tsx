'use client'

import WowCoin from '@/components/WowCoin'

interface NetWorthHeroProps {
  total:         number
  monthlyChange: number
  isLoading:     boolean
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)

export default function NetWorthHero({ total, monthlyChange, isLoading }: NetWorthHeroProps) {
  const isPositive = monthlyChange >= 0

  return (
    <section className="px-8 pt-14 pb-10 animate-fade-up">
      <p className="text-[10px] tracking-[0.35em] uppercase mb-5" style={{ color: 'var(--text2)' }}>
        Capital Net Total
      </p>

      {isLoading ? (
        <div className="h-24 w-72 animate-pulse" style={{ backgroundColor: 'var(--bg2)' }} />
      ) : (
        <div className="flex items-end gap-5 flex-wrap">
          <h1
            className="font-serif font-light leading-none flex items-center"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            {fmt(total)}
            <WowCoin size={28} />
          </h1>

          <div
            className="mb-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono tracking-wider"
            style={{
              backgroundColor: isPositive ? 'rgba(76,175,125,0.10)'         : 'rgba(224,92,92,0.10)',
              color:           isPositive ? '#4caf7d'                        : '#e05c5c',
              border:          `1px solid ${isPositive ? 'rgba(76,175,125,0.3)' : 'rgba(224,92,92,0.3)'}`,
            }}
          >
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{isPositive ? '+' : ''}{monthlyChange.toFixed(1)}% ce mois</span>
          </div>
        </div>
      )}
    </section>
  )
}
