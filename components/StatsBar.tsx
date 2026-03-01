'use client'

interface StatsBarProps {
  total: number
  yearlyGoal?: number
}

const fmtCompact = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(n)

export default function StatsBar({ total, yearlyGoal = 500_000 }: StatsBarProps) {
  const progression = Math.min((total / yearlyGoal) * 100, 100)
  // TODO: calculer le rendement YTD depuis les snapshots historiques (sprint futur)
  const ytdReturn = 7.4

  return (
    <div
      className="grid grid-cols-3 animate-fade-up-3"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Objectif annuel */}
      <div className="px-7 py-5">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Objectif Annuel
        </p>
        <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
          {fmtCompact(yearlyGoal)}
        </p>
      </div>

      {/* Progression */}
      <div className="px-7 py-5 border-l border-r" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Progression
        </p>
        <p className="font-serif text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>
          {progression.toFixed(1)}%
        </p>
        {/* Barre de progression */}
        <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{ width: `${progression}%`, backgroundColor: '#c9a84c' }}
          />
        </div>
      </div>

      {/* Rendement YTD */}
      <div className="px-7 py-5">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Rendement YTD
        </p>
        <p className="font-serif text-2xl font-light" style={{ color: '#c9a84c' }}>
          +{ytdReturn}%
        </p>
      </div>
    </div>
  )
}
