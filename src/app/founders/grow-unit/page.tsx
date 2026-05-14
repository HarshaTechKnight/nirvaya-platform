import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GrowUnitFounder from './GrowUnitFounder'

export const dynamic = 'force-dynamic'

export default async function FounderGrowUnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if no user
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect if no profile
  if (!profile) {
    redirect('/auth/login')
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*, profiles(full_name, avatar_url, role, headline)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: journals } = await supabase
    .from('journals')
    .select('*, profiles(full_name, avatar_url, role, headline)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <GrowUnitFounder
      profile={profile}
      courses={courses || []}
      journals={journals || []}
    />
  )
}