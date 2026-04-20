'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ROLE_TAGS: Record<string, string> = {
  founder: 'FOUNDER',
  'co-founder': 'CO-FOUNDER',
  freelancer: 'FREELANCER',
  'biz-owner': 'BIZ OWNER',
  mentor: 'MENTOR',
  investor: 'INVESTOR',
}

function getInitials(name: string) {
  return (name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type Profile = {
  full_name?: string
  headline?: string
  role?: string
  company?: string
  bio?: string
  domains?: string[]
  location?: string
  skills?: string[]
  posts_count?: number
  connections_count?: number
}

export default function ProfileView({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const NAV_ITEMS = [
    { label: 'Feed', icon: '📰', href: '#' },
    { label: 'Messaging', icon: '💬', href: '#' },
    { label: 'Search', icon: '🔍', href: '#' },
    { label: 'Profile', icon: '👤', href: '/profile', active: true },
    { label: 'Notifications', icon: '🔔', href: '#' },
    { label: 'Startup Listings', icon: '💼', href: '#' },
    { label: 'Grow Unit', icon: '📈', href: '#' },
    { label: 'Admin Dashboard', icon: '⚙️', href: '#' },
  ]

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-cream border-r border-line/60 flex flex-col min-h-screen sticky top-0">
        <div className="px-6 pt-6 pb-5">
          <Link href="/" className="font-display text-xl text-teal font-semibold tracking-tight block">
            CoFlare
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-muted mt-0.5">
            Institutional Curator
          </div>
        </div>

        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                item.active
                  ? 'bg-white text-teal shadow-sm border border-line/50'
                  : 'text-ink-soft hover:bg-cream-dark/60'
              }`}
            >
              <span className="text-base w-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-line/60">
          <Link
            href="#"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal text-cream rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
          >
            <span>+</span> Create Post
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-xs text-muted hover:text-rust mt-3 py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-cream border-b border-line/60 px-8 h-16 flex items-center justify-between">
          <div className="font-display text-lg text-teal font-semibold">CoFlare</div>

          <div className="flex-1 max-w-md mx-8 relative">
            <input
              placeholder="Search startups, mentors..."
              className="w-full bg-white border border-line rounded-lg px-4 py-2 pl-10 text-sm outline-none focus:border-teal"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
              🔍
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-muted hover:text-teal">🔔</button>
            <button className="text-muted hover:text-teal">📍</button>
            <div className="w-9 h-9 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-semibold">
              {getInitials(profile.full_name || '')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid lg:grid-cols-[1fr_320px] gap-6 max-w-6xl">
          {/* LEFT */}
          <div>
            <div className="bg-white border border-line/50 rounded-2xl overflow-hidden mb-5">
              <div
                className="h-40 relative"
                style={{
                  background:
                    'radial-gradient(ellipse at center, #d4e8e0 0%, #1a3d33 100%)',
                }}
              />

              <div className="px-8 pb-6 -mt-12 relative">
                <div className="flex items-end justify-between mb-5">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-teal-dark flex items-center justify-center text-cream text-2xl font-semibold shadow-lg">
                    {getInitials(profile.full_name || '')}
                  </div>

                  <Link
                    href="/auth/complete-profile"
                    className="px-5 py-2 bg-teal text-cream rounded-lg text-sm font-medium"
                  >
                    ✏️ Edit Profile
                  </Link>
                </div>

                <h1 className="font-display text-3xl text-ink mb-1">
                  {profile.full_name}
                </h1>

                <p className="text-sm text-ink-soft">
                  {profile.headline ||
                    `${ROLE_TAGS[profile.role || ''] || 'MEMBER'} · CoFlare Member`}
                </p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white border border-line/50 rounded-2xl p-7 mb-5">
                <h2 className="font-display text-lg text-ink mb-4">
                  Executive Summary
                </h2>
                <p className="text-sm text-ink-soft whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="bg-ink text-cream rounded-2xl p-6">
              <div className="text-xs mb-4">Network Insights</div>

              <div className="space-y-3">
                <div>Posts: {profile.posts_count || 0}</div>
                <div>Connections: {profile.connections_count || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}