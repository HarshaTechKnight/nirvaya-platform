import { createClient } from '@/lib/supabase/server'
import Messaging from './Messaging'

export default async function MessagingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all profiles (people you can chat with)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, company')
    .eq('is_profile_complete', true)
    .neq('id', user!.id)
    .limit(50)

  // Get current user
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Get all messages for current user (sent or received)
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
    .order('created_at', { ascending: true })

  return (
    <Messaging
      currentUser={currentUser}
      allProfiles={profiles || []}
      initialMessages={messages || []}
    />
  )
}