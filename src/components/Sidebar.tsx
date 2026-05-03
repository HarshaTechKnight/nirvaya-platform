'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItem { label: string; icon: string; href: string }

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

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getInitials(name: string) {
    return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <aside className="w-60 bg-cream border-r border-line/60 flex flex-col min-h-screen sticky top-0">
      <div className="px-6 pt-6 pb-5">
        <Link href="/" className="font-display text-xl text-teal font-semibold tracking-tight block">
          Co-Flare
        </Link>
        <div className="text-[10px] uppercase tracking-wider text-muted mt-0.5">
          {portalLabel}
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                active
                  ? 'bg-white text-teal shadow-sm border border-line/50'
                  : 'text-ink-soft hover:bg-cream-dark/60'
              }`}
            >
              <span className="text-base w-5">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-line/60">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-semibold">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink truncate">{profile?.full_name || 'User'}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted">{profile?.role}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-xs text-muted hover:text-rust py-1.5 text-left px-2 transition-colors"
        >
          ↩ Sign out
        </button>
      </div>
    </aside>
  )
}