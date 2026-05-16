import { createClient } from '@/lib/supabase/server'
import Search from './Search'

export const dynamic = 'force-dynamic'

export default async function FounderSearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, bio, company, location, domains, skills, avatar_url')
    .eq('is_profile_complete', true)
    .neq('id', user!.id)
    .limit(50)

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .or('sender_id.eq.' + user!.id + ',receiver_id.eq.' + user!.id)

  return (
    <Search
      initialProfiles={profiles || []}
      currentUser={currentUser}
      initialConnections={connections || []}
    />
  )
}