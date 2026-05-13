'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

const POST_TYPES = ['idea', 'update', 'looking-for', 'milestone'] as const

const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like', color: 'from-blue-500 to-blue-600' },
  { key: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'from-yellow-500 to-orange-500' },
  { key: 'support', emoji: '🤝', label: 'Support', color: 'from-teal-500 to-teal-600' },
  { key: 'love', emoji: '❤️', label: 'Love', color: 'from-red-500 to-pink-500' },
  { key: 'insightful', emoji: '💡', label: 'Insightful', color: 'from-purple-500 to-indigo-600' },
  { key: 'funny', emoji: '😄', label: 'Funny', color: 'from-green-500 to-emerald-500' },
] as const

type ReactionKey = typeof REACTIONS[number]['key']

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${Math.floor(s / 10) * 10}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal-400 to-teal-600', 'from-rust-400 to-rust-600',
    'from-purple-400 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function EmbeddedPost({ post }: { post: any }) {
  if (!post) return <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-400 italic text-center">Original post unavailable</div>
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(post.profiles?.full_name || 'U')} flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 overflow-hidden`}>
          {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(post.profiles?.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-gray-900">{post.profiles?.full_name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">{(post.profiles?.role || 'founder').toUpperCase()}</span>
            <span className="text-[9px] text-gray-400">· {timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-2">{post.content}</p>
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
    <div className="border-t border-gray-100 pt-4 mt-3">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 overflow-hidden`}>
          {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(currentUser?.full_name)}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() }}}
            placeholder="Write a comment..." 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all" 
          />
          <button 
            onClick={handlePost} 
            disabled={!newComment.trim() || posting} 
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
          >
            {posting ? '...' : 'Post'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"/>
              <div className="flex-1 bg-gray-100 rounded-xl h-12"/>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(c.profiles?.full_name || 'U')} flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 overflow-hidden`}>
                {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(c.profiles?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-900">{c.profiles?.full_name}</span>
                    <span className="text-[9px] text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-2">
                  <button className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Like</button>
                  <button className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">Reply</button>
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
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

  const reactionCounts = posts.reduce((acc, post) => {
    acc[post.id] = initialReactionTypes[post.id]?.length || 0
    return acc
  }, {} as Record<string, number>)

  const commentCounts = posts.reduce((acc, post) => {
    acc[post.id] = post.comments?.length || 0
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <TopBar title="Feed" profile={currentUser} />
      
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm mb-3">
            <span className="text-lg">🚀</span>
            <span className="text-xs font-medium text-gray-600">Community Feed</span>
          </div>
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
            Share Your <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">Journey</span>
          </h1>
          <p className="text-sm text-gray-500">Connect, share, and grow with fellow entrepreneurs</p>
        </div>

        {/* COMPOSER */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0 overflow-hidden`}>
                {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(currentUser?.full_name)}
              </div>
              <textarea 
                ref={textareaRef} 
                value={draft} 
                onChange={e => setDraft(e.target.value)}
                placeholder="What's on your mind? Share your startup journey..." 
                rows={1}
                className="flex-1 text-sm outline-none resize-none min-h-[44px] leading-relaxed pt-2 text-gray-700 placeholder:text-gray-400"
              />
            </div>
            
            <input 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              placeholder="Add tags (e.g., startup, funding, growth) - comma separated"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-teal-400 focus:bg-white transition-all mb-4"
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {POST_TYPES.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      postType === t 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">
                      {t === 'idea' && '💡'}
                      {t === 'update' && '📣'}
                      {t === 'looking-for' && '🔍'}
                      {t === 'milestone' && '🎯'}
                    </span>
                    <span className="hidden sm:inline">{t}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={handlePost} 
                disabled={!draft.trim() || posting}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
              >
                {posting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Posting...
                  </div>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* POSTS */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center">
                  <span className="text-5xl animate-bounce">🚀</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">No posts yet</h3>
              <p className="text-sm text-gray-500">Be the first to share something with the community!</p>
            </div>
          )}

          {posts.map((post, index) => {
            const isOwner = post.user_id === currentUser?.id
            const myReaction = reactions[post.id]
            const reactionData = myReaction ? REACTIONS.find(r => r.key === myReaction) : null
            const isRepost = post.is_repost && post.original_post
            const showComments = expandedComments === post.id
            const gradient = getGradient(post.profiles?.full_name || 'U')
            const reactionCount = reactionCounts[post.id] || 0
            const commentCount = commentCounts[post.id] || 0

            return (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-5">
                  {/* HEADER */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0 overflow-hidden`}>
                      {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(post.profiles?.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-900">{post.profiles?.full_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                          {(post.profiles?.role || 'founder').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">· {timeAgo(post.created_at)}</span>
                      </div>
                      {post.profiles?.headline && (
                        <p className="text-xs text-gray-500 truncate">{post.profiles.headline}</p>
                      )}
                      {!isRepost && (
                        <div className="inline-block mt-1.5">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {post.post_type}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* More options */}
                    {isOwner && (
                      <button 
                        onClick={() => setShowDeleteConfirm(post.id)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* CONTENT */}
                  {post.content && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-line break-words">
                      {post.content}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {post.tags.map((t: string) => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Embedded post */}
                  {isRepost && <div className="mb-3"><EmbeddedPost post={post.original_post} /></div>}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-100">
                    <button className="text-xs text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {reactionCount} reactions
                    </button>
                    <button className="text-xs text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {commentCount} comments
                    </button>
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex items-center gap-2">
                    {/* Reaction Button */}
                    <div className="relative flex-1">
                      <button 
                        onClick={() => { 
                          if (myReaction) handleReact(post.id, myReaction as ReactionKey)
                          else setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id)
                        }}
                        onMouseEnter={() => !myReaction && setActiveReactionPicker(post.id)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          reactionData 
                            ? `bg-gradient-to-r ${reactionData.color} text-white shadow-md` 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{reactionData?.emoji || '👍'}</span>
                        <span>{reactionData?.label || 'Like'}</span>
                      </button>
                      
                      {activeReactionPicker === post.id && !myReaction && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveReactionPicker(null)} />
                          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex gap-1 z-30 animate-fade-up">
                            {REACTIONS.map(r => (
                              <button
                                key={r.key}
                                onClick={() => handleReact(post.id, r.key)}
                                className={`w-10 h-10 rounded-xl hover:bg-gradient-to-r ${r.color} hover:text-white hover:scale-110 transition-all duration-300 flex items-center justify-center text-xl`}
                                title={r.label}
                              >
                                {r.emoji}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Comment Button */}
                    <button 
                      onClick={() => setExpandedComments(showComments ? null : post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment
                    </button>

                    {/* Repost Button */}
                    <div className="relative flex-1">
                      <button 
                        onClick={() => setActiveRepostMenu(activeRepostMenu === post.id ? null : post.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Repost
                      </button>
                      
                      {activeRepostMenu === post.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveRepostMenu(null)} />
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-30 animate-fade-up">
                            <button 
                              onClick={() => handleQuickRepost(post)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent transition-all"
                            >
                              🔄 Quick repost
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Save Button */}
                    <button 
                      onClick={() => toggleSave(post.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                      title={savedPosts[post.id] ? 'Saved' : 'Save'}
                    >
                      <svg className="w-5 h-5" fill={savedPosts[post.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>

                    {/* Share Button */}
                    <button 
                      onClick={() => copyLink(post.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                      title="Copy link"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>

                  {/* COMMENTS SECTION */}
                  {showComments && (
                    <CommentSection postId={post.id} currentUser={currentUser} onClose={() => setExpandedComments(null)} />
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl opacity-10"></div>
              <div className="relative p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl animate-shake">🗑️</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Delete post?</h3>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone. This post will be permanently removed.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-gray-900 backdrop-blur-lg text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="text-lg">{shareToast.charAt(0)}</span>
            <span className="text-sm font-medium">{shareToast.substring(2)}</span>
            <div className="w-1 h-4 bg-teal-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}