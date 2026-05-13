import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  // Mentor portal not live yet — all roads to /mentors redirect to coming soon
  return <>{children}</>
}