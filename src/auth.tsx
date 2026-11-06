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

  const google = async () => {
    setMsg('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } })
    if (error) setMsg(error.message)
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
        <button type="button" onClick={google} className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white py-2 font-semibold text-slate-700 hover:bg-slate-50">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </button>
        <p className="text-center text-xs text-slate-400">or</p>
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
