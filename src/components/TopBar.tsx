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
    'from-teal-400 to-teal-600',
    'from-rust-400 to-rust-600',
    'from-purple-400 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-pink-400 to-rose-500',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${Math.floor(s / 10) * 10}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
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
  const [scrolled, setScrolled] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const userGradient = getGradient(profile?.full_name || 'U')
  const initials = getInitials(profile?.full_name || '')
  const avatarUrl = profile?.avatar_url || null

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      setSearchQuery('')
    }
  }

  const menuItems = [
    { label: 'Profile', href: '/profile', icon: '👤', color: 'text-teal-600' },
    { label: 'Edit Profile', href: '/auth/complete-profile', icon: '✏️', color: 'text-gray-600' },
    { label: 'Messages', href: getMessagingLink(), icon: '💬', color: 'text-gray-600' },
    { label: 'Settings', href: '/settings', icon: '⚙️', color: 'text-gray-600' },
  ]

  return (
    <>
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg' : 'bg-white/80 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 w-full">
          
          {/* Left Section - Title with gradient */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg blur-md opacity-30"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                <span className="text-white text-sm sm:text-base">⚡</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg sm:text-xl text-gray-900">
                {title}
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Welcome back</span>
              </div>
            </div>
          </div>

          {/* Search Section - Enhanced */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
            <button 
              onClick={() => { setShowMobileSearch(!showMobileSearch); if (!showMobileSearch) setTimeout(() => searchRef.current?.focus(), 100) }}
              className="sm:hidden w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <form onSubmit={handleSearch} className={`${showMobileSearch ? 'absolute top-14 left-0 right-0 px-3 py-2 bg-white shadow-lg z-50' : 'hidden sm:block'} w-full`}>
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  ref={searchRef} 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)} 
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search for people, skills, or startups..."
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-9 pr-16 py-2.5 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-md text-white flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Section - Actions with improved styling */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Messages Button */}
            <Link 
              href={getMessagingLink()} 
              className="relative group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent flex items-center justify-center transition-all duration-300">
                <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-gray-600 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </Link>

            {/* Notifications Button */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative group w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent flex items-center justify-center transition-all duration-300 ${
                  showNotifs ? 'bg-teal-50' : ''
                }`}
              >
                <svg className={`w-[18px] h-[18px] sm:w-5 sm:h-5 transition-colors ${
                  showNotifs ? 'text-teal-600' : 'text-gray-600 group-hover:text-teal-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifs && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-[52px] sm:top-12 w-[calc(100vw-32px)] max-w-[380px] sm:w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs text-teal-600 font-medium ml-2">{unreadCount} new</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-[320px] sm:max-h-[400px] overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="px-5 py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-center">
                          <span className="text-3xl">🔔</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                      </div>
                    ) : (
                      recentNotifs.map(n => (
                        <button 
                          key={n.id} 
                          onClick={() => { markNotifRead(n.id); setShowNotifs(false); router.push(getNotifLink()) }}
                          className={`w-full px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 text-left transition-all duration-200 flex items-start gap-3 ${
                            !n.is_read ? 'bg-gradient-to-r from-teal-50/50 to-transparent' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            n.is_read ? 'bg-gray-300' : 'bg-teal-500 shadow-sm shadow-teal-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                              {n.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  
                  <Link 
                    href={getNotifLink()} 
                    onClick={() => setShowNotifs(false)} 
                    className="block px-5 py-3.5 border-t border-gray-100 text-center text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    View all notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-1.5 py-1 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
              >
                <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden ring-2 ring-transparent group-hover:ring-teal-200 transition-all`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    initials
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 hidden sm:block ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* User Dropdown */}
              {showMenu && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-[52px] sm:top-12 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden shrink-0`}>
                        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{profile?.full_name || 'User'}</div>
                        <div className={`text-[10px] uppercase tracking-wider font-semibold ${
                          profile?.role === 'mentor' ? 'text-rust-600' : 
                          profile?.role === 'investor' ? 'text-purple-600' : 'text-teal-600'
                        }`}>
                          {profile?.role || 'member'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {menuItems.map(item => (
                      <Link 
                        key={item.label} 
                        href={item.href} 
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-100 py-2">
                    <button 
                      onClick={() => { setShowMenu(false); handleSignOut() }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                      <span className="flex-1 text-left">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  )
}