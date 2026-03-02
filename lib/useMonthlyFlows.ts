'use client'

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { MonthlyFlow } from '@/types/finance'

export function useMonthlyFlow(year: number, month: number) {
  const [flow,      setFlow]    = useState<MonthlyFlow | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const key = `${year}-${String(month).padStart(2, '0')}`
    const ref = doc(db, 'monthly_flows', key)
    const unsub = onSnapshot(
      ref,
      snap => {
        setFlow(snap.exists() ? (snap.data() as MonthlyFlow) : null)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [year, month])

  return { flow, isLoading }
}
