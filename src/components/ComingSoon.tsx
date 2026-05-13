'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ComingSoon({
  portalName,
  description,
  launchDate,
  currentUser,
}: {
  portalName: string
  description: string
  launchDate: string
  currentUser?: any
}) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState(currentUser?.email || '')
  const [notified, setNotified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleNotifyMe() {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    setLoading(true)
    setError('')

    // Save to waitlist (use investor_waitlist table or new one)
    const { error: insertError } = await supabase
      .from('investor_waitlist')
      .insert({
        email: email.trim(),
        portal: portalName.toLowerCase(),
      } as any)

    if (insertError && !insertError.message.includes('duplicate')) {
      setError('Could not save. Try again.')
    } else {
      setNotified(true)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function goToFounders() {
    router.push('/founders/feed')
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">

      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, #d4e8e0 0%, transparent 50%), radial-gradient(ellipse at bottom right, #fde4d3 0%, transparent 60%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* HEADER */}
      <header className="relative z-10 px-6 lg:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-teal font-semibold tracking-tight">
          CoFlare
        </Link>

        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              <span className="text-sm text-ink-soft hidden sm:block">
                Hi, {currentUser.full_name?.split(' ')[0] || 'there'}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs text-muted hover:text-rust px-3 py-2"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-12 lg:py-20">

        {/* Coming Soon Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-light/50 border border-teal/30 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-teal font-bold">Coming Soon</span>
          </div>
        </div>

        {/* Big Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.05] mb-5">
            {portalName} Portal
          </h1>
          <div className="font-display text-2xl lg:text-3xl text-teal mb-6">
            is on the way.
          </div>
          <p className="text-base lg:text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Launch info */}
        <div className="bg-white border border-line/50 rounded-2xl p-8 lg:p-10 shadow-sm mb-8">

          {/* Launch date */}
          <div className="text-center mb-8 pb-8 border-b border-line/40">
            <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">
              Expected Launch
            </div>
            <div className="font-display text-3xl text-ink">{launchDate}</div>
          </div>

          {/* Notify me form */}
          {!notified ? (
            <div>
              <div className="text-center mb-5">
                <h3 className="font-display text-xl text-ink mb-1">Get notified at launch</h3>
                <p className="text-sm text-ink-soft">Be first to access when we go live</p>
              </div>

              {error && (
                <div className="bg-rust-soft border border-rust/30 text-rust text-sm p-3 rounded-lg mb-3 text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNotifyMe()}
                  placeholder="you@example.com"
                  className="flex-1 bg-cream border-2 border-line rounded-xl px-5 py-3 text-sm outline-none focus:border-teal transition-colors"
                />
                <button
                  onClick={handleNotifyMe}
                  disabled={loading}
                  className="bg-teal text-cream px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Notify Me'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-teal-light flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-ink mb-1">You are on the list!</h3>
              <p className="text-sm text-ink-soft">We will email you the moment we launch.</p>
            </div>
          )}
        </div>

        {/* What to expect */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { title: 'Early Access', desc: 'First 100 signups get free premium for 6 months.' },
            { title: 'Verified Network', desc: 'Institutional verification for all members.' },
            { title: 'India-wide', desc: 'Built for founders, mentors, investors across all states.' },
          ].map(item => (
            <div key={item.title} className="bg-white/60 backdrop-blur border border-line/40 rounded-xl p-5">
              <div className="font-display text-base text-ink mb-1.5">{item.title}</div>
              <div className="text-xs text-ink-soft leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Alternative action */}
        <div className="text-center">
          <p className="text-sm text-ink-soft mb-4">
            In the meantime, explore the Founders Portal
          </p>
          <button
            onClick={goToFounders}
            className="inline-flex items-center gap-2 bg-white border-2 border-teal text-teal px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal hover:text-cream transition-colors"
          >
            Go to Founders Portal
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 mt-20 border-t border-line/40 py-6 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div>2026 CoFlare. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="mailto:hello@coflare.in" className="hover:text-teal">Contact</a>
            <Link href="/" className="hover:text-teal">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}