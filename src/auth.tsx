// Email + password sign in / sign up in front of the quiz. Children get the signed-in user id.
import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function AuthGate({ children }: { children: (userId: string) => ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = still checking
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { data, error } = mode === 'in' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) setMsg(error.message)
    else if (mode === 'up' && !data.session) setMsg('Check your email to confirm the account, then sign in.')
  }

  if (session === undefined) return null
  if (session) {
    return (
      <>
        {children(session.user.id)}
        <button onClick={() => supabase.auth.signOut()} className="fixed bottom-2 left-2 z-50 rounded-lg border bg-white/90 px-2 py-1 text-xs text-slate-600 hover:bg-white">
          Sign out · {session.user.email}
        </button>
      </>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-slate-800">Math Workbook</h1>
        <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">{mode === 'in' ? 'Sign in' : 'Create account'}</button>
        <button type="button" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg('') }} className="w-full text-sm text-slate-600 underline">
          {mode === 'in' ? 'No account? Create one' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
