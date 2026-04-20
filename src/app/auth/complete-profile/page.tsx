'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DOMAINS = ['Fintech', 'Edtech', 'Agritech', 'Healthtech', 'E-commerce', 'Logistics', 'SaaS', 'Deep Tech', 'Clean Energy', 'Maritime Tech', 'Other']

export default function CompleteProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    full_name: '',
    headline: '',
    bio: '',
    company: '',
    location: '',
    domain: '',
    linkedin_url: '',
    skills: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const savedRole = localStorage.getItem('selected_role') ?? 'founder'

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email ?? '',
          full_name: form.full_name,
          headline: form.headline,
          bio: form.bio,
          company: form.company,
          location: form.location,
          domains: form.domain ? [form.domain] : [],
          linkedin_url: form.linkedin_url,
          skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
          is_profile_complete: true,
          role: savedRole,
        } as any)

      if (upsertError) {
        setError(upsertError.message)
        setLoading(false)
        return
      }

      localStorage.removeItem('selected_role')
      router.push('/profile')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-line/50 rounded-2xl p-10 shadow-xl shadow-teal/5">
        <div className="text-[10px] uppercase tracking-wider text-teal font-semibold mb-2">
          Step 2 of 2
        </div>
        <h1 className="font-display text-3xl text-ink mb-2">Complete your profile</h1>
        <p className="text-sm text-ink-soft mb-7">
          This is how the CoFlare network will see you.
        </p>

        {error && (
          <div className="bg-rust-soft/50 border border-rust/30 text-rust text-xs p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              Full Name *
            </label>
            <input
              required
              placeholder="Sai Kiran Vardhan"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              Headline
            </label>
            <input
              placeholder="Founder &amp; CEO at VizagEdge Technologies"
              value={form.headline}
              onChange={e => setForm({ ...form, headline: e.target.value })}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              Executive Summary
            </label>
            <textarea
              placeholder="Driving the next generation of maritime logistics from the heart of Visakhapatnam..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
                Company
              </label>
              <input
                placeholder="VizagEdge Technologies"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
                Location
              </label>
              <input
                placeholder="Visakhapatnam, AP"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              Domain
            </label>
            <select
              value={form.domain}
              onChange={e => setForm({ ...form, domain: e.target.value })}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
            >
              <option value="">Select domain</option>
              {DOMAINS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              Skills &amp; Competencies
            </label>
            <input
              placeholder="Strategic Planning, Fundraising, Python, Cloud Architecture"
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
            />
            <p className="text-[11px] text-muted mt-1.5">Comma separated</p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">
              LinkedIn URL
            </label>
            <input
              placeholder="https://linkedin.com/in/you"
              value={form.linkedin_url}
              onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
              className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.full_name.trim()}
            className="w-full py-3 bg-teal text-cream font-medium rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? 'Saving...' : 'Enter CoFlare →'}
          </button>
        </form>
      </div>
    </div>
  )
}