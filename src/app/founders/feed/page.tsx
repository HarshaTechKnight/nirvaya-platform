import { createClient } from '@/lib/supabase/server'
import Feed from './Feed'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(full_name, role, headline, company)')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <Feed initialPosts={posts || []} currentUser={profile}/>
}