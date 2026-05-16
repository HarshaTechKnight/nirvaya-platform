import { createClient } from '@/lib/supabase/server'
import Messaging from './Messaging'

export const dynamic = 'force-dynamic'

export default async function MessagingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Get accepted connections
  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .or('sender_id.eq.' + user!.id + ',receiver_id.eq.' + user!.id)
    .eq('status', 'accepted')

  // Get connected user IDs
  const connectedIds = new Set<string>()
  ;(connections || []).forEach(c => {
    if (c.sender_id === user!.id) connectedIds.add(c.receiver_id)
    else connectedIds.add(c.sender_id)
  })

  // Only get profiles of connected people
  const idsArray = Array.from(connectedIds)
  const { data: profiles } = idsArray.length > 0
    ? await supabase
        .from('profiles')
        .select('id, full_name, role, headline, company, avatar_url')
        .in('id', idsArray)
    : { data: [] }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or('sender_id.eq.' + user!.id + ',receiver_id.eq.' + user!.id)
    .order('created_at', { ascending: true })

  return (
    <Messaging
      currentUser={currentUser}
      allProfiles={profiles || []}
      initialMessages={messages || []}
    />
  )
}