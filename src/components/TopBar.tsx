'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  if (s < 604800) return Math.floor(s / 86400) + 'd ago'
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function TopBar({ title, profile }: { title: string; profile: any }) {
  const router = useRouter()
  const supabase = createClient()

  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifs, setRecentNotifs] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const userGradient = getGradient(profile?.full_name || 'U')
  const initials = getInitials(profile?.full_name || '')
  const avatarUrl = profile?.avatar_url || null

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!profile?.id) return

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentNotifs(data || [])

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }
    load()

    const channel = supabase
      .channel('topbar-' + profile.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + profile.id },
        () => load()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  function getNotifLink() {
    if (profile?.role === 'mentor') return '/mentors/notifications'
    return '/founders/notifications'
  }

  function getMessagingLink() {
    if (profile?.role === 'mentor') return '/mentors/messaging'
    return '/founders/messaging'
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function markNotifRead(id: string) {
    setRecentNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      const searchPath = profile?.role === 'mentor' ? '/mentors/search' : '/founders/search'
      router.push(`${searchPath}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-line/20 px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
      
      {/* Title / Breadcrumb */}
      <h1 className="font-display text-lg sm:text-xl text-ink font-semibold hidden sm:block shrink-0">
        {title}
      </h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto relative">
        <div className={`relative transition-all duration-300 ${
          isSearchFocused ? 'scale-105' : 'scale-100'
        }`}>
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-colors" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search startups, mentors, investors..."
            className="w-full bg-cream/50 border-2 border-line/50 rounded-xl pl-10 pr-12 py-2.5 text-sm outline-none focus:border-teal focus:bg-white transition-all placeholder:text-muted/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
              className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted hover:bg-muted/40 transition-colors"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-teal/10 hover:bg-teal text-teal hover:text-cream flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Quick search suggestions */}
        {isSearchFocused && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden z-40 animate-fade-up">
            <div className="px-4 py-3 border-b border-line/20">
              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Quick Search</span>
            </div>
            {['Founders in Bengaluru', 'Mentors in Fintech', 'Startups in Vizag', 'Investors in Mumbai'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSearchQuery(s)
                  searchRef.current?.focus()
                }}
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
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Messages Quick Link */}
        <Link
          href={getMessagingLink()}
          className="w-10 h-10 rounded-xl hover:bg-cream-dark/50 flex items-center justify-center transition-all group relative"
          title="Messages"
        >
          <svg className="w-5 h-5 text-muted group-hover:text-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rust text-cream text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false) }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              showNotifs ? 'bg-teal/10 text-teal' : 'hover:bg-cream-dark/50 text-muted hover:text-ink'
            }`}
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rust text-cream text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-5 py-4 border-b border-line/20 flex items-center justify-between bg-gradient-to-r from-cream to-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-ink">Notifications</div>
                    {unreadCount > 0 && (
                      <div className="text-[10px] text-teal font-medium">{unreadCount} unread</div>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button className="text-[10px] text-teal font-medium hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                {recentNotifs.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="text-4xl mb-3">🔔</div>
                    <div className="text-sm text-ink-soft font-medium">No notifications yet</div>
                    <div className="text-xs text-muted mt-1">We'll notify you when something happens</div>
                  </div>
                ) : (
                  recentNotifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markNotifRead(n.id)
                        setShowNotifs(false)
                        router.push(getNotifLink())
                      }}
                      className={`w-full px-5 py-3.5 border-b border-line/20 hover:bg-cream/50 text-left transition-colors flex items-start gap-3 group ${
                        !n.is_read ? 'bg-teal-light/10' : ''
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 transition-all ${
                        n.is_read ? 'bg-line' : 'bg-teal shadow-sm shadow-teal/30'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm leading-snug ${n.is_read ? 'text-ink-soft' : 'text-ink font-medium'}`}>
                          {n.content}
                        </div>
                        <div className="text-[11px] text-muted mt-1">{timeAgo(n.created_at)}</div>
                      </div>
                      <svg className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))
                )}
              </div>

              <Link
                href={getNotifLink()}
                onClick={() => setShowNotifs(false)}
                className="block px-5 py-3.5 border-t border-line/20 text-center text-sm text-teal font-medium hover:bg-cream transition-colors flex items-center justify-center gap-2"
              >
                View all notifications
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => { setShowMenu(!showMenu); setShowNotifs(false) }}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-xl hover:bg-cream-dark/40 transition-all group"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-[10px] font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-transparent group-hover:ring-teal/20 overflow-hidden`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.full_name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <svg className={`w-4 h-4 text-muted transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              {/* User Info */}
              <div className="px-5 py-4 border-b border-line/20 bg-gradient-to-r from-cream to-white">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-sm font-semibold shadow-md ring-2 ring-teal/10 overflow-hidden shrink-0`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile?.full_name} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider font-medium ${
                      profile?.role === 'mentor' ? 'text-rust' : 
                      profile?.role === 'investor' ? 'text-purple-600' : 
                      'text-teal'
                    }`}>
                      {profile?.role || 'member'}
                    </div>
                    {profile?.headline && (
                      <div className="text-[11px] text-muted truncate mt-0.5">{profile.headline}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {[
                  { label: 'My Profile', href: '/profile', icon: '👤' },
                  { label: 'Edit Profile', href: '/auth/complete-profile', icon: '✏️' },
                  { label: 'Messages', href: getMessagingLink(), icon: '💬' },
                  { label: 'Notifications', href: getNotifLink(), icon: '🔔' },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-ink-soft hover:bg-cream transition-colors group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-line/20 py-2">
                <button
                  onClick={() => { setShowMenu(false); handleSignOut() }}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rust hover:bg-rust-soft/20 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}