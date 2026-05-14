'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const FILTERS = [
  { key: 'all', label: 'All', icon: '🌐', color: 'from-teal to-teal-dark' },
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
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600',
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [animateCard, setAnimateCard] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = initialProfiles.filter(p => {
    const matchRole = filter === 'all' || p.role === filter
    const matchQ = !q || [p.full_name, p.company, p.location, p.headline, ...(p.skills || []), ...(p.domains || [])]
      .filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
    return matchRole && matchQ
  })

  const suggestions = q.length > 0 ? [
    ...new Set(filtered.flatMap(p => p.skills || []).filter(s => s.toLowerCase().includes(q.toLowerCase()))),
    ...new Set(filtered.map(p => p.location).filter(Boolean).filter(l => l?.toLowerCase().includes(q.toLowerCase()))),
  ].slice(0, 5) : []

  const messagingPath = currentUser?.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging'

  const handleConnect = (id: string) => {
    setConnected(prev => ({ ...prev, [id]: !prev[id] }))
    setAnimateCard(id)
    setTimeout(() => setAnimateCard(null), 300)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-cream via-white to-cream/50">
      <TopBar title="Discover" profile={currentUser} />
      
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Hero */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ink mb-1 sm:mb-2">
            Find Your <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">People</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
            Connect with founders, mentors, freelancers, and investors across India
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="relative flex items-center bg-white border-2 border-line/50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md focus-within:border-teal focus-within:shadow-lg transition-all overflow-hidden">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted ml-3 sm:ml-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={searchRef} value={q} onChange={e => setQ(e.target.value)}
              onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by name, skill, location..."
              className="flex-1 px-3 sm:px-4 py-3 sm:py-4 text-sm outline-none bg-transparent placeholder:text-muted/60" />
            {q && (
              <button onClick={() => { setQ(''); searchRef.current?.focus() }}
                className="mr-1 sm:mr-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/10 hover:bg-muted/20 flex items-center justify-center text-muted transition-colors text-xs">✕</button>
            )}
            <button className="mr-1.5 sm:mr-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all hidden sm:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span>Search</span>
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden z-30 mx-2 sm:mx-0">
              <div className="px-4 py-2.5 sm:py-3 border-b border-line/20 bg-cream/30">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Suggestions</span>
              </div>
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => setQ(s || '')}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-ink-soft hover:bg-cream flex items-center gap-3 transition-colors">
                  <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`group px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all border flex items-center gap-1 sm:gap-1.5 ${
                  filter === f.key
                    ? `bg-gradient-to-r ${f.color} text-cream border-transparent shadow-md`
                    : 'border-line bg-white text-muted hover:border-teal/50 hover:text-ink hover:shadow-sm'
                }`}>
                <span className={filter === f.key ? '' : 'grayscale'}>{f.icon}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-line/50 rounded-lg sm:rounded-xl p-1 shadow-sm">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal text-cream shadow-sm' : 'text-muted hover:text-ink'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal text-cream shadow-sm' : 'text-muted hover:text-ink'}`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
          <div className="text-xs sm:text-sm text-ink-soft">
            <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? 'person' : 'people'} found
            {q && <span className="text-muted"> for &quot;{q}&quot;</span>}
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-2 sm:space-y-3">
            {filtered.map((p, index) => {
              const roleBadge = getRoleBadge(p.role)
              const gradient = getGradient(p.full_name || 'U')
              const isConnected = connected[p.id]
              return (
                <div key={p.id} className="group bg-white border border-line/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-sm sm:text-lg font-bold shadow-md overflow-hidden shrink-0`}>
                        {p.avatar_url ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" /> : getInitials(p.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-ink truncate max-w-[120px] sm:max-w-[200px]">{p.full_name}</span>
                          <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${roleBadge.bg}`}>{roleBadge.emoji} {p.role?.toUpperCase()}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted truncate mt-0.5">{p.headline || p.company}{p.location && <span> · {p.location}</span>}</div>
                        {(p.skills || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                            {p.skills.slice(0, 3).map((s: string, i: number) => (
                              <span key={s} className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full border font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 shrink-0">
                      <button onClick={() => handleConnect(p.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                          isConnected ? 'bg-teal-light text-teal-dark border border-teal/30' : 'bg-teal text-cream hover:bg-teal-dark'
                        }`}>
                        {isConnected ? '✓ Connected' : '+ Connect'}
                      </button>
                      <Link href={`${messagingPath}?to=${p.id}`}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-line text-ink-soft rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold hover:border-teal hover:text-teal transition-all flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((p) => {
              const roleBadge = getRoleBadge(p.role)
              const gradient = getGradient(p.full_name || 'U')
              const isConnected = connected[p.id]
              return (
                <div key={p.id} className="group bg-white border border-line/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-sm sm:text-lg font-bold shadow-md overflow-hidden shrink-0`}>
                      {p.avatar_url ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" /> : getInitials(p.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs sm:text-sm text-ink truncate">{p.full_name}</div>
                      <div className="text-[10px] sm:text-xs text-muted truncate">{p.headline || p.company}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border mb-2.5 sm:mb-3 self-start ${roleBadge.bg}`}>{roleBadge.emoji} {p.role?.toUpperCase()}</span>
                  {(p.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                      {p.skills.slice(0, 3).map((s: string, i: number) => (
                        <span key={s} className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full border font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{s}</span>
                      ))}
                    </div>
                  )}
                  {p.location && (
                    <div className="flex items-center gap-1 mb-3 sm:mb-4 text-[10px] sm:text-xs text-muted">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {p.location}
                    </div>
                  )}
                  <div className="flex gap-1.5 sm:gap-2 mt-auto">
                    <button onClick={() => handleConnect(p.id)}
                      className={`flex-1 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                        isConnected ? 'bg-teal-light text-teal-dark border border-teal/30' : 'bg-teal text-cream hover:bg-teal-dark'
                      }`}>
                      {isConnected ? '✓ Connected' : '+ Connect'}
                    </button>
                    <Link href={`${messagingPath}?to=${p.id}`}
                      className="px-2.5 sm:px-4 py-2 border border-line text-ink-soft rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold hover:border-teal hover:text-teal transition-all flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="font-display text-xl sm:text-2xl text-ink mb-1 sm:mb-2">No matches found</h3>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-6 max-w-sm mx-auto px-4">Try adjusting your search terms or filters</p>
            <button onClick={() => { setQ(''); setFilter('all') }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}