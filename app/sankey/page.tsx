'use client'

import { useState } from 'react'
import AuthGuard       from '@/components/AuthGuard'
import Sidebar         from '@/components/Sidebar'
import Header          from '@/components/Header'
import SankeyCanvas    from '@/components/SankeyCanvas'
import SankeyModal     from '@/components/SankeyModal'
import BudgetRuleAlert from '@/components/BudgetRuleAlert'
import { useMonthlyFlow } from '@/lib/useMonthlyFlows'
import { computeAlerts, computeSurplus } from '@/lib/budgetRules'

// ── Formatters ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', {
    style:                 'currency',
    currency:              'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

// ── Composant ─────────────────────────────────────────────────────────────────

export default function SankeyPage() {
  const now = new Date()
  const [year,      setYear]      = useState(now.getFullYear())
  const [month,     setMonth]     = useState(now.getMonth() + 1)
  const [showModal, setShowModal] = useState(false)

  const { flow, isLoading } = useMonthlyFlow(year, month)

  const alerts  = flow ? computeAlerts(flow)  : []
  const surplus = flow ? computeSurplus(flow) : 0

  const totalIncome   = flow?.totalIncome ?? 0
  const totalExpenses = (flow?.categories ?? []).reduce((s, c) => s + c.value, 0)
  const totalSavings  = (flow?.categories ?? []).find(c => c.label === 'Épargne & Invest')?.value ?? 0

  // Navigation mois
  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else              { setMonth(m => m - 1) }
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else               { setMonth(m => m + 1) }
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 px-8 py-8 max-w-7xl w-full mx-auto">

            {/* ── Titre page ─────────────────────────────────────────────── */}
            <div className="mb-8 animate-fade-up">
              <p className="text-[10px] tracking-[0.35em] uppercase mb-2" style={{ color: 'var(--text2)' }}>
                Analyse Budgétaire
              </p>
              <h2
                className="font-serif font-light"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)', letterSpacing: '-0.01em' }}
              >
                Flux Financiers
              </h2>
            </div>

            {/* ── Sélecteur de mois ──────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8 animate-fade-up-1">
              <div className="flex items-center gap-4">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 flex items-center justify-center border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>

                <span className="font-serif text-xl font-light capitalize" style={{ color: 'var(--text)', minWidth: 180, textAlign: 'center' }}>
                  {monthLabel}
                </span>

                <button
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 text-[10px] tracking-[0.3em] uppercase border transition-all duration-300"
                style={{ borderColor: '#c9a84c', color: '#c9a84c' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c9a84c'; e.currentTarget.style.color = '#0a0a0a' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#c9a84c' }}
              >
                {flow ? 'Modifier les données' : '+ Saisir les données'}
              </button>
            </div>

            {/* ── Alertes budget ─────────────────────────────────────────── */}
            {alerts.length > 0 && <BudgetRuleAlert alerts={alerts} />}

            {/* ── 4 cartes résumé ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 border mb-8 animate-fade-up-2" style={{ borderColor: 'var(--border)' }}>
              {[
                {
                  label: 'Revenus',
                  value: totalIncome,
                  pct:   null,
                  color: '#4caf7d',
                  sub:   '100% du budget',
                },
                {
                  label: 'Dépenses',
                  value: totalExpenses,
                  pct:   totalIncome > 0 ? (totalExpenses / totalIncome * 100).toFixed(0) + '%' : '—',
                  color: '#e05c5c',
                  sub:   'du revenu',
                },
                {
                  label: 'Épargne & Invest',
                  value: totalSavings,
                  pct:   totalIncome > 0 ? (totalSavings / totalIncome * 100).toFixed(0) + '%' : '—',
                  color: '#c9a84c',
                  sub:   'du revenu',
                },
                {
                  label: 'Surplus',
                  value: surplus,
                  pct:   totalIncome > 0 ? (surplus / totalIncome * 100).toFixed(0) + '%' : '—',
                  color: surplus >= 0 ? '#94a3b8' : '#e05c5c',
                  sub:   surplus >= 0 ? 'non alloué' : 'dépassement',
                },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`px-6 py-5 ${i > 0 ? 'border-l' : ''}`}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg2)' }}
                >
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: 'var(--text2)' }}>
                    {card.label}
                  </p>
                  <p className="font-serif text-2xl font-light mb-1" style={{ color: card.color }}>
                    {isLoading ? '—' : fmt(card.value)}
                  </p>
                  {card.pct && (
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text2)' }}>
                      {card.pct} {card.sub}
                    </p>
                  )}
                  {!card.pct && (
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text2)' }}>{card.sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* ── Diagramme Sankey ───────────────────────────────────────── */}
            <div
              className="border p-6 animate-fade-up-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg2)' }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--text2)' }}>
                Visualisation des flux
              </p>
              {isLoading ? (
                <div className="h-[500px] animate-pulse" style={{ backgroundColor: 'var(--bg3)' }} />
              ) : (
                <SankeyCanvas flow={flow} />
              )}
            </div>

          </main>
        </div>
      </div>

      {showModal && (
        <SankeyModal
          year={year}
          month={month}
          initial={flow}
          onClose={() => setShowModal(false)}
        />
      )}
    </AuthGuard>
  )
}
