'use client'

import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CATEGORIES, BUDGET } from '@/config/budget'
import type { MonthlyFlow, FlowSource, FlowCategory, FlowItem } from '@/types/finance'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

interface SankeyModalProps {
  year:    number
  month:   number
  initial: MonthlyFlow | null
  onClose: () => void
}

// ── État initial des catégories ──────────────────────────────────────────────

function initCategories(initial: MonthlyFlow | null): FlowCategory[] {
  return CATEGORIES.map(cat => {
    const existing = initial?.categories.find(c => c.label === cat.label)
    return {
      label: cat.label,
      color: cat.color,
      value: existing?.value ?? 0,
      items: existing?.items ?? [{ label: cat.label, value: existing?.value ?? 0 }],
    }
  })
}

function initSources(initial: MonthlyFlow | null): FlowSource[] {
  if (initial?.sources.length) return initial.sources
  return [{ label: 'Salaire', value: 0, color: '#4caf7d' }]
}

// ── Source colors ─────────────────────────────────────────────────────────────

const SOURCE_COLORS = ['#4caf7d', '#22d3ee', '#a78bfa', '#f59e0b', '#f87171']

// ── Composant ─────────────────────────────────────────────────────────────────

export default function SankeyModal({ year, month, initial, onClose }: SankeyModalProps) {
  const [tab,        setTab]        = useState<'revenus' | 'depenses'>('revenus')
  const [sources,    setSources]    = useState<FlowSource[]>(initSources(initial))
  const [categories, setCategories] = useState<FlowCategory[]>(initCategories(initial))
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const totalIncome   = sources.reduce((s, src) => s + (src.value || 0), 0)
  const totalExpenses = categories.reduce((s, c) => s + (c.value || 0), 0)
  const surplus       = totalIncome - totalExpenses

  // ── Gestion des sources ───────────────────────────────────────────────────

  const addSource = () =>
    setSources(prev => [...prev, { label: '', value: 0, color: SOURCE_COLORS[prev.length % SOURCE_COLORS.length] }])

  const updateSource = (i: number, field: keyof FlowSource, val: string | number) =>
    setSources(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const removeSource = (i: number) =>
    setSources(prev => prev.filter((_, idx) => idx !== i))

  // ── Gestion des catégories ────────────────────────────────────────────────

  const updateCategoryItem = (catIdx: number, itemIdx: number, field: keyof FlowItem, val: string | number) =>
    setCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIdx) return cat
      const items = cat.items.map((item, ii) =>
        ii === itemIdx ? { ...item, [field]: val } : item,
      )
      const value = items.reduce((s, it) => s + (Number(it.value) || 0), 0)
      return { ...cat, items, value }
    }))

  const addItem = (catIdx: number) =>
    setCategories(prev => prev.map((cat, ci) =>
      ci !== catIdx ? cat : { ...cat, items: [...cat.items, { label: '', value: 0 }] },
    ))

  const removeItem = (catIdx: number, itemIdx: number) =>
    setCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIdx) return cat
      const items = cat.items.filter((_, ii) => ii !== itemIdx)
      const value = items.reduce((s, it) => s + (Number(it.value) || 0), 0)
      return { ...cat, items, value }
    }))

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError('')
    if (totalIncome <= 0) { setError('Renseignez au moins un revenu.'); return }

    setSubmitting(true)
    try {
      const key = `${year}-${String(month).padStart(2, '0')}`
      const data: Omit<MonthlyFlow, 'createdAt' | 'updatedAt'> = {
        month,
        year,
        totalIncome,
        sources:    sources.filter(s => s.value > 0),
        categories: categories.filter(c => c.value > 0).map(c => ({
          ...c,
          items: c.items.filter(it => it.value > 0),
        })),
        budgetRules: {
          fixedChargesTarget:  BUDGET.fixedChargesTarget,
          pleasuresTarget:     BUDGET.pleasuresTarget,
          surplusSavingsRatio: BUDGET.surplusSavingsRatio,
          surplusInvestRatio:  BUDGET.surplusInvestRatio,
        },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setDoc(doc(db, 'monthly_flows', key), { ...data, createdAt: (initial as any)?.createdAt ?? serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Erreur Firebase. Vérifiez votre configuration.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  const inputCls = `
    w-full px-3 py-2.5 bg-transparent border text-xs font-mono outline-none transition-colors
  `
  const inputStyle = { borderColor: 'var(--border)', color: 'var(--text)' }
  const focusIn    = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#c9a84c')
  const focusOut   = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--border)')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl border flex flex-col"
        style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)', maxHeight: '90vh' }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase mb-0.5" style={{ color: 'var(--text2)' }}>
              Données Mensuelles
            </p>
            <p className="font-serif text-xl font-light capitalize" style={{ color: 'var(--text)' }}>
              {monthName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none transition-colors"
            style={{ color: 'var(--text2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          {(['revenus', 'depenses'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3.5 text-[10px] tracking-[0.25em] uppercase transition-all"
              style={{
                backgroundColor: tab === t ? 'rgba(201,168,76,0.07)' : 'transparent',
                color:           tab === t ? '#c9a84c'                : 'var(--text2)',
                borderBottom:    tab === t ? '2px solid #c9a84c'      : '2px solid transparent',
              }}
            >
              {t === 'revenus' ? 'Revenus' : 'Dépenses'}
            </button>
          ))}
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── TAB REVENUS ────────────────────────────────────────────── */}
          {tab === 'revenus' && (
            <div className="space-y-3">
              {sources.map((src, i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />

                  <input
                    type="text"
                    value={src.label}
                    onChange={e => updateSource(i, 'label', e.target.value)}
                    placeholder="Source (ex : Salaire)"
                    className={inputCls}
                    style={{ ...inputStyle, flex: 2 }}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                  <input
                    type="number"
                    value={src.value || ''}
                    onChange={e => updateSource(i, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className={inputCls}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                  <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>€</span>
                  {sources.length > 1 && (
                    <button
                      onClick={() => removeSource(i)}
                      className="text-sm flex-shrink-0 transition-colors"
                      style={{ color: 'var(--text3)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e05c5c')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                    >✕</button>
                  )}
                </div>
              ))}

              <button
                onClick={addSource}
                className="text-[10px] tracking-[0.2em] uppercase transition-colors mt-2"
                style={{ color: '#c9a84c' }}
              >
                + Ajouter une source
              </button>
            </div>
          )}

          {/* ── TAB DÉPENSES ──────────────────────────────────────────── */}
          {tab === 'depenses' && (
            <div className="space-y-5">
              {categories.map((cat, ci) => (
                <div key={cat.label}>
                  {/* Header catégorie */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text2)' }}>
                      {cat.label}
                    </span>
                    <span className="ml-auto text-[10px] font-mono" style={{ color: cat.value > 0 ? cat.color : 'var(--text3)' }}>
                      {fmt(cat.value)}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="pl-4 space-y-2">
                    {cat.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.label}
                          onChange={e => updateCategoryItem(ci, ii, 'label', e.target.value)}
                          placeholder="Poste"
                          className={inputCls}
                          style={{ ...inputStyle, flex: 2 }}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                        <input
                          type="number"
                          value={item.value || ''}
                          onChange={e => updateCategoryItem(ci, ii, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          className={inputCls}
                          style={{ ...inputStyle, flex: 1 }}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                        <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>€</span>
                        {cat.items.length > 0 && (
                          <button
                            onClick={() => removeItem(ci, ii)}
                            className="text-sm flex-shrink-0 transition-colors"
                            style={{ color: 'var(--text3)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e05c5c')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                          >✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addItem(ci)}
                      className="text-[9px] tracking-[0.2em] uppercase transition-colors"
                      style={{ color: 'var(--text2)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = cat.color)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
                    >
                      + Ajouter un poste
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — résumé + submit */}
        <div
          className="px-6 py-5 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Résumé budgétaire */}
          <div className="grid grid-cols-3 gap-4 mb-5 text-[10px] font-mono">
            <div>
              <p className="tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text2)' }}>Revenus</p>
              <p style={{ color: '#4caf7d' }}>{fmt(totalIncome)}</p>
            </div>
            <div>
              <p className="tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text2)' }}>Dépenses</p>
              <p style={{ color: '#e05c5c' }}>{fmt(totalExpenses)}</p>
            </div>
            <div>
              <p className="tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text2)' }}>Surplus</p>
              <p style={{ color: surplus >= 0 ? '#c9a84c' : '#e05c5c' }}>{fmt(surplus)}</p>
            </div>
          </div>

          {error && (
            <p className="text-[11px] font-mono mb-4" style={{ color: '#e05c5c' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 text-[10px] tracking-[0.35em] uppercase transition-all duration-300"
            style={{ backgroundColor: submitting ? '#c9a84c88' : '#c9a84c', color: '#0a0a0a' }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer les données'}
          </button>
        </div>
      </div>
    </div>
  )
}
