'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

const POST_TYPES = ['idea', 'update', 'looking-for', 'milestone'] as const

const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { key: 'support', emoji: '🤝', label: 'Support' },
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'insightful', emoji: '💡', label: 'Insightful' },
  { key: 'funny', emoji: '😄', label: 'Funny' },
] as const

type ReactionKey = typeof REACTIONS[number]['key']

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  if (s < 604800) return Math.floor(s / 86400) + 'd'
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function EmbeddedPost({ post }: { post: any }) {
  if (!post) return <div className="bg-cream/50 border border-line/50 rounded-xl p-3 sm:p-4 text-xs text-muted italic text-center">Original post unavailable</div>
  return (
    <div className="bg-gradient-to-br from-cream to-cream-dark/30 border border-line/50 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-2.5 mb-2">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${getGradient(post.profiles?.full_name || 'U')} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shadow-sm shrink-0`}>
          {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(post.profiles?.full_name)}
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-[11px] sm:text-xs text-ink">{post.profiles?.full_name}</span>
          <span className="text-[8px] sm:text-[9px] font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded-full bg-teal-light/60 text-teal-dark ml-1">{(post.profiles?.role || 'founder').toUpperCase()}</span>
          <span className="text-[9px] sm:text-[10px] text-muted ml-1">· {timeAgo(post.created_at)}</span>
        </div>
      </div>
      <p className="text-[11px] sm:text-xs text-ink-soft whitespace-pre-line line-clamp-3">{post.content}</p>
    </div>
  )
}

function CommentSection({ postId, currentUser, onClose }: { postId: string; currentUser: any; onClose: () => void }) {
  const supabase = createClient()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => { loadComments() }, [postId])

  async function loadComments() {
    const { data } = await supabase.from('comments').select(`*, profiles(full_name, role, headline, avatar_url)`).eq('post_id', postId).order('created_at', { ascending: true }).limit(10)
    setComments(data || [])
    setLoading(false)
  }

  async function handlePost() {
    if (!newComment.trim() || posting) return
    setPosting(true)
    await supabase.from('comments').insert({ post_id: postId, user_id: currentUser.id, content: newComment.trim(), parent_id: null } as any)
    setNewComment(''); loadComments(); setPosting(false)
  }

  return (
    <div className="border-t border-line/20 pt-3 sm:pt-4 mt-2">
      <div className="flex items-start gap-2 sm:gap-2.5 mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shrink-0`}>
          {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(currentUser?.full_name)}
        </div>
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
          <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() }}}
            placeholder="Add a comment..." className="flex-1 bg-cream/60 border border-line/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm outline-none focus:border-teal transition-all" />
          <button onClick={handlePost} disabled={!newComment.trim() || posting} className="text-xs sm:text-sm text-teal font-semibold disabled:opacity-40 shrink-0">{posting ? '...' : 'Post'}</button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{['','',''].map((_,i)=><div key={i} className="flex gap-2 sm:gap-2.5 animate-pulse"><div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cream-dark shrink-0"/><div className="flex-1 bg-cream-dark/50 rounded-xl h-8 sm:h-10"/></div>)}</div>
      ) : comments.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-muted text-center py-3 sm:py-4">No comments yet</p>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2 sm:gap-2.5">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${getGradient(c.profiles?.full_name || 'U')} flex items-center justify-center text-cream text-[9px] sm:text-[10px] font-semibold shrink-0`}>
                {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(c.profiles?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-cream/60 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-semibold text-ink">{c.profiles?.full_name}</span>
                    <span className="text-[8px] sm:text-[9px] text-muted">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-soft">{c.content}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 px-1">
                  <button className="text-[9px] sm:text-[10px] text-muted hover:text-ink">Like</button>
                  <button className="text-[9px] sm:text-[10px] text-muted hover:text-ink">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Feed({
  initialPosts, initialReactions, initialReactionTypes, currentUser,
}: {
  initialPosts: any[]
  initialReactions: Record<string, string>
  initialReactionTypes: Record<string, string[]>
  currentUser: any
}) {
  const supabase = createClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [posts, setPosts] = useState(initialPosts)
  const [reactions, setReactions] = useState<Record<string, string>>(initialReactions || {})
  const [draft, setDraft] = useState('')
  const [postType, setPostType] = useState<typeof POST_TYPES[number]>('idea')
  const [tags, setTags] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({})
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null)
  const [activeRepostMenu, setActiveRepostMenu] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [draft])

  async function handlePost() {
    if (!draft.trim() || !currentUser) return
    setPosting(true)
    const { data, error: insertError } = await supabase.from('posts').insert({
      user_id: currentUser.id, content: draft.trim(), post_type: postType,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    } as any).select(`*, profiles(full_name, role, headline, company, avatar_url)`).single()
    if (insertError) { setError(insertError.message); setPosting(false); return }
    if (data) { setPosts([data, ...posts]); setDraft(''); setTags(''); setShareToast('✨ Post published!'); setTimeout(() => setShareToast(null), 2000) }
    setPosting(false)
  }

  async function handleQuickRepost(post: any) {
    if (!currentUser) return
    setActiveRepostMenu(null)
    const originalId = post.original_post_id || post.id
    const { data, error: repostErr } = await supabase.from('posts').insert({
      user_id: currentUser.id, content: '', post_type: 'update', tags: [], is_repost: true, original_post_id: originalId,
    } as any).select(`*, profiles(full_name, role, headline, company, avatar_url), original_post:posts!original_post_id(*, profiles(full_name, role, headline, company, avatar_url))`).single()
    if (repostErr) setShareToast('Repost failed')
    else if (data) { setPosts([data, ...posts]); setShareToast('🔄 Reposted!'); setTimeout(() => setShareToast(null), 2500) }
  }

  async function handleReact(postId: string, reaction: ReactionKey) {
    if (!currentUser) return
    const current = reactions[postId]
    setActiveReactionPicker(null)
    if (current === reaction) {
      setReactions(prev => { const n = { ...prev }; delete n[postId]; return n })
      await supabase.from('post_reactions').delete().eq('user_id', currentUser.id).eq('post_id', postId)
    } else {
      if (current) await supabase.from('post_reactions').delete().eq('user_id', currentUser.id).eq('post_id', postId)
      setReactions(prev => ({ ...prev, [postId]: reaction }))
      await supabase.from('post_reactions').insert({ user_id: currentUser.id, post_id: postId, reaction } as any)
    }
  }

  async function copyLink(postId: string) {
    const url = window.location.origin + (currentUser?.role === 'mentor' ? '/mentors/feed/' : '/founders/feed/') + postId
    try { await navigator.clipboard.writeText(url); setShareToast('📋 Link copied!'); setTimeout(() => setShareToast(null), 2500) }
    catch { setShareToast('Could not copy'); setTimeout(() => setShareToast(null), 2500) }
  }

  function toggleSave(postId: string) {
    setSavedPosts(prev => { const s = !prev[postId]; setShareToast(s ? '🔖 Saved!' : 'Removed'); setTimeout(() => setShareToast(null), 2000); return { ...prev, [postId]: s } })
  }

  async function handleDelete(postId: string) {
    setShowDeleteConfirm(null)
    const { error: delErr } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', currentUser.id)
    if (delErr) setShareToast('Delete failed')
    else { setPosts(prev => prev.filter(p => p.id !== postId)); setShareToast('🗑️ Post deleted') }
    setTimeout(() => setShareToast(null), 2500)
  }

  const portalPath = currentUser?.role === 'mentor' ? '/mentors/feed' : '/founders/feed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream w-full">
      <TopBar title="Feed" profile={currentUser} />
      
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 w-full">

        {/* COMPOSER */}
        <div className="bg-white border border-line/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-5 shadow-sm">
          <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream text-xs sm:text-sm font-semibold shadow-md shrink-0`}>
              {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(currentUser?.full_name)}
            </div>
            <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)}
              placeholder="Share your startup journey..." rows={1}
              className="flex-1 text-xs sm:text-sm outline-none resize-none min-h-[40px] sm:min-h-[44px] leading-relaxed pt-1.5 sm:pt-2" />
          </div>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Add tags (comma separated)"
            className="w-full bg-cream/50 border border-line/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs outline-none focus:border-teal transition-all mb-3 sm:mb-4" />
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] sm:text-xs p-2.5 sm:p-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4">{error}</div>}
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              {POST_TYPES.map(t => (
                <button key={t} onClick={() => setPostType(t)}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all border ${postType === t ? 'border-teal bg-teal text-cream shadow-sm' : 'border-line bg-white text-muted hover:border-teal/50'}`}>
                  {t === 'idea' && '💡'}{t === 'update' && '📣'}{t === 'looking-for' && '🔍'}{t === 'milestone' && '🎯'} <span className="hidden sm:inline">{t}</span>
                </button>
              ))}
            </div>
            <button onClick={handlePost} disabled={!draft.trim() || posting}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-teal to-teal-dark text-cream text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:shadow-lg disabled:opacity-40 transition-all">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* POSTS */}
        <div className="space-y-3 sm:space-y-4">
          {posts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
              <h3 className="font-display text-xl sm:text-2xl text-ink mb-1 sm:mb-2">No posts yet</h3>
              <p className="text-xs sm:text-sm text-muted">Be the first to share!</p>
            </div>
          )}

          {posts.map((post, index) => {
            const isOwner = post.user_id === currentUser?.id
            const myReaction = reactions[post.id]
            const reactionData = myReaction ? REACTIONS.find(r => r.key === myReaction) : null
            const isRepost = post.is_repost && post.original_post
            const showComments = expandedComments === post.id
            const gradient = getGradient(post.profiles?.full_name || 'U')

            return (
              <article key={post.id} 
                className="bg-white border border-line/50 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 animate-fade-up w-full"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>

                {isRepost && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted px-3 sm:px-5 pt-3 sm:pt-4 pb-1.5 sm:pb-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span className="font-medium truncate">{post.profiles?.full_name}</span> reposted
                  </div>
                )}

                <div className="p-3 sm:p-5">
                  {/* HEADER */}
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-xs sm:text-sm font-semibold shadow-md shrink-0 overflow-hidden`}>
                      {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(post.profiles?.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-ink truncate max-w-[120px] sm:max-w-[200px]">{post.profiles?.full_name}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-light/60 text-teal-dark border border-teal/20 shrink-0">
                          {(post.profiles?.role || 'founder').toUpperCase().slice(0, 8)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted shrink-0">· {timeAgo(post.created_at)}</span>
                      </div>
                      {post.profiles?.headline && <p className="text-[10px] sm:text-xs text-muted mt-0.5 truncate">{post.profiles.headline}</p>}
                      {!isRepost && (
                        <span className="inline-block text-[9px] sm:text-[10px] font-medium mt-1 px-1.5 sm:px-2 py-0.5 rounded bg-cream-dark/40 text-ink-soft">
                          {post.post_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  {post.content && <p className="text-xs sm:text-sm leading-relaxed text-ink mb-2 sm:mb-3 whitespace-pre-line break-words">{post.content}</p>}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-3">
                      {post.tags.map((t: string) => <span key={t} className="text-[10px] sm:text-xs bg-cream border border-line/30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-ink-soft">#{t}</span>)}
                    </div>
                  )}

                  {/* Embedded post */}
                  {isRepost && <div className="mb-2 sm:mb-3"><EmbeddedPost post={post.original_post} /></div>}

                  {/* Save + Copy link */}
                  <div className="flex items-center gap-1 mb-2 border-b border-line/20 pb-2 sm:pb-3 flex-wrap">
                    <button onClick={() => toggleSave(post.id)}
                      className="text-[10px] sm:text-xs text-muted hover:text-teal font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-cream transition-colors">
                      {savedPosts[post.id] ? 'Saved' : 'Save post'}
                    </button>
                    <span className="text-line text-[10px]">·</span>
                    <button onClick={() => copyLink(post.id)}
                      className="text-[10px] sm:text-xs text-muted hover:text-teal font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-cream transition-colors">
                      Copy link
                    </button>
                    {isOwner && (
                      <>
                        <span className="text-line text-[10px]">·</span>
                        <button onClick={() => setShowDeleteConfirm(post.id)}
                          className="text-[10px] sm:text-xs text-muted hover:text-rust font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-cream transition-colors">
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1">
                      <button onClick={() => { if (myReaction) handleReact(post.id, myReaction as ReactionKey); else setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id) }}
                        onMouseEnter={() => !myReaction && setActiveReactionPicker(post.id)}
                        className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${reactionData ? 'text-teal bg-teal-light/30' : 'text-ink-soft hover:bg-cream-dark/30'}`}>
                        <span className="text-base sm:text-lg">{reactionData?.emoji || '👍'}</span>
                        <span className="hidden xs:inline">{reactionData?.label || 'Like'}</span>
                      </button>
                      {(activeReactionPicker === post.id && !myReaction) && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-line rounded-2xl shadow-2xl px-1.5 sm:px-2 py-1.5 sm:py-2 flex gap-0.5 z-30" onMouseLeave={() => setActiveReactionPicker(null)}>
                          {REACTIONS.map(r => (
                            <button key={r.key} onClick={e => { e.stopPropagation(); handleReact(post.id, r.key) }}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-cream-dark flex items-center justify-center text-lg sm:text-xl hover:scale-125 transition-all" title={r.label}>{r.emoji}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={() => setExpandedComments(showComments ? null : post.id)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-ink-soft hover:bg-cream-dark/30 transition-all">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      <span className="hidden xs:inline">Comment</span>
                    </button>

                    <div className="relative flex-1">
                      <button onClick={() => setActiveRepostMenu(activeRepostMenu === post.id ? null : post.id)}
                        className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-ink-soft hover:bg-cream-dark/30 transition-all">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
                        <span className="hidden xs:inline">Repost</span>
                      </button>
                      {activeRepostMenu === post.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveRepostMenu(null)}/>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 bg-white border border-line rounded-2xl shadow-2xl z-40 overflow-hidden py-1 animate-fade-up">
                            <button onClick={() => handleQuickRepost(post)} className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink-soft hover:bg-cream">🔄 Quick repost</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* COMMENTS */}
                  {showComments && <CommentSection postId={post.id} currentUser={currentUser} onClose={() => setExpandedComments(null)} />}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-xs sm:max-w-sm w-full mx-4 animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-base sm:text-lg text-ink mb-1 sm:mb-2">Delete post?</h3>
            <p className="text-xs sm:text-sm text-muted mb-5 sm:mb-6">This action cannot be undone.</p>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 sm:py-2.5 border-2 border-line rounded-xl text-xs sm:text-sm font-medium hover:bg-cream">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2 sm:py-2.5 bg-rust text-cream rounded-xl text-xs sm:text-sm font-medium hover:bg-rust-dark">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {shareToast && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ink to-ink-soft text-cream px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium z-50 animate-fade-up whitespace-nowrap">{shareToast}</div>
      )}
    </div>
  )
}