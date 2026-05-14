import { createClient } from '@/lib/supabase/server'
import Feed from '../../founders/feed/Feed'

export const dynamic = 'force-dynamic'

export default async function MentorFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(full_name, role, headline, company, avatar_url),
      original_post:posts!original_post_id(
        *,
        profiles(full_name, role, headline, company, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: userReactions } = await supabase
    .from('post_reactions')
    .select('post_id, reaction')
    .eq('user_id', user!.id)

  const postIds = (posts || []).map(p => p.id)
  const { data: allReactions } = postIds.length > 0
    ? await supabase
        .from('post_reactions')
        .select('post_id, reaction')
        .in('post_id', postIds)
    : { data: [] }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: suggestedPeople } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, company, avatar_url')
    .eq('is_profile_complete', true)
    .neq('id', user!.id)
    .in('role', ['founder', 'co-founder', 'freelancer', 'biz-owner'])
    .limit(5)

  const { count: postsCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const reactionMap: Record<string, string> = {}
  ;(userReactions || []).forEach(r => {
    reactionMap[r.post_id] = r.reaction
  })

  const postReactionTypes: Record<string, string[]> = {}
  ;(allReactions || []).forEach(r => {
    if (!postReactionTypes[r.post_id]) postReactionTypes[r.post_id] = []
    if (!postReactionTypes[r.post_id].includes(r.reaction)) {
      postReactionTypes[r.post_id].push(r.reaction)
    }
  })

  return (
    <Feed
      initialPosts={posts || []}
      initialReactions={reactionMap}
      initialReactionTypes={postReactionTypes}
      currentUser={profile}
      suggestedPeople={suggestedPeople || []}
      postsCount={postsCount || 0}
    />
  )
}