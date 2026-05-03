import { createClient } from '@/lib/supabase/server'
import Search from './Search'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, bio, company, location, domains, skills')
    .eq('is_profile_complete', true)
    .neq('id', user!.id)
    .limit(50)

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <Search initialProfiles={profiles || []} currentUser={currentUser}/>
}