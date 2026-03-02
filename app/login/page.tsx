'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AUTHORIZED_EMAIL } from '@/config/auth'

export default function LoginPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)

      if (result.user.email !== AUTHORIZED_EMAIL) {
        await auth.signOut()
        setError('Accès refusé — ce compte Google n\'est pas autorisé.')
        return
      }

      document.cookie = 'artvault-session=1; path=/; max-age=86400'
      router.replace('/')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoading(false)
        return
      }
      if (code === 'auth/unauthorized-domain') {
        setError('Domaine non autorisé — ajoutez ce domaine dans Firebase Console → Authentication → Authorized domains.')
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In non activé — activez-le dans Firebase Console → Authentication → Sign-in method.')
      } else if (code === 'auth/popup-blocked') {
        setError('Popup bloquée par le navigateur — autorisez les popups pour ce site.')
      } else {
        setError(`Erreur : ${code || (err instanceof Error ? err.message : 'inconnue')}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Radial gradient dorés */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm mx-4 border px-10 py-12 animate-fade-up"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="flex items-baseline justify-center">
            <span
              className="font-serif text-4xl font-light tracking-[0.18em] uppercase"
              style={{ color: '#f0ece4' }}
            >
              Art
            </span>
            <span
              className="font-serif text-4xl font-light tracking-[0.18em] uppercase"
              style={{ color: '#c9a84c' }}
            >
              Vault
            </span>
          </div>
        </div>

        {/* Divider doré */}
        <div className="flex items-center gap-0 mb-8 mt-6">
          <div style={{ width: 80, height: 1, backgroundColor: '#c9a84c' }} />
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Sous-titre */}
        <p
          className="text-center text-[10px] tracking-[0.3em] uppercase mb-10"
          style={{ color: 'rgba(240,236,228,0.4)' }}
        >
          Accès privé — Arthur Arenal
        </p>

        {/* Bouton Google */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 border text-[11px] tracking-[0.2em] uppercase transition-all duration-300"
          style={{
            backgroundColor: '#1a1a1a',
            borderColor:     loading ? 'rgba(255,255,255,0.07)' : 'rgba(201,168,76,0.35)',
            color:           loading ? 'rgba(240,236,228,0.3)' : '#f0ece4',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.borderColor     = '#c9a84c'
              e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.06)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor     = 'rgba(201,168,76,0.35)'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }}
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin" style={{ color: '#c9a84c' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            /* Google "G" SVG */
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {loading ? 'Connexion...' : 'Continuer avec Google'}
        </button>

        {/* Erreur */}
        {error && (
          <p
            className="mt-5 text-center text-[11px] font-mono leading-relaxed"
            style={{ color: '#e05c5c' }}
          >
            {error}
          </p>
        )}

        {/* Footer note */}
        <p
          className="mt-10 text-center text-[9px] tracking-[0.25em] uppercase"
          style={{ color: 'rgba(240,236,228,0.15)' }}
        >
          Application personnelle et privée
        </p>
      </div>
    </div>
  )
}
