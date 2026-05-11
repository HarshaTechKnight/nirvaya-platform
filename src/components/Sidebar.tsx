'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: string
  href: string
  badge?: number
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

function NavIcon({ label, active }: { label: string; active: boolean }) {
  const className = 'w-5 h-5 shrink-0 transition-transform group-hover:scale-110'
  const strokeWidth = active ? 2.5 : 2
  
  switch (label) {
    case 'Feed':
      return (
        <svg className={className} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h12" />
        </svg>
      )
    case 'Messaging':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'Find Founders':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    case 'Profile':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'Notifications':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    case 'Grow Unit':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    case 'Investor Portal':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'Settings':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}

export default function Sidebar({
  navItems,
  profile,
  portalLabel,
}: {
  navItems: NavItem[]
  profile: any
  portalLabel: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showUserMenu, setShowUserMenu] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const userGradient = getGradient(profile?.full_name || 'U')

  return (
    <aside className="w-64 bg-white border-r border-line/40 flex flex-col min-h-screen sticky top-0 shadow-sm">
      
      {/* Logo Section */}
      <div className="px-5 pt-6 pb-4 border-b border-line/20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-display text-xl text-ink font-semibold tracking-tight">
              CoFlare
            </span>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
              {portalLabel}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">Menu</span>
        </div>
        
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-lg shadow-teal/20'
                  : 'text-ink-soft hover:bg-cream-dark/50 hover:text-ink'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cream rounded-r-full"></span>
              )}
              
              <span className={`relative z-10 ${active ? 'text-cream' : 'text-muted group-hover:text-ink transition-colors'}`}>
                <NavIcon label={item.label} active={active} />
              </span>
              <span className="relative z-10 flex-1">{item.label}</span>
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  active 
                    ? 'bg-cream/20 text-cream' 
                    : 'bg-teal text-cream'
                }`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              
              {/* Active glow effect */}
              {active && (
                <span className="absolute inset-0 bg-gradient-to-r from-teal-dark/20 to-transparent opacity-50"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-line/20 p-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cream-dark/40 transition-all group"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-transparent group-hover:ring-teal/20 shrink-0`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(profile?.full_name || 'U')
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-ink truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-medium">
                {profile?.role || 'member'}
              </div>
            </div>
            <svg className={`w-4 h-4 text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-line rounded-2xl shadow-2xl z-20 overflow-hidden py-1 animate-fade-up">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-soft hover:bg-cream transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-soft hover:bg-cream transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <div className="h-px bg-line/50 my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rust hover:bg-rust-soft/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}