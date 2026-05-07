import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const MENTOR_NAV = [
  { label: 'Feed', icon: 'F', href: '/mentors/feed' },
  { label: 'Messaging', icon: 'M', href: '/mentors/messaging' },
  { label: 'Find Founders', icon: 'S', href: '/mentors/search' },
  { label: 'Profile', icon: 'P', href: '/profile' },
  { label: 'Notifications', icon: 'N', href: '/mentors/notifications' },
  { label: 'Grow Unit', icon: 'G', href: '/mentors/grow-unit' },
]

export default async function MentorsLayout({ children }: { children: React.ReactNode }) {
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
  if (profile.role !== 'mentor') redirect('/founders/feed')

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar navItems={MENTOR_NAV} profile={profile} portalLabel="Mentors Portal"/>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}