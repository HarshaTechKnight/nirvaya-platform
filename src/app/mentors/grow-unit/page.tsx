import { createClient } from '@/lib/supabase/server'
import GrowUnit from './GrowUnit'

export default async function MentorGrowUnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('mentor_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: journals } = await supabase
    .from('journals')
    .select('*')
    .eq('mentor_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <GrowUnit initialCourses={courses || []} initialJournals={journals || []} profile={profile}/>
}