'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const FILTERS = [
  { key: 'all', label: 'All Roles' },
  { key: 'founder', label: 'Founders' },
  { key: 'co-founder', label: 'Co-Founders' },
  { key: 'freelancer', label: 'Freelancers' },
  { key: 'biz-owner', label: 'Business Owners' },
  { key: 'mentor', label: 'Mentors' },
]

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Search({ initialProfiles, currentUser }: { initialProfiles: any[]; currentUser: any }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [connected, setConnected] = useState<Record<string, boolean>>({})

  const filtered = initialProfiles.filter(p => {
    const matchRole = filter === 'all' || p.role === filter
    const matchQ = !q || [p.full_name, p.company, p.location, ...(p.skills || []), ...(p.domains || [])]
      .filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
    return matchRole && matchQ
  })

  return (
    <>
      <TopBar title="Search Network" profile={currentUser}/>
      <div className="p-8 max-w-5xl mx-auto">

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, domain, skill, location..."
          className="w-full bg-white border border-line rounded-xl px-5 py-3 text-sm outline-none focus:border-teal mb-4 shadow-sm"
        />

        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f.key
                  ? 'border-teal text-teal bg-teal-light/40'
                  : 'border-line text-muted hover:border-teal/50 bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-dark text-cream flex items-center justify-center text-sm font-semibold shrink-0">
                  {getInitials(p.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-ink truncate">{p.full_name}</div>
                  <div className="text-xs text-muted truncate">{p.headline || p.company}</div>
                </div>
              </div>
              <span className="inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark mb-3 self-start">
                {(p.role || '').toUpperCase()}
              </span>
              {p.bio && (
                <p className="text-xs text-ink-soft leading-relaxed line-clamp-2 mb-3">{p.bio}</p>
              )}
              {(p.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {p.skills.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[10px] bg-cream border border-line px-2 py-0.5 rounded text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {p.location && (
                <div className="text-xs text-muted mb-3">{p.location}</div>
              )}

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setConnected(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    connected[p.id]
                      ? 'bg-teal-light text-teal-dark border border-teal'
                      : 'bg-teal text-cream hover:bg-teal-dark'
                  }`}
                >
                  {connected[p.id] ? 'Connected' : 'Connect'}
                </button>
                <Link
                  href={`/founders/messaging?to=${p.id}`}
                  className="px-3 py-2 border border-teal text-teal rounded-lg text-xs font-medium hover:bg-teal-light text-center transition-colors"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted text-sm">
              No matches found. Try different filters.
            </div>
          )}
        </div>
      </div>
    </>
  )
}