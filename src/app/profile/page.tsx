import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from './ProfileView'

export default async function ProfilePage() {
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

  return <ProfileView profile={profile}/>
}