'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROLES = [
  { key: 'founder', icon: '🚀', name: 'Founder', desc: 'Building an early-stage startup', tag: 'FOUNDER' },
  { key: 'co-founder', icon: '🤝', name: 'Co-Founder', desc: 'Joining a startup as a partner', tag: 'CO-FOUNDER' },
  { key: 'freelancer', icon: '💻', name: 'Freelancer', desc: 'Offering skills to AP startups', tag: 'FREELANCER' },
  { key: 'biz-owner', icon: '🏢', name: 'Business Owner', desc: 'Scaling an existing business', tag: 'BIZ OWNER' },
  { key: 'mentor', icon: '🎓', name: 'Mentor', desc: 'Guiding founders with expertise', tag: 'MENTOR' },
  { key: 'investor', icon: '💰', name: 'Investor', desc: 'Funding vetted AP startups', tag: 'INVESTOR' },
]

export default function SelectRolePage() {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      localStorage.setItem('selected_role', selected)
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email ?? '',
        role: selected,
        is_profile_complete: false,
      } as any)
    }
    router.push('/auth/complete-profile')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="font-display text-3xl text-teal font-semibold mb-1">CoFlare</div>
      <p className="text-xs uppercase tracking-wider text-muted mb-10">Institutional Curator</p>

      <div className="w-full max-w-2xl bg-white border border-line/50 rounded-2xl p-10 shadow-xl shadow-teal/5">
        <h1 className="font-display text-3xl text-ink mb-2">Select your role</h1>
        <p className="text-sm text-ink-soft mb-7">
          This determines your portal access and ecosystem connections.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-7">
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                selected === r.key
                  ? 'border-teal bg-teal-light/40'
                  : 'border-line hover:border-teal/50 bg-cream/30'
              }`}
            >
              <div className="text-xl mb-3">{r.icon}</div>
              <div className="font-display text-base text-ink mb-1">{r.name}</div>
              <div className="text-xs text-ink-soft leading-relaxed mb-3">{r.desc}</div>
              <span className={`inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${
                selected === r.key ? 'bg-teal text-cream' : 'bg-cream-dark text-ink-soft'
              }`}>
                {r.tag}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full py-3 bg-teal text-cream font-medium rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-40"
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}