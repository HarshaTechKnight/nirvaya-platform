'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
    'from-teal to-teal-dark',
    'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600',
    'from-amber-400 to-orange-500',
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

  // Guard against undefined/null profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-teal/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal/20 to-rust/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Profile Not Found</h2>
          <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
            We couldn't load your profile. This might be a temporary issue.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
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
    if (role === 'mentor') {
      return [
        { label: 'Feed', icon: '📰', href: '/mentors/feed' },
        { label: 'Messages', icon: '💬', href: '/mentors/messaging' },
        { label: 'Discover', icon: '🔍', href: '/mentors/search' },
        { label: 'Profile', icon: '👤', href: '/profile', active: true },
        { label: 'Alerts', icon: '🔔', href: '/mentors/notifications' },
        { label: 'Grow', icon: '📈', href: '/mentors/grow-unit' },
      ]
    }
    if (role === 'investor') {
      return [
        { label: 'Dashboard', icon: '💎', href: '/investors' },
        { label: 'Profile', icon: '👤', href: '/profile', active: true },
      ]
    }
    return [
      { label: 'Feed', icon: '📰', href: '/founders/feed' },
      { label: 'Messages', icon: '💬', href: '/founders/messaging' },
      { label: 'Discover', icon: '🔍', href: '/founders/search' },
      { label: 'Profile', icon: '👤', href: '/profile', active: true },
      { label: 'Alerts', icon: '🔔', href: '/founders/notifications' },
      { label: 'Grow', icon: '📈', href: '/founders/grow-unit' },
    ]
  }

  function getPortalLabel(role?: string) {
    if (role === 'mentor') return 'Mentor Portal'
    if (role === 'investor') return 'Investor Portal'
    return 'Founder Portal'
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

  // Safe access with defaults
  const role = profile?.role || 'founder'
  const NAV_ITEMS = getNavForRole(role)
  const avatarUrl = profile?.avatar_url || null
  const fullName = profile?.full_name || 'User'
  const initials = getInitials(fullName)
  const userGradient = getGradient(fullName || 'U')
  const portalLabel = getPortalLabel(role)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-teal/5 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-line/40 flex flex-col min-h-screen sticky top-0 shadow-sm">
        <div className="px-5 pt-6 pb-4 border-b border-line/20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-display text-xl text-ink font-semibold tracking-tight">CoFlare</span>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">{portalLabel}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">Navigation</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-lg shadow-teal/20'
                  : 'text-ink-soft hover:bg-cream-dark/50 hover:text-ink'
              }`}
            >
              {item.active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cream rounded-r-full"></span>
              )}
              <span className="relative z-10 text-lg">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-line/20">
          <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cream-dark/30 transition-all group cursor-pointer">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-transparent group-hover:ring-teal/20 shrink-0`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{fullName}</div>
              <div className={`text-[10px] uppercase tracking-wider font-medium ${
                role === 'mentor' ? 'text-rust' : 
                role === 'investor' ? 'text-purple-600' : 
                'text-teal'
              }`}>
                {role}
              </div>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-xs text-muted hover:text-rust py-2 px-2 mt-1 rounded-lg hover:bg-rust-soft/20 transition-all group"
          >
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">
        
        {/* TOP BAR */}
        <div className="bg-white/80 backdrop-blur border-b border-line/30 px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl text-ink hidden sm:block">My Profile</h1>
            <div className="relative hidden md:block">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Search startups, mentors..."
                className="w-80 bg-cream/50 border-2 border-line/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-xl hover:bg-cream-dark flex items-center justify-center text-muted hover:text-ink transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rust rounded-full"></span>
            </button>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>

        {/* PROFILE CONTENT */}
        <div className="p-6 lg:p-8 max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-6">

              {/* COVER CARD */}
              <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 lg:h-56 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-ink via-teal-dark/80 to-teal">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-40 h-40 bg-teal/30 rounded-full blur-3xl animate-float-slow"></div>
                      <div className="absolute bottom-0 right-10 w-60 h-60 bg-rust/20 rounded-full blur-3xl animate-float-slower"></div>
                    </div>
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }}></div>
                  </div>
                </div>

                <div className="px-6 lg:px-8 pb-6 -mt-16 relative">
                  <div className="flex items-end justify-between mb-5 flex-wrap gap-4">
                    <div className="relative group">
                      <div className={`w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${userGradient} ring-4 ring-teal/10 group-hover:ring-teal/30 transition-all`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-cream text-3xl font-semibold">{initials}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full border-3 border-white shadow-sm animate-pulse"></div>
                    </div>
                    <div className="flex gap-2.5 mb-2">
                      <Link
                        href="/auth/complete-profile"
                        className="group px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z" />
                        </svg>
                        Edit Profile
                      </Link>
                      <button 
                        onClick={handleShare}
                        className="w-10 h-10 border-2 border-line rounded-xl flex items-center justify-center hover:bg-cream-dark hover:border-teal/30 transition-all text-ink-soft text-sm group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="font-display text-3xl text-ink">{fullName}</h1>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-teal-light text-teal-dark border border-teal/20">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        VERIFIED
                      </span>
                    )}
                    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border ${getRoleColor(role)}`}>
                      {ROLE_TAGS[role] || 'MEMBER'}
                    </span>
                  </div>

                  <p className="text-sm text-ink-soft">
                    {profile.headline || getDefaultHeadline()}
                    {profile.company && (
                      <span> at <span className="text-teal font-semibold">{profile.company}</span></span>
                    )}
                  </p>
                </div>
              </div>

              {/* BIO */}
              {profile.bio ? (
                <div className="bg-white border border-line/50 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="font-display text-lg text-ink">Executive Summary</h2>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{profile.bio}</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-cream to-cream-dark/30 border-2 border-dashed border-line/50 rounded-2xl p-8 text-center hover:border-teal/30 transition-all group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✍️</div>
                  <div className="text-sm text-ink-soft font-medium mb-1">No executive summary yet</div>
                  <div className="text-xs text-muted mb-4">Share your story with the network</div>
                  <Link
                    href="/auth/complete-profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-teal/20 transition-all"
                  >
                    Add Summary
                  </Link>
                </div>
              )}

              {/* DOMAIN & LOCATION */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-line/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">🎯</div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Expertise</span>
                  </div>
                  {(profile.domains || []).length > 0 ? (
                    <div className="space-y-2.5">
                      {(profile.domains || []).map((d: string, i: number) => (
                        <div key={d} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-cream-dark/30 transition-colors">
                          <span className="text-sm text-ink font-medium capitalize">{d}</span>
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded-full ${
                            i === 0 ? 'bg-teal text-cream' : 'bg-cream-dark/50 text-ink-soft'
                          }`}>
                            {i === 0 ? 'PRIMARY' : 'SKILLED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted italic">No domains added yet</p>
                  )}
                </div>

                <div className="bg-white border border-line/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-rust/10 flex items-center justify-center">📍</div>
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">Location</span>
                  </div>
                  {profile.location ? (
                    <div>
                      <div className="text-sm font-semibold text-ink">{profile.location}</div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        CoFlare Verified Region
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted italic">Not specified yet</p>
                  )}
                </div>
              </div>

              {/* SKILLS */}
              {(profile.skills || []).length > 0 ? (
                <div className="bg-white border border-line/50 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rust to-rust-dark flex items-center justify-center shadow-md">🛠️</div>
                    <h2 className="font-display text-lg text-ink">Skills & Competencies</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((s: string, idx: number) => (
                      <span 
                        key={s} 
                        className="px-4 py-2 bg-gradient-to-r from-cream to-cream-dark/30 border border-line/30 rounded-xl text-xs text-ink-soft font-medium hover:border-teal/30 hover:text-teal hover:shadow-sm transition-all cursor-default animate-fade-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-cream to-cream-dark/30 border-2 border-dashed border-line/50 rounded-2xl p-8 text-center hover:border-rust/30 transition-all group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛠️</div>
                  <div className="text-sm text-ink-soft font-medium mb-1">No skills added</div>
                  <div className="text-xs text-muted mb-4">Help others find you by adding your skills</div>
                  <Link
                    href="/auth/complete-profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-teal/20 transition-all"
                  >
                    Add Skills
                  </Link>
                </div>
              )}

              {/* LINKEDIN */}
              {profile.linkedin_url && (
                <div className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 shadow-sm">in</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-1">LinkedIn</div>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal hover:text-teal-dark truncate block font-medium">
                        {profile.linkedin_url}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-ink to-ink-soft text-cream rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-rust/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cream/50 font-semibold">Network Insights</span>
                  <div className="space-y-5 mt-4">
                    {[
                      { label: 'Posts', value: profile.posts_count || 0, color: 'text-teal' },
                      { label: 'Connections', value: profile.connections_count || 0, color: 'text-rust' },
                      { label: 'Mentors', value: 0, color: 'text-purple-400' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-cream/60">{item.label}</span>
                        <span className={`font-display text-2xl font-semibold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-line/50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-display text-base text-ink mb-4">Institutional Mentor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream font-semibold text-sm shrink-0">RN</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">Dr. Ramesh Naidu</div>
                    <div className="text-xs text-muted">AP Innovation Society</div>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-cream border border-line text-ink-soft rounded-xl text-sm font-medium hover:border-teal/30 transition-all">
                  Message Mentor
                </button>
              </div>

              <div className="bg-white border border-line/50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-display text-base text-ink mb-5">Grant Progress</h3>
                <div className="space-y-5">
                  {[
                    { phase: 'Seed Grant', status: 'DISBURSED · INR 15L', progress: 100, done: true },
                    { phase: 'Scale-up Equity', status: 'Under Review · 85%', progress: 85, done: false },
                    { phase: 'Series A Match', status: 'Locked', progress: 0, done: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`border-l-2 pl-4 ${item.done || item.progress > 0 ? 'border-teal' : 'border-line'}`}>
                      <div className={`text-sm font-semibold ${item.done || item.progress > 0 ? 'text-ink' : 'text-muted'}`}>
                        Phase {idx + 1}: {item.phase}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                        {item.done && (
                          <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status}
                      </div>
                      {!item.done && item.progress > 0 && (
                        <div className="mt-2 h-1.5 bg-cream-dark/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full" style={{ width: `${item.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={
                  role === 'mentor' ? '/mentors/feed' :
                  role === 'investor' ? '/investors' :
                  '/founders/feed'
                }
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-2xl text-sm font-medium hover:shadow-xl hover:shadow-teal/20 transition-all group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* SHARE TOAST */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ink to-ink-soft text-cream px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up flex items-center gap-2">
          <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Profile link copied!
        </div>
      )}
    </div>
  )
}