'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Step = 'method' | 'email-input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('method')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleGoogle() {
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  async function handleSendMagicLink() {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    setError('')

    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
        shouldCreateUser: true,
      },
    })

    if (linkError) {
      setError(linkError.message)
    } else {
      setInfo('Magic link sent! Check your inbox at ' + email)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-cream overflow-hidden">

      {/* ─── LEFT — ANIMATED VISUAL PANEL ─── */}
      <div className="hidden lg:flex flex-1 relative bg-ink overflow-hidden">

        {/* Background gradient layers */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 30%, #1a3d33 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #0f6e56 0%, transparent 60%)',
          }}
        />

        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Pulse rings - center decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal animate-pulse-ring" />
          <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal animate-pulse-ring delay-1000" />
        </div>

        {/* Floating image cards */}
        <div className="absolute top-[15%] left-[10%] animate-float-slow">
          <div className="w-44 rounded-2xl overflow-hidden shadow-2xl bg-white">
            <img
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&auto=format&fit=crop"
              alt=""
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-teal font-semibold">Founder</div>
              <div className="text-xs font-semibold text-ink mt-0.5">Priya Reddy</div>
              <div className="text-[10px] text-muted">AgriPulse · Vizag</div>
            </div>
          </div>
        </div>

        <div className="absolute top-[25%] right-[10%] animate-float-medium">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 w-52">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full bg-rust text-cream flex items-center justify-center text-xs font-semibold">RI</div>
              <div>
                <div className="text-xs font-semibold text-ink">Rajesh Iyer</div>
                <div className="text-[10px] text-muted">Verified Mentor</div>
              </div>
            </div>
            <div className="text-[10px] text-ink-soft border-t border-line/40 pt-2">
              15 years in fintech operations
            </div>
          </div>
        </div>

        <div className="absolute bottom-[20%] left-[15%] animate-float-fast">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 w-48">
            <div className="text-xs font-semibold text-ink mb-1">15L Seed Grant</div>
            <div className="text-[10px] text-muted mb-2">Disbursed via CoFlare</div>
            <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full"
                style={{
                  width: '75%',
                  backgroundImage: 'linear-gradient(90deg, #0f6e56 0%, #d4e8e0 50%, #0f6e56 100%)',
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 3s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-[30%] right-[18%] animate-float-slow delay-300">
          <div className="w-36 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&auto=format&fit=crop"
              alt=""
              className="w-full h-44 object-cover"
            />
          </div>
        </div>

        <div className="absolute top-[45%] left-[35%] animate-float-medium delay-500">
          <div className="bg-teal text-cream rounded-2xl shadow-2xl p-4 w-44">
            <div className="text-[10px] uppercase tracking-wider text-cream/70 font-semibold mb-1">Match Found</div>
            <div className="text-sm font-semibold">Co-founder match</div>
            <div className="text-[10px] text-cream/80 mt-1">Both targeting fintech in tier-2 cities</div>
          </div>
        </div>

        {/* Orbiting dot decorations */}
        <div className="absolute top-1/2 left-1/2 w-1 h-1 pointer-events-none">
          <div className="absolute inset-0">
            <div className="w-3 h-3 rounded-full bg-teal animate-orbit" />
          </div>
        </div>

        {/* Content overlay - branding */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Top - logo */}
          <div className="animate-fade-up">
            <Link href="/" className="font-display text-3xl text-cream font-semibold tracking-tight">
              CoFlare
            </Link>
            <div className="text-xs uppercase tracking-[0.3em] text-cream/50 font-semibold mt-2">
              India Startup Network
            </div>
          </div>

          {/* Bottom - tagline + stats */}
          <div className="animate-fade-up delay-300">
            <div className="bg-ink/40 backdrop-blur border border-cream/10 rounded-2xl p-6 max-w-md">
              <h2 className="font-display text-3xl text-cream leading-tight mb-3">
                Where Indian startups find their people.
              </h2>
              <p className="text-sm text-cream/70 leading-relaxed mb-5">
                2,400 plus founders, mentors, and investors collaborating across 28 states.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cream/10">
                <div>
                  <div className="font-display text-xl text-teal">2.4k</div>
                  <div className="text-[10px] uppercase tracking-wider text-cream/50">Founders</div>
                </div>
                <div>
                  <div className="font-display text-xl text-teal">480</div>
                  <div className="text-[10px] uppercase tracking-wider text-cream/50">Mentors</div>
                </div>
                <div>
                  <div className="font-display text-xl text-teal">120</div>
                  <div className="text-[10px] uppercase tracking-wider text-cream/50">Investors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </div>

      {/* ─── RIGHT — FORM PANEL ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">

        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15, 110, 86, 0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="w-full max-w-md relative">

          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden text-center mb-8 animate-fade-up">
            <Link href="/" className="inline-block font-display text-3xl text-teal font-semibold tracking-tight">
              CoFlare
            </Link>
          </div>

          {/* STEP: METHOD SELECTION */}
          {step === 'method' && (
            <div className="animate-fade-up">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-teal-light/50 border border-teal/20 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  <span className="text-[11px] text-teal font-semibold">Welcome back</span>
                </div>
                <h2 className="font-display text-4xl text-ink mb-3 leading-tight">
                  Sign in to your account
                </h2>
                <p className="text-sm text-ink-soft">
                  Continue building India startup future with CoFlare.
                </p>
              </div>

              {error && (
                <div className="bg-rust-soft border border-rust/30 text-rust text-sm p-3 rounded-xl mb-4 animate-fade-up">
                  {error}
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 bg-white border-2 border-line rounded-xl px-6 py-4 text-sm font-medium text-ink hover:border-teal hover:shadow-lg disabled:opacity-50 transition-all duration-200 mb-3"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">or</span>
                <div className="flex-1 h-px bg-line" />
              </div>

              {/* Email button */}
              <button
                onClick={() => { setStep('email-input'); setError(''); setInfo('') }}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 bg-teal text-cream rounded-xl px-6 py-4 text-sm font-medium hover:bg-teal-dark hover:shadow-lg hover:shadow-teal/30 disabled:opacity-50 transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continue with Email
              </button>

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-line/50">
                <div className="flex items-center justify-center gap-6 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    <span>Secure OAuth</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    <span>No spam</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    <span>Free forever</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted text-center mt-8 leading-relaxed">
                By continuing, you agree to CoFlare Terms of Service and acknowledge the Privacy Policy.
              </p>
            </div>
          )}

          {/* STEP: EMAIL INPUT - MAGIC LINK */}
          {step === 'email-input' && (
            <div className="animate-fade-up">
              <button
                onClick={() => { setStep('method'); setError(''); setInfo('') }}
                className="text-xs text-muted hover:text-teal mb-6 flex items-center gap-1.5 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Back to sign in options
              </button>

              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-light flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-display text-4xl text-ink mb-3 leading-tight">
                  Sign in with email
                </h2>
                <p className="text-sm text-ink-soft">
                  Enter your email and we'll send you a magic link to sign in instantly.
                </p>
              </div>

              {error && (
                <div className="bg-rust-soft border border-rust/30 text-rust text-sm p-3 rounded-xl mb-4 animate-fade-up">
                  {error}
                </div>
              )}

              {info && (
                <div className="bg-teal-light border border-teal/30 text-teal-dark text-sm p-4 rounded-xl mb-4 animate-fade-up flex items-start gap-3">
                  <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{info}</span>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-2">
                  Email Address
                </label>
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMagicLink()}
                  placeholder="you@example.com"
                  className="w-full bg-white border-2 border-line rounded-xl px-5 py-4 text-base outline-none focus:border-teal focus:shadow-lg focus:shadow-teal/10 transition-all"
                />
              </div>

              <button
                onClick={handleSendMagicLink}
                disabled={loading || !email.trim()}
                className="w-full bg-teal text-cream rounded-xl px-6 py-4 text-sm font-medium hover:bg-teal-dark hover:shadow-lg hover:shadow-teal/30 disabled:opacity-40 transition-all duration-200 mb-3"
              >
                {loading ? 'Sending magic link...' : 'Send magic link'}
              </button>

              <p className="text-xs text-muted text-center">
                We'll email you a magic link for password-free sign in.
              </p>
            </div>
          )}

          {/* Bottom link */}
          {step === 'method' && (
            <div className="mt-8 text-center">
              <span className="text-sm text-ink-soft">New to CoFlare? </span>
              <span className="text-sm text-teal font-medium">
                Just sign in. We'll set you up.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}