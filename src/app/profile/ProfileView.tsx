'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

const ROLE_TAGS: Record<string, string> = {
  founder: 'FOUNDER',
  'co-founder': 'CO-FOUNDER',
  freelancer: 'FREELANCER',
  'biz-owner': 'BIZ OWNER',
  mentor: 'MENTOR',
  investor: 'INVESTOR',
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

type Profile = {
  id?: string
  full_name?: string
  headline?: string
  role?: string
  company?: string
  bio?: string
  domains?: string[]
  location?: string
  skills?: string[]
  linkedin_url?: string
  avatar_url?: string
  posts_count?: number
  connections_count?: number
  is_verified?: boolean
}

export default function ProfileView({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [showShareToast, setShowShareToast] = useState(false)

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal/20 to-rust/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Profile Not Found</h2>
          <p className="text-sm text-muted mb-6">We couldn't load your profile.</p>
          <button onClick={() => router.push('/auth/login')} className="px-6 py-3 bg-teal text-cream rounded-xl text-sm font-medium">
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  async function handleShare() {
    const url = window.location.origin + '/profile/' + profile?.id
    try {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    } catch {
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  function getNavForRole(role?: string) {
    if (role === 'mentor') return [
      { label: 'Feed', icon: '📰', href: '/mentors/feed' },
      { label: 'Messages', icon: '💬', href: '/mentors/messaging' },
      { label: 'Discover', icon: '🔍', href: '/mentors/search' },
      { label: 'Profile', icon: '👤', href: '/profile' },
      { label: 'Alerts', icon: '🔔', href: '/mentors/notifications' },
      { label: 'Grow', icon: '📈', href: '/mentors/grow-unit' },
    ]
    if (role === 'investor') return [
      { label: 'Dashboard', icon: '💎', href: '/investors' },
      { label: 'Profile', icon: '👤', href: '/profile' },
    ]
    return [
      { label: 'Feed', icon: '📰', href: '/founders/feed' },
      { label: 'Messages', icon: '💬', href: '/founders/messaging' },
      { label: 'Discover', icon: '🔍', href: '/founders/search' },
      { label: 'Profile', icon: '👤', href: '/profile' },
      { label: 'Alerts', icon: '🔔', href: '/founders/notifications' },
      { label: 'Grow', icon: '📈', href: '/founders/grow-unit' },
    ]
  }

  function getPortalLabel(role?: string) {
    if (role === 'mentor') return 'MENTOR PORTAL'
    if (role === 'investor') return 'INVESTOR PORTAL'
    return 'FOUNDER PORTAL'
  }

  function getDefaultHeadline() {
    const tag = ROLE_TAGS[profile?.role || ''] || 'MEMBER'
    return tag + ' · CoFlare Network'
  }

  function getRoleColor(role?: string) {
    if (role === 'mentor') return 'bg-rust/10 text-rust border-rust/20'
    if (role === 'investor') return 'bg-purple-50 text-purple-600 border-purple-200'
    return 'bg-teal-light text-teal-dark border-teal/20'
  }

  const role = profile?.role || 'founder'
  const NAV_ITEMS = getNavForRole(role)
  const avatarUrl = profile?.avatar_url || null
  const fullName = profile?.full_name || 'User'
  const initials = getInitials(fullName)
  const userGradient = getGradient(fullName || 'U')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-teal/5 flex flex-col lg:flex-row">
      
      {/* SIDEBAR - Uses the shared Sidebar component */}
      <Sidebar navItems={NAV_ITEMS} profile={profile} portalLabel={getPortalLabel(role)} />

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 w-full">
        
        {/* TOP BAR */}
        <div className="bg-white/80 backdrop-blur border-b border-line/30 px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="font-display text-lg sm:text-xl text-ink">My Profile</h1>
            <div className="relative hidden lg:block">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input placeholder="Search..." className="w-48 xl:w-80 bg-cream/50 border border-line/50 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-teal transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-cream-dark flex items-center justify-center text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rust rounded-full"></span>
            </button>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md overflow-hidden shrink-0`}>
              {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" /> : initials}
            </div>
          </div>
        </div>

        {/* PROFILE CONTENT - Responsive */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_340px] gap-4 sm:gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-4 sm:space-y-6">

              {/* COVER CARD */}
              <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-32 sm:h-40 lg:h-48 relative overflow-hidden bg-gradient-to-br from-ink via-teal-dark to-teal">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-teal/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-10 w-60 h-60 bg-rust/15 rounded-full blur-3xl"></div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 -mt-12 sm:-mt-14 lg:-mt-16 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="relative group self-center sm:self-auto">
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br ${userGradient} ring-4 ring-teal/10`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-cream text-2xl sm:text-3xl font-semibold">{initials}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center sm:justify-end">
                      <Link href="/auth/complete-profile"
                        className="px-3 sm:px-5 py-2 sm:py-2.5 bg-teal text-cream rounded-xl text-xs sm:text-sm font-medium hover:bg-teal-dark transition-all flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z"/></svg>
                        <span className="hidden xs:inline">Edit Profile</span>
                      </Link>
                      <button onClick={handleShare}
                        className="w-10 h-10 border-2 border-line rounded-xl flex items-center justify-center hover:bg-cream-dark transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-1">
                      <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink">{fullName}</h1>
                      {profile.is_verified && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal/20">✓ VERIFIED</span>
                      )}
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleColor(role)}`}>
                        {ROLE_TAGS[role] || 'MEMBER'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-soft">
                      {profile.headline || getDefaultHeadline()}
                      {profile.company && <span> at <span className="text-teal font-semibold">{profile.company}</span></span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* BIO */}
              {profile.bio ? (
                <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <h2 className="font-display text-base sm:text-lg text-ink">Executive Summary</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line">{profile.bio}</p>
                </div>
              ) : (
                <div className="bg-cream border-2 border-dashed border-line/50 rounded-2xl p-6 sm:p-8 text-center hover:border-teal/30 transition-all">
                  <div className="text-3xl sm:text-4xl mb-3">✍️</div>
                  <div className="text-sm font-medium mb-1">No executive summary yet</div>
                  <div className="text-xs text-muted mb-4">Share your story with the network</div>
                  <Link href="/auth/complete-profile" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-teal text-cream rounded-xl text-xs font-medium hover:bg-teal-dark transition-all">Add Summary</Link>
                </div>
              )}

              {/* DOMAIN & LOCATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-lg">🎯</span>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Expertise</span>
                  </div>
                  {(profile.domains || []).length > 0 ? (
                    <div className="space-y-2">
                      {(profile.domains || []).map((d, i) => (
                        <div key={d} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-cream-dark/30 transition-colors">
                          <span className="text-xs sm:text-sm font-medium capitalize">{d}</span>
                          <span className={`text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full ${i === 0 ? 'bg-teal text-cream' : 'bg-cream-dark/50 text-ink-soft'}`}>
                            {i === 0 ? 'PRIMARY' : 'SKILLED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs sm:text-sm text-muted italic">No domains added</p>}
                </div>

                <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-lg">📍</span>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Location</span>
                  </div>
                  {profile.location ? (
                    <div>
                      <div className="text-sm font-semibold">{profile.location}</div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>Verified Region
                      </div>
                    </div>
                  ) : <p className="text-xs sm:text-sm text-muted italic">Not specified</p>}
                </div>
              </div>

              {/* SKILLS */}
              {(profile.skills || []).length > 0 ? (
                <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                    <span className="text-xl sm:text-2xl">🛠️</span>
                    <h2 className="font-display text-base sm:text-lg text-ink">Skills & Competencies</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(profile.skills || []).map(s => (
                      <span key={s} className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-cream border border-line/30 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium hover:border-teal/30 hover:text-teal transition-all cursor-default">{s}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-cream border-2 border-dashed border-line/50 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-4xl mb-3">🛠️</div>
                  <div className="text-sm font-medium mb-1">No skills added</div>
                  <div className="text-xs text-muted mb-4">Help others find you</div>
                  <Link href="/auth/complete-profile" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-teal text-cream rounded-xl text-xs font-medium hover:bg-teal-dark transition-all">Add Skills</Link>
                </div>
              )}

              {/* LINKEDIN */}
              {profile.linkedin_url && (
                <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">in</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">LinkedIn</div>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener" className="text-xs sm:text-sm text-teal hover:text-teal-dark truncate block">{profile.linkedin_url}</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4 sm:space-y-5">
              {/* Network Insights */}
              <div className="bg-gradient-to-br from-ink to-ink-soft text-cream rounded-2xl p-5 sm:p-6 shadow-xl">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/50 font-semibold">Network Insights</span>
                <div className="space-y-4 mt-4">
                  {[
                    { label: 'Posts', value: profile.posts_count || 0, color: 'text-teal' },
                    { label: 'Connections', value: profile.connections_count || 0, color: 'text-rust' },
                    { label: 'Mentors', value: 0, color: 'text-purple-400' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-cream/60">{item.label}</span>
                      <span className={`font-display text-xl sm:text-2xl font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Card */}
              <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="font-display text-sm sm:text-base text-ink mb-3 sm:mb-4">Institutional Mentor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream font-semibold text-sm shrink-0">RN</div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold">Dr. Ramesh Naidu</div>
                    <div className="text-[10px] sm:text-xs text-muted">AP Innovation Society</div>
                  </div>
                </div>
                <button className="w-full py-2 sm:py-2.5 bg-cream border border-line rounded-xl text-xs sm:text-sm font-medium hover:border-teal/30 transition-all">Message Mentor</button>
              </div>

              {/* Grant Progress */}
              <div className="bg-white border border-line/50 rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="font-display text-sm sm:text-base text-ink mb-4 sm:mb-5">Grant Progress</h3>
                <div className="space-y-4 sm:space-y-5">
                  {[
                    { phase: 'Seed Grant', status: 'DISBURSED · ₹15L', progress: 100, done: true },
                    { phase: 'Scale-up Equity', status: 'Under Review', progress: 85, done: false },
                    { phase: 'Series A Match', status: 'Locked', progress: 0, done: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`border-l-2 pl-3 sm:pl-4 ${item.done || item.progress > 0 ? 'border-teal' : 'border-line'}`}>
                      <div className={`text-xs sm:text-sm font-semibold ${item.done || item.progress > 0 ? 'text-ink' : 'text-muted'}`}>
                        Phase {idx + 1}: {item.phase}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-muted mt-0.5 flex items-center gap-1">
                        {item.done && <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                        {item.status}
                      </div>
                      {!item.done && item.progress > 0 && (
                        <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 bg-cream-dark/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full" style={{ width: `${item.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Post CTA */}
              <Link href={role === 'mentor' ? '/mentors/feed' : role === 'investor' ? '/investors' : '/founders/feed'}
                className="flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-2xl text-sm font-medium hover:shadow-xl transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* TOAST */}
      {showShareToast && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up">
          Profile link copied!
        </div>
      )}
    </div>
  )
}