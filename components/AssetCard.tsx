'use client'

import WowCoin from '@/components/WowCoin'

interface AssetCardProps {
  title:       string
  amount:      number
  description: string
  delay:       'animate-fade-up-1' | 'animate-fade-up-2' | 'animate-fade-up-3'
  isLoading:   boolean
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style:                 'currency',
    currency:              'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

export default function AssetCard({ title, amount, description, delay, isLoading }: AssetCardProps) {
  return (
    <div
      className={`p-6 group cursor-default ${delay} transition-all duration-300`}
      style={{ backgroundColor: 'var(--bg2)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderTopColor   = '#c9a84c'
        e.currentTarget.style.transform        = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderTopColor   = 'transparent'
        e.currentTarget.style.transform        = 'translateY(0)'
      }}
    >
      {/* Catégorie */}
      <p
        className="text-[10px] tracking-[0.28em] uppercase mb-5"
        style={{ color: 'var(--text2)' }}
      >
        {title}
      </p>

      {/* Montant */}
      {isLoading ? (
        <div
          className="h-10 w-36 animate-pulse mb-3"
          style={{ backgroundColor: 'var(--bg3)' }}
        />
      ) : (
        <p
          className="font-serif font-light text-4xl mb-2 flex items-center"
          style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
        >
          {fmt(amount)}
          <WowCoin size={18} />
        </p>
      )}

      {/* Description */}
      <p className="text-[11px]" style={{ color: 'var(--text2)' }}>
        {description}
      </p>

      {/* Ligne dorée animée au hover */}
      <div
        className="mt-6 h-px w-6 group-hover:w-full transition-all duration-500 ease-out"
        style={{ backgroundColor: '#c9a84c' }}
      />
    </div>
  )
}
