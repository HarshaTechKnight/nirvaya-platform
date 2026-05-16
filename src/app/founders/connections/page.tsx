import { createClient } from '@/lib/supabase/server'
import Network from './Network'

export const dynamic = 'force-dynamic'

export default async function NetworkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: connections } = await supabase
    .from('connections')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, role, headline, company, avatar_url, location, domains, skills),
      receiver:profiles!receiver_id(id, full_name, role, headline, company, avatar_url, location, domains, skills)
    `)
    .or('sender_id.eq.' + user!.id + ',receiver_id.eq.' + user!.id)
    .order('created_at', { ascending: false })

  // Get IDs already connected/requested for exclusion in suggestions
  const excludeIds = new Set<string>([user!.id])
  ;(connections || []).forEach(c => {
    if (c.sender_id === user!.id) excludeIds.add(c.receiver_id)
    else excludeIds.add(c.sender_id)
  })

  // Suggestions — people not yet connected
  const { data: suggestions } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, company, avatar_url, location, domains, skills')
    .eq('is_profile_complete', true)
    .not('id', 'in', '(' + Array.from(excludeIds).join(',') + ')')
    .limit(20)

  return (
    <Network
      profile={profile}
      initialConnections={connections || []}
      initialSuggestions={suggestions || []}
    />
  )
}