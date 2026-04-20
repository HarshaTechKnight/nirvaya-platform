'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })
      if (result.error) throw result.error
      router.push('/auth/select-role')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Top brand ── */}
      <div className="pt-16 pb-10 text-center">
        <Link href="/" className="inline-block">
          <div className="font-display text-4xl text-teal font-semibold tracking-tight">CoFlare</div>
        </Link>
        <p className="text-ink-soft text-sm mt-1.5">Institutional Curator for High-Growth Ventures</p>
      </div>

      {/* ── Split card ── */}
      <div className="flex-1 flex items-start justify-center px-6">
        <div className="w-full max-w-4xl grid md:grid-cols-[1fr_1fr] rounded-2xl overflow-hidden shadow-2xl shadow-teal/5 border border-line/50">
          {/* Left — form */}
          <div className="bg-white p-10">
            <h1 className="font-display text-3xl text-ink mb-2">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-ink-soft mb-7">
              {isSignUp
                ? 'Join the Andhra Pradesh institutional network.'
                : 'Access your institutional dashboard and venture portfolio.'}
            </p>

            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 border border-line rounded-lg text-sm font-medium text-ink hover:bg-cream transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-21 0-1.3-.2-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.6 7.4 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 46c5.9 0 11-2 14.7-5.4l-6.8-5.6C29.8 36.9 27 38 24 38c-6 0-11.1-4-12.9-9.6l-7 5.4C7.4 41.8 15.1 46 24 46z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.8 5.6C41.5 37.1 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-line/60"/>
              <span className="text-[10px] uppercase tracking-wider text-muted">or continue with email</span>
              <div className="flex-1 h-px bg-line/60"/>
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-2">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@organization.gov.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-teal focus:bg-white transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-ink">
                    Password
                  </label>
                  <button type="button" className="text-[11px] text-teal font-medium hover:text-teal-dark">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 pr-10 text-sm text-ink placeholder:text-muted outline-none focus:border-teal focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rust-soft/50 border border-rust/30 text-rust text-xs p-2.5 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal text-cream font-medium rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in to CoFlare'}
              </button>
            </form>

            <div className="text-center text-sm text-ink-soft mt-6 pt-5 border-t border-line/60">
              {isSignUp ? 'Already a member? ' : 'New to the ecosystem? '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-teal font-medium hover:text-teal-dark">
                {isSignUp ? 'Sign in' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* Right — brand visual */}
          <div className="bg-gradient-to-br from-teal-light via-cream to-cream-dark relative hidden md:flex items-center justify-center p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(15,110,86,0.08) 28px, rgba(15,110,86,0.08) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(15,110,86,0.08) 28px, rgba(15,110,86,0.08) 29px)`
            }}/>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-xl bg-teal/90 text-cream flex items-center justify-center mx-auto mb-5 text-2xl">
                🏛️
              </div>
              <p className="font-display text-xl text-ink leading-tight max-w-[220px]">
                Securing the future of Andhra Pradesh's innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="px-8 py-8 mt-12">
        <div className="flex items-center justify-center gap-8 mb-4">
          <a href="#" className="text-[10px] uppercase tracking-wider text-muted hover:text-teal">Privacy Policy</a>
          <a href="#" className="text-[10px] uppercase tracking-wider text-muted hover:text-teal">Terms of Service</a>
          <a href="#" className="text-[10px] uppercase tracking-wider text-muted hover:text-teal">Support</a>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <div>© 2026 CoFlare Institutional Platform</div>
          <div>Powered by AP Innovation Society</div>
        </div>
      </footer>
    </div>
  )
}