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
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  if (s < 604800) return Math.floor(s / 86400) + 'd'
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const userGradient = getGradient(profile?.full_name || 'U')
  const initials = getInitials(profile?.full_name || '')
  const avatarUrl = profile?.avatar_url || null

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
      setRecentNotifs(data || [])
      const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false)
      setUnreadCount(count || 0)
    }
    load()
    const channel = supabase.channel('topbar-' + profile.id).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + profile.id }, () => load()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  function getNotifLink() { return profile?.role === 'mentor' ? '/mentors/notifications' : '/founders/notifications' }
  function getMessagingLink() { return profile?.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging' }

  async function handleSignOut() { await supabase.auth.signOut(); router.push('/') }

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
      setShowMobileSearch(false)
    }
  }

  const menuItems = [
    { label: 'My Profile', href: '/profile', icon: '👤' },
    { label: 'Edit Profile', href: '/auth/complete-profile', icon: '✏️' },
    { label: 'Messages', href: getMessagingLink(), icon: '💬' },
    { label: 'Notifications', href: getNotifLink(), icon: '🔔' },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-line/20 px-2 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-4 sticky top-0 z-30 shadow-sm w-full">
      
      {/* Title */}
      <h1 className={`font-display text-base sm:text-lg lg:text-xl text-ink font-semibold shrink-0 ${showMobileSearch ? 'hidden' : 'hidden sm:block'}`}>
        {title}
      </h1>

      {/* Search section */}
      <div className="flex-1 flex items-center gap-2">
        <button 
          onClick={() => { setShowMobileSearch(!showMobileSearch); if (!showMobileSearch) setTimeout(() => searchRef.current?.focus(), 100) }}
          className={`sm:hidden w-9 h-9 rounded-xl hover:bg-cream-dark/50 flex items-center justify-center text-muted shrink-0 ${showMobileSearch ? 'hidden' : 'flex'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>

        <form onSubmit={handleSearch} className={`flex-1 max-w-xl ${showMobileSearch ? 'flex' : 'hidden sm:flex'}`}>
          <div className={`relative transition-all duration-300 w-full ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
              placeholder="Search..."
              className="w-full bg-cream/50 border-2 border-line/50 rounded-xl pl-9 pr-16 sm:pr-12 py-2 text-sm outline-none focus:border-teal focus:bg-white transition-all placeholder:text-muted/60" />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted hover:bg-muted/40 transition-colors">✕</button>
              )}
              <button type="submit" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal/10 hover:bg-teal text-teal hover:text-cream flex items-center justify-center transition-all">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT ACTIONS - Always visible */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* Messages */}
        <Link href={getMessagingLink()} 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-cream-dark/50 flex items-center justify-center transition-all relative" 
          title="Messages">
          <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-muted hover:text-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rust text-cream text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all relative ${showNotifs ? 'bg-teal/10 text-teal' : 'hover:bg-cream-dark/50 text-muted hover:text-ink'}`} 
            title="Notifications">
            <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rust text-cream text-[8px] font-bold rounded-full min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center px-1 shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-[52px] sm:top-12 w-[calc(100vw-16px)] max-w-[360px] sm:w-80 lg:w-96 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-line/20 flex items-center justify-between bg-gradient-to-r from-cream to-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-ink">Notifications</div>
                    {unreadCount > 0 && <div className="text-[10px] text-teal font-medium">{unreadCount} unread</div>}
                  </div>
                </div>
              </div>
              <div className="max-h-[280px] sm:max-h-[400px] overflow-y-auto scrollbar-thin">
                {recentNotifs.length === 0 ? (
                  <div className="px-5 py-10 sm:py-12 text-center">
                    <div className="text-3xl sm:text-4xl mb-2">🔔</div>
                    <div className="text-xs sm:text-sm text-ink-soft font-medium">No notifications yet</div>
                  </div>
                ) : (
                  recentNotifs.map(n => (
                    <button key={n.id} onClick={() => { markNotifRead(n.id); setShowNotifs(false); router.push(getNotifLink()) }}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border-b border-line/20 hover:bg-cream/50 text-left transition-colors flex items-start gap-2 sm:gap-3 ${!n.is_read ? 'bg-teal-light/10' : ''}`}>
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 mt-1.5 ${n.is_read ? 'bg-line' : 'bg-teal shadow-sm shadow-teal/30'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs sm:text-sm leading-snug ${n.is_read ? 'text-ink-soft' : 'text-ink font-medium'}`}>{n.content}</div>
                        <div className="text-[10px] sm:text-[11px] text-muted mt-1">{timeAgo(n.created_at)}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <Link href={getNotifLink()} onClick={() => setShowNotifs(false)} className="block px-4 sm:px-5 py-3 border-t border-line/20 text-center text-xs sm:text-sm text-teal font-medium hover:bg-cream transition-colors">
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 pr-0.5 sm:pr-1 py-1 rounded-xl hover:bg-cream-dark/40 transition-all">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shadow-md overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-teal/20 transition-all`}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted transition-transform hidden sm:block ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {showMenu && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-[52px] sm:top-12 w-56 sm:w-64 bg-white border border-line/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-up z-50">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-line/20 bg-gradient-to-r from-cream to-white">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs sm:text-sm font-semibold shadow-md overflow-hidden shrink-0`}>
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-ink truncate">{profile?.full_name || 'User'}</div>
                    <div className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-medium ${profile?.role === 'mentor' ? 'text-rust' : profile?.role === 'investor' ? 'text-purple-600' : 'text-teal'}`}>{profile?.role || 'member'}</div>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {menuItems.map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-ink-soft hover:bg-cream transition-colors">
                    <span className="text-base sm:text-lg">{item.icon}</span>{item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-line/20 py-1">
                <button onClick={() => { setShowMenu(false); handleSignOut() }}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-rust hover:bg-rust-soft/20 transition-colors">
                  <span className="text-base sm:text-lg">🚪</span> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}