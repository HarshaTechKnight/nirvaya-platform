import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const FOUNDER_NAV = [
  { label: 'Feed', icon: 'feed', href: '/founders/feed' },
  { label: 'My Network', icon: 'network', href: '/founders/connections' },
  { label: 'Messaging', icon: 'messaging', href: '/founders/messaging' },
  { label: 'Search', icon: 'search', href: '/founders/search' },
  { label: 'Profile', icon: 'profile', href: '/profile' },
  { label: 'Notifications', icon: 'notifications', href: '/founders/notifications' },
  { label: 'Grow Unit', icon: 'grow', href: '/founders/grow-unit' },
]

export default async function FoundersLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.role) redirect('/auth/select-role')
  if (!profile?.is_profile_complete) redirect('/auth/complete-profile')
  if (profile.role === 'mentor') redirect('/mentors/feed')
  if (profile.role === 'investor') redirect('/investors')

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar navItems={FOUNDER_NAV} profile={profile} portalLabel="Founders Portal"/>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}