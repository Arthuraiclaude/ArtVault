'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Asset } from '@/types/finance'

export function useAssets() {
  const [assets,    setAssets]  = useState<Asset[]>([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'assets'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      snap => {
        setAssets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const totals = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + a.amount
    return acc
  }, {})

  const netTotal =
    (totals.liquidites ?? 0) +
    (totals.investissements ?? 0) +
    (totals.actifs ?? 0)

  return { assets, totals, netTotal, isLoading }
}
