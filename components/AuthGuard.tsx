'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AUTHORIZED_EMAIL } from '@/config/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router   = useRouter()
  const [status, setStatus] = useState<'checking' | 'authorized'>('checking')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user || user.email !== AUTHORIZED_EMAIL) {
        // Efface le cookie session et redirige
        document.cookie = 'artvault-session=; path=/; max-age=0'
        router.replace('/login')
      } else {
        // Renouvelle le cookie
        document.cookie = 'artvault-session=1; path=/; max-age=86400'
        setStatus('authorized')
      }
    })
    return () => unsub()
  }, [router])

  if (status === 'checking') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg, #0a0a0a)' }}
      >
        <div
          className="flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase"
          style={{ color: 'var(--text2, rgba(240,236,228,0.4))' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Vérification en cours
        </div>
      </div>
    )
  }

  return <>{children}</>
}
