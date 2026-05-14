'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const FILTERS = [
  { key: 'all', label: 'All', icon: '🌐', color: 'bg-gradient-to-r from-teal to-teal-dark' },
  { key: 'founder', label: 'Founders', icon: '🚀', color: 'bg-gradient-to-r from-teal to-emerald-500' },
  { key: 'co-founder', label: 'Co-Founders', icon: '🤝', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { key: 'freelancer', label: 'Freelancers', icon: '💻', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { key: 'biz-owner', label: 'Biz Owners', icon: '🏢', color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
  { key: 'mentor', label: 'Mentors', icon: '📚', color: 'bg-gradient-to-r from-rust to-rust-dark' },
]

const SKILL_COLORS = [
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-rose-50 text-rose-700 border-rose-200',
]

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal-400 to-teal-600', 'from-rust-400 to-rust-600',
    'from-purple-400 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function getRoleBadge(role: string) {
  const badges: Record<string, { emoji: string; bg: string; text: string }> = {
    founder: { emoji: '🚀', bg: 'bg-teal-100', text: 'text-teal-700' },
    'co-founder': { emoji: '🤝', bg: 'bg-blue-100', text: 'text-blue-700' },
    freelancer: { emoji: '💻', bg: 'bg-purple-100', text: 'text-purple-700' },
    'biz-owner': { emoji: '🏢', bg: 'bg-amber-100', text: 'text-amber-700' },
    mentor: { emoji: '📚', bg: 'bg-rust-100', text: 'text-rust-700' },
    investor: { emoji: '💰', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  }
  return badges[role] || { emoji: '👤', bg: 'bg-gray-100', text: 'text-gray-700' }
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <TopBar title="Discover" profile={currentUser} />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Section - Creative */}
        <div className="relative mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm mb-4">
              <span className="text-2xl">✨</span>
              <span className="text-sm font-medium text-gray-600">Discover Your Network</span>
            </div>
            <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
              Find Your{' '}
              <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                Tribe
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
              Connect with visionary founders, expert mentors, and talented professionals across India
            </p>
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="relative max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="relative group">
            <div className="relative flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl focus-within:border-teal-400 focus-within:shadow-teal-100 transition-all duration-300 overflow-hidden">
              <div className="absolute left-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                ref={searchRef} 
                value={q} 
                onChange={e => setQ(e.target.value)}
                onFocus={() => setShowSuggestions(true)} 
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by name, skills, location..."
                className="w-full pl-12 pr-24 py-4 text-base outline-none bg-transparent placeholder:text-gray-400"
              />
              {q && (
                <button 
                  onClick={() => { setQ(''); searchRef.current?.focus() }}
                  className="absolute right-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  ✕
                </button>
              )}
              <button className="absolute right-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-30">
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <span className="text-xs uppercase tracking-wider text-teal-600 font-semibold">✨ Suggestions</span>
              </div>
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onMouseDown={() => setQ(s || '')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent flex items-center gap-3 transition-all duration-200"
                >
                  <span className="text-teal-500">🔍</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters - Creative Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button 
                key={f.key} 
                onClick={() => setFilter(f.key)}
                className={`group px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  filter === f.key
                    ? `${f.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                }`}
              >
                <span className="text-base">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{filtered.length}</span>
            </div>
            <span className="text-sm text-gray-600">
              {filtered.length} {filtered.length === 1 ? 'professional' : 'professionals'} found
              {q && <span className="text-teal-600"> for "{q}"</span>}
            </span>
          </div>
          {filtered.length > 0 && (
            <div className="text-xs text-gray-400">Showing all {filtered.length} results</div>
          )}
        </div>

        {/* Content Section - No Overflow Guaranteed */}
        <div className="overflow-visible">
          {/* LIST VIEW - Optimized for no overflow */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filtered.map((p, index) => {
                const roleBadge = getRoleBadge(p.role)
                const gradient = getGradient(p.full_name || 'U')
                const isConnected = connected[p.id]
                const isAnimating = animateCard === p.id
                
                return (
                  <div 
                    key={p.id}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                      isAnimating ? 'scale-95 opacity-50' : 'scale-100'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-4 sm:flex-1">
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden`}>
                              {p.avatar_url ? (
                                <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                              ) : (
                                getInitials(p.full_name)
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-lg text-gray-900">{p.full_name}</h3>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                                {roleBadge.emoji} {p.role?.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{p.headline || p.company || 'CoFlare Member'}</p>
                            {p.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {p.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:flex-col sm:justify-center">
                          <button 
                            onClick={() => handleConnect(p.id)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-w-[120px] ${
                              isConnected 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:shadow-lg hover:scale-105'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Connected
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Connect
                              </>
                            )}
                          </button>
                          <Link 
                            href={`${messagingPath}?to=${p.id}`}
                            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-teal-400 text-gray-700 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Message
                          </Link>
                        </div>
                      </div>

                      {/* Skills Section */}
                      {(p.skills || []).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {p.skills.slice(0, 5).map((s: string, i: number) => (
                              <span key={s} className={`text-xs px-3 py-1 rounded-full border font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
                                {s}
                              </span>
                            ))}
                            {p.skills.length > 5 && (
                              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                +{p.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* GRID VIEW - Clean and compact */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => {
                const roleBadge = getRoleBadge(p.role)
                const gradient = getGradient(p.full_name || 'U')
                const isConnected = connected[p.id]
                
                return (
                  <div 
                    key={p.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                  >
                    <div className="p-5 flex-1">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden shrink-0`}>
                          {p.avatar_url ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" /> : getInitials(p.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{p.full_name}</h3>
                          <p className="text-xs text-gray-500 truncate">{p.headline || p.company || 'CoFlare Member'}</p>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          {roleBadge.emoji} {p.role?.toUpperCase()}
                        </span>
                      </div>

                      {/* Location */}
                      {p.location && (
                        <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span className="truncate">{p.location}</span>
                        </div>
                      )}

                      {/* Skills */}
                      {(p.skills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {p.skills.slice(0, 3).map((s: string, i: number) => (
                            <span key={s} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
                              {s}
                            </span>
                          ))}
                          {p.skills.length > 3 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">+{p.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="p-4 pt-0 flex gap-2">
                      <button 
                        onClick={() => handleConnect(p.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${
                          isConnected 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:shadow-lg'
                        }`}
                      >
                        {isConnected ? '✓ Connected' : '+ Connect'}
                      </button>
                      <Link 
                        href={`${messagingPath}?to=${p.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 border-2 border-gray-200 hover:border-teal-400 text-gray-700 hover:text-teal-700"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Empty State - Creative */}
        {filtered.length === 0 && (
          <div className="text-center py-16 sm:py-24">
            <div className="relative inline-block">
              <div className="text-7xl mb-4 animate-bounce">🔍</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full animate-pulse"></div>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn't find any professionals matching your search criteria.
            </p>
            <button 
              onClick={() => { setQ(''); setFilter('all') }}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}