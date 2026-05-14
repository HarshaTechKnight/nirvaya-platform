import { createClient } from '@/lib/supabase/server'
import GrowUnitMentor from './GrowUnitMentor'

export const dynamic = 'force-dynamic'

export default async function MentorGrowUnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: myCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('mentor_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: myJournals } = await supabase
    .from('journals')
    .select('*')
    .eq('mentor_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <GrowUnitMentor
      profile={profile}
      initialCourses={myCourses || []}
      initialJournals={myJournals || []}
    />
  )
}