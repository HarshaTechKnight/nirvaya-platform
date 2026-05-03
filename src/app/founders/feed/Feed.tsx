'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

const POST_TYPES = ['idea', 'update', 'looking-for', 'milestone'] as const

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Feed({ initialPosts, currentUser }: { initialPosts: any[]; currentUser: any }) {
  const supabase = createClient()
  const [posts, setPosts] = useState(initialPosts)
  const [draft, setDraft] = useState('')
  const [postType, setPostType] = useState<typeof POST_TYPES[number]>('idea')
  const [tags, setTags] = useState('')
  const [posting, setPosting] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  async function handlePost() {
    if (!draft.trim() || !currentUser) return
    setPosting(true)
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        content: draft,
        post_type: postType,
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        likes_count: 0,
      } as any)
      .select('*, profiles(full_name, role, headline, company)')
      .single()
    if (!error && data) {
      setPosts([data, ...posts])
      setDraft('')
      setTags('')
    }
    setPosting(false)
  }

  async function handleLike(postId: string) {
    if (!currentUser) return
    const isLiked = liked[postId]
    setLiked(prev => ({ ...prev, [postId]: !isLiked }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p))
    if (isLiked) {
      await supabase.rpc('decrement_likes', { post_id: postId })
      await supabase.from('post_likes').delete().eq('user_id', currentUser.id).eq('post_id', postId)
    } else {
      await supabase.rpc('increment_likes', { post_id: postId })
      await supabase.from('post_likes').insert({ user_id: currentUser.id, post_id: postId } as any)
    }
  }

  return (
    <>
      <TopBar title="Feed" profile={currentUser}/>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Composer */}
        <div className="bg-white border border-line/50 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal text-cream flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getInitials(currentUser?.full_name)}
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Share an update, idea, or what you're looking for..."
              className="flex-1 bg-cream/50 border border-line rounded-lg p-3 text-sm outline-none focus:border-teal resize-none min-h-[80px]"
            />
          </div>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full bg-cream/50 border border-line rounded-lg px-3 py-2 text-xs outline-none focus:border-teal mb-3"
          />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {POST_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setPostType(t)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    postType === t
                      ? 'border-teal text-teal bg-teal-light/40'
                      : 'border-line text-muted hover:border-teal/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={handlePost}
              disabled={!draft.trim() || posting}
              className="px-5 py-2 bg-teal text-cream text-sm font-medium rounded-lg hover:bg-teal-dark disabled:opacity-40"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-line/50 rounded-2xl p-5 mb-3 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-teal-dark text-cream flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {getInitials(post.profiles?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-ink">{post.profiles?.full_name}</span>
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                    {(post.profiles?.role || '').toUpperCase()}
                  </span>
                  <span className="text-xs text-muted">· {timeAgo(post.created_at)}</span>
                </div>
                {post.profiles?.headline && (
                  <div className="text-xs text-muted mt-0.5">{post.profiles.headline}</div>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted bg-cream-dark px-2 py-1 rounded">
                {post.post_type}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink mb-3 whitespace-pre-line">{post.content}</p>
            {post.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {post.tags.map((t: string) => (
                  <span key={t} className="text-xs bg-cream border border-line px-2.5 py-1 rounded text-muted">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-5 pt-3 border-t border-line/40">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  liked[post.id] ? 'text-rust' : 'text-muted hover:text-teal'
                }`}
              >
                ❤ {post.likes_count}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted hover:text-teal">
                💬 Reply
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted hover:text-teal">
                🔗 Share
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">
            No posts yet. Be the first to share something with the community.
          </div>
        )}
      </div>
    </>
  )
}