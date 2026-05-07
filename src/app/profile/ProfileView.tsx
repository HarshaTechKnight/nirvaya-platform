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
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
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
  posts_count?: number
  connections_count?: number
  is_verified?: boolean
}

export default function ProfileView({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function getNavForRole(role?: string) {
  if (role === 'mentor') {
    return [
      { label: 'Feed', icon: 'F', href: '/mentors/feed' },
      { label: 'Messaging', icon: 'M', href: '/mentors/messaging' },
      { label: 'Find Founders', icon: 'S', href: '/mentors/search' },
      { label: 'Profile', icon: 'P', href: '/profile', active: true },
      { label: 'Notifications', icon: 'N', href: '/mentors/notifications' },
      { label: 'Grow Unit', icon: 'G', href: '/mentors/grow-unit' },
    ]
  }
  if (role === 'investor') {
    return [
      { label: 'Investor Portal', icon: 'I', href: '/investors' },
      { label: 'Profile', icon: 'P', href: '/profile', active: true },
    ]
  }
  return [
    { label: 'Feed', icon: 'F', href: '/founders/feed' },
    { label: 'Messaging', icon: 'M', href: '/founders/messaging' },
    { label: 'Search', icon: 'S', href: '/founders/search' },
    { label: 'Profile', icon: 'P', href: '/profile', active: true },
    { label: 'Notifications', icon: 'N', href: '/founders/notifications' },
    { label: 'Grow Unit', icon: 'G', href: '/founders/grow-unit' },
  ]
}

  function getPortalLabel(role?: string) {
    if (role === 'mentor') return 'Mentors Portal'
    if (role === 'investor') return 'Investor Portal'
    return 'Founders Portal'
  }

  function getDefaultHeadline() {
    const tag = ROLE_TAGS[profile.role || ''] || 'MEMBER'
    return tag + ' Network'
  }

  const NAV_ITEMS = getNavForRole(profile.role)

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-60 bg-cream border-r border-line flex flex-col min-h-screen sticky top-0">
        <div className="px-6 pt-6 pb-5">
          <Link href="/" className="font-display text-xl text-teal font-semibold block">CoFlare</Link>
          <div className="text-xs uppercase tracking-wider text-muted mt-0.5">{getPortalLabel(profile.role)}</div>
        </div>

        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.active ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 bg-white text-teal" : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-ink-soft"}
            >
              <span className="text-base w-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-semibold">
              {getInitials(profile.full_name || '')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink truncate">{profile.full_name || 'User'}</div>
              <div className="text-xs uppercase tracking-wider text-muted">{profile.role}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-xs text-muted py-1.5 text-left px-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="bg-cream border-b border-line px-8 h-16 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display text-xl text-ink">My Profile</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-semibold">
              {getInitials(profile.full_name || '')}
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">

            <div className="space-y-5">
              <div className="bg-white border border-line rounded-2xl overflow-hidden">
                <div
                  className="h-44 relative"
                  style={{ background: 'radial-gradient(ellipse at center, #d4e8e0 0%, #1a3d33 70%, #0a2620 100%)' }}
                />
                <div className="px-8 pb-6 -mt-14 relative">
                  <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-teal-dark flex items-center justify-center text-cream text-3xl font-semibold shadow-xl">
                      {getInitials(profile.full_name || '')}
                    </div>
                    <Link
                      href="/auth/complete-profile"
                      className="px-5 py-2 bg-teal text-cream rounded-lg text-sm font-medium"
                    >
                      Edit Profile
                    </Link>
                  </div>

                  <h1 className="font-display text-3xl text-ink mb-1">{profile.full_name || 'Your Name'}</h1>
                  <p className="text-sm text-ink-soft">
                    {profile.headline || getDefaultHeadline()}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <div className="bg-white border border-line rounded-2xl p-7">
                  <h2 className="font-display text-lg text-ink mb-3">Executive Summary</h2>
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{profile.bio}</p>
                </div>
              )}

              {profile.location && (
                <div className="bg-white border border-line rounded-2xl p-5">
                  <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Location</div>
                  <div className="text-sm text-ink">{profile.location}</div>
                </div>
              )}

              {(profile.skills || []).length > 0 && (
                <div className="bg-white border border-line rounded-2xl p-7">
                  <h2 className="font-display text-lg text-ink mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-cream border border-line rounded-lg text-xs text-ink-soft">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-ink text-cream rounded-2xl p-6">
                <div className="text-xs uppercase tracking-wider text-cream font-semibold mb-4">Network Insights</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-cream">Posts</div>
                    <div className="font-display text-2xl">{profile.posts_count || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-cream">Connections</div>
                    <div className="font-display text-2xl">{profile.connections_count || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}