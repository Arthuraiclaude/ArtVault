'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Category = 'liquidites' | 'investissements' | 'actifs'

interface AddAssetModalProps {
  onClose: () => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'liquidites',     label: 'Liquidités'      },
  { value: 'investissements',label: 'Investissements' },
  { value: 'actifs',         label: 'Actifs'          },
]

export default function AddAssetModal({ onClose }: AddAssetModalProps) {
  const [name,        setName]        = useState('')
  const [category,   setCategory]    = useState<Category>('liquidites')
  const [amount,     setAmount]      = useState('')
  const [currency,   setCurrency]    = useState('EUR')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error,      setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) return

    setSubmitting(true)
    setError('')

    try {
      await addDoc(collection(db, 'assets'), {
        name:     name.trim(),
        category,
        amount:   parseFloat(amount),
        currency,
        createdAt: serverTimestamp(),
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError('Erreur Firebase. Vérifiez votre configuration dans .env.local.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-md border p-8"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {/* Titre */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Nouvel Actif
          </p>
          <button
            onClick={onClose}
            className="text-lg leading-none transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex : Livret A — Société Générale"
              required
              className="w-full px-4 py-3 bg-transparent border text-sm font-mono outline-none transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
              Catégorie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className="py-2.5 text-[10px] tracking-wider border transition-all duration-200"
                  style={{
                    backgroundColor: category === cat.value ? '#c9a84c'         : 'transparent',
                    color:           category === cat.value ? '#0a0a0a'         : 'var(--text-muted)',
                    borderColor:     category === cat.value ? '#c9a84c'         : 'var(--border)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Montant + devise */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Montant
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-transparent border text-sm font-mono outline-none transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="w-24">
              <label className="block text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Devise
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-3 border text-sm font-mono outline-none"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-[10px] tracking-[0.35em] uppercase transition-all duration-300"
            style={{
              backgroundColor: isSubmitting ? '#c9a84c88' : '#c9a84c',
              color: '#0a0a0a',
            }}
          >
            {isSubmitting ? 'Enregistrement...' : '+ Ajouter l\'actif'}
          </button>
        </form>
      </div>
    </div>
  )
}
