import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

export const dynamic = 'force-dynamic'

export default async function MentorFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ComingSoon
      portalName="Mentors"
      description="A national network where India top mentors guide the next generation of founders. Publish courses, mentor founders by domain, and earn recognition for your wisdom."
      launchDate="March 2026"
      currentUser={profile}
    />
  )
}