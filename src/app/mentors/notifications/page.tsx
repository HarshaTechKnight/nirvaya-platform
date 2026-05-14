import { createClient } from '@/lib/supabase/server'
import Notifications from '../../founders/notifications/Notifications'

export const dynamic = 'force-dynamic'

export default async function MentorNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifs } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <Notifications initialNotifs={notifs || []} profile={profile} />
}