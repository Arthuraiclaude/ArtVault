'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header        from '@/components/Header'
import NetWorthHero  from '@/components/NetWorthHero'
import AssetCard     from '@/components/AssetCard'
import WealthChart   from '@/components/WealthChart'
import StatsBar      from '@/components/StatsBar'
import AddAssetModal from '@/components/AddAssetModal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Asset {
  id:        string
  name:      string
  category:  'liquidites' | 'investissements' | 'actifs'
  amount:    number
  currency:  string
  createdAt: unknown
}

// ── Config des 3 cartes ────────────────────────────────────────────────────────

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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [assets,    setAssets]    = useState<Asset[]>([])
  const [isLoading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Écoute Firestore en temps réel (onSnapshot)
  useEffect(() => {
    const q = query(collection(db, 'assets'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)))
        setLoading(false)
      },
      err => {
        console.error('Firestore error:', err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Somme par catégorie
  const totals = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + a.amount
    return acc
  }, {})

  const netTotal =
    (totals.liquidites ?? 0) +
    (totals.investissements ?? 0) +
    (totals.actifs ?? 0)

  // TODO: calculer la vraie variation mensuelle depuis des snapshots historiques (sprint futur)
  const monthlyChange = 2.4

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header />

      <main className="max-w-7xl mx-auto">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <NetWorthHero
          total={netTotal}
          monthlyChange={monthlyChange}
          isLoading={isLoading}
        />

        {/* ── Séparateur ────────────────────────────────────────────────── */}
        <div className="mx-8 h-px" style={{ backgroundColor: 'var(--border)' }} />

        {/* ── 3 cartes ──────────────────────────────────────────────────── */}
        <section
          className="mx-8 mt-8 mb-8 grid grid-cols-1 md:grid-cols-3 border"
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

        {/* ── Graphique ─────────────────────────────────────────────────── */}
        <div className="mx-8 mb-8">
          <WealthChart currentTotal={netTotal} />
        </div>

        {/* ── Barre de stats ────────────────────────────────────────────── */}
        <div
          className="mx-8 mb-8 border"
          style={{ borderColor: 'var(--border)' }}
        >
          <StatsBar total={netTotal} yearlyGoal={500_000} />
        </div>

        {/* ── Bouton Ajouter un actif ────────────────────────────────────── */}
        <div className="mx-8 mb-14">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 text-[10px] tracking-[0.35em] uppercase border transition-all duration-300"
            style={{ borderColor: '#c9a84c', color: '#c9a84c' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#c9a84c'
              e.currentTarget.style.color = '#0a0a0a'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#c9a84c'
            }}
          >
            + Ajouter un actif
          </button>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-8 py-5 text-center text-[10px] tracking-[0.3em] uppercase"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        ArtVault — {new Date().getFullYear()}
      </footer>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && <AddAssetModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
