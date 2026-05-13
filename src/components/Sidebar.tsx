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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const userGradient = getGradient(profile?.full_name || 'U')

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="px-5 pt-6 pb-4 border-b border-line/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <span className="text-cream text-lg">⚡</span>
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
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-cream-dark flex items-center justify-center text-muted hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
              onClick={() => setMobileMenuOpen(false)}
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
              
              <span className="relative z-10 text-lg transition-transform group-hover:scale-110">
                {item.icon}
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
                  <span className="text-lg">👤</span>
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-soft hover:bg-cream transition-colors"
                >
                  <span className="text-lg">⚙️</span>
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
                  <span className="text-lg">🚪</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-line/40 flex items-center justify-between px-4 z-30 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-10 h-10 rounded-xl hover:bg-cream-dark flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-md">
            <span className="text-cream text-base">⚡</span>
          </div>
          <span className="font-display text-lg text-ink font-semibold">CoFlare</span>
        </Link>
        
        <Link
          href="/profile"
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md`}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            getInitials(profile?.full_name || 'U')
          )}
        </Link>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-ink/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-line/40 flex-col min-h-screen sticky top-0 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-line/40 flex flex-col z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line/40 flex items-center justify-around px-2 py-2 z-30 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'text-teal'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] leading-tight">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rust text-cream min-w-[18px] text-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}