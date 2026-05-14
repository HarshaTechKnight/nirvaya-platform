import { createClient } from '@/lib/supabase/server'
import Messaging from '../../founders/messaging/Messaging'

export default async function MentorMessagingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, company, avatar_url')
    .eq('is_profile_complete', true)
    .neq('id', user!.id)
    .limit(50)

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

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