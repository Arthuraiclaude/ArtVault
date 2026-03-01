'use client'

interface NetWorthHeroProps {
  total: number
  monthlyChange: number
  isLoading: boolean
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

export default function NetWorthHero({ total, monthlyChange, isLoading }: NetWorthHeroProps) {
  const isPositive = monthlyChange >= 0

  return (
    <section className="px-8 pt-16 pb-12 animate-fade-up">
      <p
        className="text-[10px] tracking-[0.35em] uppercase mb-5"
        style={{ color: 'var(--text-muted)' }}
      >
        Capital Net Total
      </p>

      {isLoading ? (
        <div
          className="h-24 w-72 animate-pulse"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        />
      ) : (
        <div className="flex items-end gap-5 flex-wrap">
          {/* Montant principal */}
          <h1
            className="font-serif font-light leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {fmt(total)}
          </h1>

          {/* Pill variation mensuelle */}
          <div
            className="mb-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-mono tracking-wider"
            style={{
              backgroundColor: isPositive ? '#c9a84c12' : '#ef444412',
              color:           isPositive ? '#c9a84c'   : '#ef4444',
              border: `1px solid ${isPositive ? '#c9a84c30' : '#ef444430'}`,
            }}
          >
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>
              {isPositive ? '+' : ''}{monthlyChange.toFixed(1)}% ce mois
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
