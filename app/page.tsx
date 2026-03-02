'use client'

import { useState } from 'react'
import AuthGuard    from '@/components/AuthGuard'
import Sidebar      from '@/components/Sidebar'
import Header       from '@/components/Header'
import NetWorthHero from '@/components/NetWorthHero'
import AssetCard    from '@/components/AssetCard'
import WealthChart  from '@/components/WealthChart'
import StatsBar     from '@/components/StatsBar'
import AddAssetModal from '@/components/AddAssetModal'
import { useAssets } from '@/lib/useAssets'

const CARDS = [
  {
    key:         'liquidites'      as const,
    title:       'Liquidités',
    description: 'Comptes courants & épargne disponible',
    delay:       'animate-fade-up-1' as const,
  },
  {
    key:         'investissements' as const,
    title:       'Investissements',
    description: 'Portefeuille, ETF & placements financiers',
    delay:       'animate-fade-up-2' as const,
  },
  {
    key:         'actifs'          as const,
    title:       'Actifs',
    description: 'Immobilier, art & biens tangibles',
    delay:       'animate-fade-up-3' as const,
  },
] as const

export default function Dashboard() {
  const { totals, netTotal, isLoading } = useAssets()
  const [showModal, setShowModal] = useState(false)

  // TODO: calculer depuis wealth_history (sprint futur)
  const monthlyChange = 2.4

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 max-w-7xl w-full mx-auto">

            {/* Hero */}
            <NetWorthHero
              total={netTotal}
              monthlyChange={monthlyChange}
              isLoading={isLoading}
            />

            {/* Divider doré */}
            <div className="mx-8 flex items-center gap-0 mb-8">
              <div style={{ width: 80, height: 1, backgroundColor: 'var(--gold)' }} />
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
            </div>

            {/* 3 cartes */}
            <section
              className="mx-8 mb-8 grid grid-cols-1 md:grid-cols-3 border"
              style={{ borderColor: 'var(--border)' }}
            >
              {CARDS.map((card, i) => (
                <div
                  key={card.key}
                  className={i > 0 ? 'border-l' : ''}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <AssetCard
                    title={card.title}
                    amount={totals[card.key] ?? 0}
                    description={card.description}
                    delay={card.delay}
                    isLoading={isLoading}
                  />
                </div>
              ))}
            </section>

            {/* Graphique */}
            <div className="mx-8 mb-8">
              <WealthChart currentTotal={netTotal} />
            </div>

            {/* Stats */}
            <div className="mx-8 mb-8 border" style={{ borderColor: 'var(--border)' }}>
              <StatsBar total={netTotal} yearlyGoal={500_000} />
            </div>

            {/* Bouton ajout */}
            <div className="mx-8 mb-14">
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-4 text-[10px] tracking-[0.35em] uppercase border transition-all duration-300"
                style={{ borderColor: '#c9a84c', color: '#c9a84c' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c9a84c'; e.currentTarget.style.color = '#0a0a0a' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c9a84c' }}
              >
                + Ajouter un actif
              </button>
            </div>
          </main>

          <footer
            className="border-t px-8 py-5 text-center text-[10px] tracking-[0.3em] uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
          >
            ArtVault — {new Date().getFullYear()}
          </footer>
        </div>
      </div>

      {showModal && <AddAssetModal onClose={() => setShowModal(false)} />}
    </AuthGuard>
  )
}
