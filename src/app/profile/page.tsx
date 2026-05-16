import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from './ProfileView'

export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  params?: { id?: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')

  // Get the viewer's own profile
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!viewerProfile?.role) redirect('/auth/select-role')
  if (!viewerProfile?.is_profile_complete) redirect('/auth/complete-profile')

  // Determine which profile to view (either own or another user's)
  const targetUserId = params?.id || user.id
  const isOwnProfile = targetUserId === user.id

  // Fetch the target profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()

  if (!targetProfile) {
    redirect('/founders/feed')
  }

  // Fetch connection status if viewing someone else's profile
  let connection = null
  if (!isOwnProfile) {
    const { data: connectionData } = await supabase
      .from('connections')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
      .single()
    
    connection = connectionData
  }

  return (
    <ProfileView 
      profile={targetProfile} 
      viewerProfile={viewerProfile} 
      connection={connection} 
    />
  )
}