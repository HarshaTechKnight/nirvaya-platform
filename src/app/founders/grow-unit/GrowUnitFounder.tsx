'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

type Course = {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  cover_url: string | null
  content_url: string | null  // Add this
  is_published: boolean
  views_count: number
  created_at: string
  profiles?: {
    full_name: string
    avatar_url: string | null
    role: string
    headline: string | null
  }
}

type Journal = {
  id: string
  title: string
  content: string
  tags: string[]
  read_minutes: number
  cover_url: string | null
  is_published: boolean
  views_count: number
  created_at: string
  profiles?: {
    full_name: string
    avatar_url: string | null
    role: string
    headline: string | null
  }
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd ago'
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

export default function GrowUnitFounder({
  profile,
  courses = [],
  journals = [],
}: {
  profile: any
  courses?: Course[]
  journals?: Journal[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<'courses' | 'journals'>('courses')

  async function trackView(table: 'courses' | 'journals', id: string) {
    try {
      await supabase.rpc('increment_view', { table_name: table, row_id: id })
    } catch {
      const { data } = await supabase.from(table).select('views_count').eq('id', id).single()
      if (data) {
        await supabase.from(table).update({ views_count: (data.views_count || 0) + 1 } as any).eq('id', id)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 w-full">
      <TopBar title="Grow Unit" profile={profile} />
      
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">Grow Unit</h1>
          <p className="text-xs sm:text-sm text-ink-soft">Courses and journals from CoFlare verified mentors.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-5 border-b border-line/30">
          <button
            onClick={() => setTab('courses')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'courses' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            📚 Courses ({courses.length})
          </button>
          <button
            onClick={() => setTab('journals')}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'journals' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            📝 Journals ({journals.length})
          </button>
        </div>

        {/* Courses Tab */}
        {tab === 'courses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 sm:py-16 text-sm text-muted">
                <div className="text-4xl mb-3">📚</div>
                <p>No courses available yet.</p>
              </div>
            ) : (
              courses.map(c => (
                <a
                  key={c.id}
                  href={c.content_url || '#'}
                  target={c.content_url ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={() => trackView('courses', c.id)}
                  className="group bg-white border border-line/30 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                >
                  {c.cover_url ? (
                    <div className="aspect-video bg-cream-dark overflow-hidden">
                      <img src={c.cover_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={`aspect-video bg-gradient-to-br ${getGradient(c.title || 'U')} flex items-center justify-center text-cream font-display text-3xl sm:text-4xl`}>
                      {c.title?.[0] || '📚'}
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                        {c.category || 'Course'}
                      </span>
                      {c.difficulty && (
                        <span className="text-[8px] sm:text-[9px] uppercase text-muted">{c.difficulty}</span>
                      )}
                    </div>
                    <h3 className="font-display text-sm sm:text-base text-ink mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-teal transition-colors">{c.title}</h3>
                    {c.description && (
                      <p className="text-[11px] sm:text-xs text-ink-soft line-clamp-2 mb-2 sm:mb-3">{c.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-line/30">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${getGradient(c.profiles?.full_name || 'U')} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shrink-0 overflow-hidden`}>
                        {c.profiles?.avatar_url ? (
                          <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(c.profiles?.full_name || '')
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs font-medium text-ink truncate">{c.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted">
                          {c.duration_minutes ? `${c.duration_minutes} min · ` : ''}{c.views_count || 0} views
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        {/* Journals Tab */}
        {tab === 'journals' && (
          <div className="space-y-3 sm:space-y-4">
            {journals.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-sm text-muted">
                <div className="text-4xl mb-3">📝</div>
                <p>No journals published yet.</p>
              </div>
            ) : (
              journals.map(j => (
                <div
                  key={j.id}
                  onClick={() => trackView('journals', j.id)}
                  className="group bg-white border border-line/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex gap-3 sm:gap-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  {j.cover_url && (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-cream-dark shrink-0">
                      <img src={j.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {(j.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                        {(j.tags || []).slice(0, 3).map((t: string) => (
                          <span key={t} className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-display text-sm sm:text-lg text-ink mb-1 sm:mb-1.5 group-hover:text-teal transition-colors">{j.title}</h3>
                    {j.content && (
                      <p className="text-[11px] sm:text-sm text-ink-soft line-clamp-2 mb-2 sm:mb-3">{j.content}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1.5 sm:pt-2 border-t border-line/30 flex-wrap">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${getGradient(j.profiles?.full_name || 'U')} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shrink-0 overflow-hidden`}>
                        {j.profiles?.avatar_url ? (
                          <img src={j.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(j.profiles?.full_name || '')
                        )}
                      </div>
                      <div className="flex-1 text-[10px] sm:text-xs min-w-0">
                        <span className="font-medium text-ink">{j.profiles?.full_name || 'Unknown'}</span>
                        <span className="text-muted ml-1.5">
                          · {j.read_minutes ? `${j.read_minutes} min read` : ''} · {j.views_count || 0} views · {timeAgo(j.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}