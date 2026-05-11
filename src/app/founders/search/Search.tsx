'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const FILTERS = [
  { key: 'all', label: 'All Roles', icon: '🌐', color: 'from-teal to-teal-dark' },
  { key: 'founder', label: 'Founders', icon: '🚀', color: 'from-teal to-emerald-500' },
  { key: 'co-founder', label: 'Co-Founders', icon: '🤝', color: 'from-blue-500 to-cyan-500' },
  { key: 'freelancer', label: 'Freelancers', icon: '💻', color: 'from-purple-500 to-pink-500' },
  { key: 'biz-owner', label: 'Biz Owners', icon: '🏢', color: 'from-amber-400 to-orange-500' },
  { key: 'mentor', label: 'Mentors', icon: '📚', color: 'from-rust to-rust-dark' },
]

const SKILL_COLORS = [
  'bg-teal-light text-teal-dark border-teal/20',
  'bg-blue-50 text-blue-600 border-blue-200',
  'bg-purple-50 text-purple-600 border-purple-200',
  'bg-amber-50 text-amber-600 border-amber-200',
  'bg-emerald-50 text-emerald-600 border-emerald-200',
  'bg-rose-50 text-rose-500 border-rose-200',
]

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark',
    'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-purple-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function getRoleBadge(role: string) {
  const badges: Record<string, { emoji: string; bg: string }> = {
    founder: { emoji: '🚀', bg: 'bg-teal-light/60 text-teal-dark border-teal/20' },
    'co-founder': { emoji: '🤝', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
    freelancer: { emoji: '💻', bg: 'bg-purple-50 text-purple-600 border-purple-200' },
    'biz-owner': { emoji: '🏢', bg: 'bg-amber-50 text-amber-600 border-amber-200' },
    mentor: { emoji: '📚', bg: 'bg-rust/10 text-rust border-rust/20' },
    investor: { emoji: '💰', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  }
  return badges[role] || { emoji: '👤', bg: 'bg-cream-dark text-ink-soft border-line' }
}

export default function Search({ initialProfiles, currentUser }: { initialProfiles: any[]; currentUser: any }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [connected, setConnected] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = initialProfiles.filter(p => {
    const matchRole = filter === 'all' || p.role === filter
    const matchQ = !q || [p.full_name, p.company, p.location, p.headline, ...(p.skills || []), ...(p.domains || [])]
      .filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
    return matchRole && matchQ
  })

  const activeFilter = FILTERS.find(f => f.key === filter) || FILTERS[0]

  // Quick search suggestions
  const suggestions = q.length > 0 ? [
    ...new Set(filtered.flatMap(p => p.skills || []).filter(s => s.toLowerCase().includes(q.toLowerCase()))),
    ...new Set(filtered.map(p => p.location).filter(Boolean).filter(l => l?.toLowerCase().includes(q.toLowerCase()))),
  ].slice(0, 5) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50">
      <TopBar title="Discover Network" profile={currentUser} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search Hero */}
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-2">
            Find Your <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">People</span>
          </h2>
          <p className="text-sm text-ink-soft max-w-md mx-auto">
            Connect with founders, mentors, freelancers, and investors across India
          </p>
        </div>

        {/* Search Bar with Suggestions */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 to-rust/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white border-2 border-line/50 rounded-2xl shadow-sm hover:shadow-md focus-within:border-teal focus-within:shadow-lg focus-within:shadow-teal/5 transition-all overflow-hidden">
              <svg className="w-5 h-5 text-muted ml-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by name, skill, location, domain..."
                className="flex-1 px-4 py-4 text-sm outline-none bg-transparent placeholder:text-muted/60"
              />
              {q && (
                <button
                  onClick={() => { setQ(''); searchRef.current?.focus() }}
                  className="mr-2 w-8 h-8 rounded-full bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted hover:text-ink transition-colors"
                >
                  ✕
                </button>
              )}
              <button className="mr-2 px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden z-30 animate-fade-up">
              <div className="px-4 py-3 border-b border-line/20 bg-cream/30">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Suggestions</span>
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => setQ(s || '')}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink-soft hover:bg-cream flex items-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`group px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  filter === f.key
                    ? `bg-gradient-to-r ${f.color} text-cream border-transparent shadow-md`
                    : 'border-line bg-white text-muted hover:border-teal/50 hover:text-ink hover:shadow-sm'
                }`}
              >
                <span className={`${filter === f.key ? '' : 'grayscale'} group-hover:grayscale-0 transition-all`}>
                  {f.icon}
                </span>
                {f.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-line/50 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal text-cream shadow-sm' : 'text-muted hover:text-ink'}`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal text-cream shadow-sm' : 'text-muted hover:text-ink'}`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? 'person' : 'people'} found
            {q && <span className="text-muted"> for &quot;{q}&quot;</span>}
          </div>
          {filtered.length > 0 && (
            <div className="text-xs text-muted">
              Showing {filtered.length} of {initialProfiles.length}
            </div>
          )}
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, idx) => {
              const roleBadge = getRoleBadge(p.role)
              const gradient = getGradient(p.full_name || 'U')
              const isHovered = hoveredProfile === p.id

              return (
                <div
                  key={p.id}
                  className="group bg-white border border-line/50 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onMouseEnter={() => setHoveredProfile(p.id)}
                  onMouseLeave={() => setHoveredProfile(null)}
                >
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>

                  {/* Avatar & Info */}
                  <div className="flex items-start gap-3 mb-3 relative z-10">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-lg font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-transparent group-hover:ring-teal/20 overflow-hidden`}>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(p.full_name)
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-ink truncate group-hover:text-teal transition-colors">
                        {p.full_name}
                      </div>
                      <div className="text-xs text-muted truncate">{p.headline || p.company || 'CoFlare Member'}</div>
                      {p.company && (
                        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {p.company}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border mb-3 self-start relative z-10 ${roleBadge.bg}`}>
                    {roleBadge.emoji} {p.role?.toUpperCase() || 'MEMBER'}
                  </span>

                  {/* Bio */}
                  {p.bio && (
                    <p className={`text-xs text-ink-soft leading-relaxed mb-3 relative z-10 transition-all ${
                      isHovered ? 'line-clamp-none' : 'line-clamp-2'
                    }`}>
                      {p.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {(p.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
                      {p.skills.slice(0, 4).map((s: string, i: number) => (
                        <span
                          key={s}
                          className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all hover:scale-105 cursor-default ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                        >
                          {s}
                        </span>
                      ))}
                      {p.skills.length > 4 && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-cream-dark/50 text-muted">
                          +{p.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Location & Domains */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-muted relative z-10 flex-wrap">
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.location}
                      </span>
                    )}
                    {(p.domains || []).length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {p.domains.slice(0, 2).join(', ')}
                        {p.domains.length > 2 && ` +${p.domains.length - 2}`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto relative z-10">
                    <button
                      onClick={() => setConnected(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        connected[p.id]
                          ? 'bg-teal-light text-teal-dark border-2 border-teal/30'
                          : 'bg-gradient-to-r from-teal to-teal-dark text-cream hover:shadow-lg hover:shadow-teal/20'
                      }`}
                    >
                      {connected[p.id] ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Connected
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Connect
                        </>
                      )}
                    </button>
                    <Link
                      href={`/founders/messaging?to=${p.id}`}
                      className="px-4 py-2.5 border-2 border-line hover:border-teal text-ink-soft hover:text-teal rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 hover:bg-teal/5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filtered.map((p, idx) => {
              const roleBadge = getRoleBadge(p.role)
              const gradient = getGradient(p.full_name || 'U')

              return (
                <div
                  key={p.id}
                  className="group bg-white border border-line/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-sm font-semibold shadow-md shrink-0 overflow-hidden`}>
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(p.full_name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-ink group-hover:text-teal transition-colors">{p.full_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg}`}>
                        {roleBadge.emoji} {p.role?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-muted truncate mt-0.5">
                      {p.headline || p.company}
                      {p.location && <span> · {p.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setConnected(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        connected[p.id]
                          ? 'bg-teal-light text-teal-dark border border-teal/30'
                          : 'bg-teal text-cream hover:bg-teal-dark'
                      }`}
                    >
                      {connected[p.id] ? 'Connected' : 'Connect'}
                    </button>
                    <Link
                      href={`/founders/messaging?to=${p.id}`}
                      className="px-4 py-2 border border-line text-ink-soft rounded-xl text-xs font-semibold hover:border-teal hover:text-teal transition-all"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-2xl text-ink mb-2">No matches found</h3>
            <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
              Try adjusting your search terms or filters to find more people
            </p>
            <button
              onClick={() => { setQ(''); setFilter('all') }}
              className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}