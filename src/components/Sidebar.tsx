'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const userGradient = getGradient(profile?.full_name || 'U')
  const totalUnread = navItems.reduce((sum, item) => sum + (item.badge || 0), 0)

  const sidebarContent = (
    <>
      {/* Logo Section - Glowing Effect */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <span className="text-white text-xl">⚡</span>
              </div>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                CoFlare
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">
                  {portalLabel}
                </span>
              </div>
            </div>
          </Link>
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">👋</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500">Welcome back,</p>
            <p className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name?.split(' ')[0] || 'Explorer'}</p>
          </div>
          {totalUnread > 0 && (
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse absolute -top-1 -right-1"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-100 to-teal-50 flex items-center justify-center">
                <span className="text-xs font-bold text-teal-600">{totalUnread}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        <div className="px-3 py-2">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Main Menu</span>
        </div>
        
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></span>
              )}
              
              {/* Icon with animation */}
              <span className={`relative text-xl transition-all duration-300 ${
                active ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              
              <span className="relative flex-1">{item.label}</span>
              
              {/* Badge with animation */}
              {item.badge && item.badge > 0 && (
                <span className={`relative text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm'
                }`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              
              {/* Hover effect layer */}
              {!active && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-500/5 to-transparent"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section - Enhanced */}
      <div className="border-t border-gray-100 p-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
          >
            <div className="relative shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:shadow-lg transition-all overflow-hidden`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(profile?.full_name || 'U')
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[9px] text-gray-500 font-medium uppercase">
                  {profile?.role || 'member'}
                </span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu - Animated */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-slideUp">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent transition-all duration-200"
                >
                  <span className="text-lg">👤</span>
                  <span className="flex-1">View Profile</span>
                  <span className="text-xs text-gray-400">→</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent transition-all duration-200"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="flex-1">Settings</span>
                  <span className="text-xs text-gray-400">→</span>
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200"
                >
                  <span className="text-lg">🚪</span>
                  <span className="flex-1 text-left">Sign Out</span>
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
      {/* Mobile Header - Floating effect */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-sm'
      }`}>
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
              <span className="text-white text-base">⚡</span>
            </div>
            <span className="font-bold text-lg text-gray-900">CoFlare</span>
          </Link>
          
          <Link
            href="/profile"
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              getInitials(profile?.full_name || 'U')
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Enhanced */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col min-h-screen sticky top-0 shadow-lg">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - Slide in */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white flex flex-col z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Bottom Navigation - Glass morphism */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white shadow-lg'
      }`}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 group ${
                  active
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {/* Active background */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-transparent rounded-xl"></div>
                )}
                
                {/* Icon */}
                <span className={`relative text-2xl transition-all duration-300 ${
                  active ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                
                {/* Label */}
                <span className="relative text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 right-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm min-w-[18px] text-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Add padding for fixed headers on mobile */}
      <div className="lg:hidden h-16"></div>
      <div className="lg:hidden h-16 sm:h-20"></div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </>
  )
}