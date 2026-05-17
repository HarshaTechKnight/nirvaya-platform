'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

type Profile = {
  id: string
  full_name: string
  role: string
  headline?: string
  company?: string
  avatar_url?: string
}

type Post = {
  id: string
  user_id: string
  content: string
  image_url?: string
  original_post_id?: string
  is_repost?: boolean
  post_type?: string
  tags?: string[]
  reactions_count: number
  comments_count: number
  created_at: string
  profiles?: Profile
  original_post?: Post
}

type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { key: 'support', emoji: '🤝', label: 'Support' },
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'insightful', emoji: '💡', label: 'Insightful' },
  { key: 'funny', emoji: '😄', label: 'Funny' },
]

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  if (s < 604800) return Math.floor(s / 86400) + 'd'
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function Feed({
  initialPosts,
  initialReactions,
  currentUser,
  suggestedPeople,
  postsCount,
}: {
  initialPosts: Post[]
  initialReactions: Record<string, string>
  currentUser: Profile
  suggestedPeople: Profile[]
  postsCount: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [reactions, setReactions] = useState<Record<string, string>>(initialReactions)
  const [composerOpen, setComposerOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [postType, setPostType] = useState('idea')
  const [tags, setTags] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [showRepostMenu, setShowRepostMenu] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [repostModalPost, setRepostModalPost] = useState<Post | null>(null)
  const [repostDraft, setRepostDraft] = useState('')
  const [reposting, setReposting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({})
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messagingPath = currentUser?.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging'
  const feedPath = currentUser?.role === 'mentor' ? '/mentors/feed' : '/founders/feed'

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // Fetch comment counts
  useEffect(() => {
    const fetchCommentCounts = async () => {
      if (posts.length === 0) return
      const counts: Record<string, number> = {}
      
      for (const post of posts) {
        try {
          const { count, error } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
          
          if (!error && count !== null) {
            counts[post.id] = count
          } else {
            counts[post.id] = 0
          }
        } catch (err) {
          console.error('Error fetching comment count:', err)
          counts[post.id] = 0
        }
      }
      setCommentCounts(counts)
    }
    fetchCommentCounts()
  }, [posts])

  // Fetch comments for a specific post
  async function fetchComments(postId: string) {
    if (loadingComments[postId] || expandedComments[postId]) return
    
    setLoadingComments((prev: Record<string, boolean>) => ({ ...prev, [postId]: true }))
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            id,
            full_name,
            role,
            headline,
            company,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching comments:', error)
        showToast('Failed to load comments', 'error')
        setExpandedComments((prev: Record<string, Comment[]>) => ({ ...prev, [postId]: [] }))
      } else if (data) {
        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profiles: comment.profiles as unknown as Profile
        })) as Comment[]
        setExpandedComments((prev: Record<string, Comment[]>) => ({ ...prev, [postId]: commentsWithProfiles }))
      }
    } catch (err) {
      console.error('Unexpected error fetching comments:', err)
      showToast('Failed to load comments', 'error')
      setExpandedComments((prev: Record<string, Comment[]>) => ({ ...prev, [postId]: [] }))
    } finally {
      setLoadingComments((prev: Record<string, boolean>) => ({ ...prev, [postId]: false }))
    }
  }

  // Submit a comment
  async function submitComment(postId: string) {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    
    setSubmittingComment((prev: Record<string, boolean>) => ({ ...prev, [postId]: true }))
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error posting comment:', error)
        showToast('Failed to post comment: ' + error.message, 'error')
      } else if (data) {
        const commentWithProfile: Comment = {
          ...data,
          profiles: currentUser
        }
        
        setCommentCounts((prev: Record<string, number>) => ({ 
          ...prev, 
          [postId]: (prev[postId] || 0) + 1 
        }))
        
        setPosts((prev: Post[]) => prev.map(p => 
          p.id === postId 
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        ))
        
        // FIXED: Safely update expandedComments
        setExpandedComments((prev: Record<string, Comment[]>) => {
          const existingComments = prev[postId] || []
          return { ...prev, [postId]: [...existingComments, commentWithProfile] }
        })
        
        setCommentInputs((prev: Record<string, string>) => ({ ...prev, [postId]: '' }))
        showToast('Comment posted!', 'success')
      }
    } catch (err) {
      console.error('Unexpected error posting comment:', err)
      showToast('Failed to post comment', 'error')
    } finally {
      setSubmittingComment((prev: Record<string, boolean>) => ({ ...prev, [postId]: false }))
    }
  }

  // Close menu on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.post-menu-dropdown') && !target.closest('.post-menu-trigger')) {
        setShowMenu(null)
        setMenuPosition(null)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowMenu(null)
        setMenuPosition(null)
        setShowReactionPicker(null)
        setShowRepostMenu(null)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMenu])

  function openMenu(postId: string, e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    e.preventDefault()
    if (showMenu === postId) {
      setShowMenu(null)
      setMenuPosition(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + window.scrollY + 6,
      right: window.innerWidth - rect.right,
    })
    setShowMenu(postId)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)', 'error'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `posts/${currentUser.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('posts').upload(path, imageFile)
    if (error) {
      showToast('Upload failed: ' + error.message, 'error')
      return null
    }
    const { data } = supabase.storage.from('posts').getPublicUrl(path)
    return data.publicUrl
  }

  async function handlePost() {
    if (!draft.trim() && !imageFile) { showToast('Add content or image', 'error'); return }
    if (!currentUser?.id) { showToast('Not logged in', 'error'); return }
    setPosting(true)

    let imageUrl: string | null = null
    if (imageFile) {
      imageUrl = await uploadImage()
      if (!imageUrl) { setPosting(false); return }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        content: draft.trim(),
        image_url: imageUrl,
        post_type: postType,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_repost: false,
        reactions_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          role,
          headline,
          company,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Post error:', error)
      showToast('Failed: ' + error.message, 'error')
    } else if (data) {
      setPosts([data as Post, ...posts])
      setDraft('')
      setTags('')
      clearImage()
      setComposerOpen(false)
      showToast('Posted!', 'success')
    }
    setPosting(false)
  }

  async function handleReact(postId: string, reactionKey: string) {
    if (!currentUser?.id) return
    const existing = reactions[postId]
    setShowReactionPicker(null)

    if (existing === reactionKey) {
      setReactions(prev => { const c = { ...prev }; delete c[postId]; return c })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions_count: Math.max(0, p.reactions_count - 1) } : p))
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', currentUser.id)
    } else if (existing) {
      setReactions(prev => ({ ...prev, [postId]: reactionKey }))
      await supabase.from('post_reactions').update({ reaction: reactionKey }).eq('post_id', postId).eq('user_id', currentUser.id)
    } else {
      setReactions(prev => ({ ...prev, [postId]: reactionKey }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions_count: p.reactions_count + 1 } : p))
      await supabase.from('post_reactions').insert({ post_id: postId, user_id: currentUser.id, reaction: reactionKey })
    }
  }

  async function quickRepost(post: Post) {
    if (!currentUser?.id) return
    setShowRepostMenu(null)
    const originalId = post.original_post_id || post.id
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        content: '',
        original_post_id: originalId,
        is_repost: true,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          role,
          headline,
          company,
          avatar_url
        ),
        original_post:original_post_id (
          *,
          profiles:user_id (
            id,
            full_name,
            role,
            headline,
            company,
            avatar_url
          )
        )
      `)
      .single()

    if (error) showToast('Failed: ' + error.message, 'error')
    else if (data) { setPosts([data as Post, ...posts]); showToast('Reposted!', 'success') }
  }

  async function repostWithThoughts() {
    if (!repostModalPost || !currentUser?.id) return
    setReposting(true)
    const originalId = repostModalPost.original_post_id || repostModalPost.id
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        content: repostDraft.trim(),
        original_post_id: originalId,
        is_repost: true,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          role,
          headline,
          company,
          avatar_url
        ),
        original_post:original_post_id (
          *,
          profiles:user_id (
            id,
            full_name,
            role,
            headline,
            company,
            avatar_url
          )
        )
      `)
      .single()

    if (error) showToast('Failed: ' + error.message, 'error')
    else if (data) {
      setPosts([data as Post, ...posts])
      setRepostModalPost(null)
      setRepostDraft('')
      showToast('Posted!', 'success')
    }
    setReposting(false)
  }

  async function deletePost(postId: string) {
    setShowMenu(null)
    setMenuPosition(null)
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) showToast('Failed: ' + error.message, 'error')
    else { setPosts(prev => prev.filter(p => p.id !== postId)); showToast('Deleted', 'success') }
  }

  function copyLink(postId: string) {
    setShowMenu(null)
    setMenuPosition(null)
    const url = window.location.origin + feedPath + '/' + postId
    navigator.clipboard.writeText(url)
    showToast('Link copied!', 'success')
  }

  function toggleSave(postId: string) {
    setShowMenu(null)
    setMenuPosition(null)
    const willSave = !savedPosts[postId]
    setSavedPosts(prev => ({ ...prev, [postId]: willSave }))
    showToast(willSave ? 'Saved!' : 'Removed from saved', 'success')
  }

  // Function to toggle comments visibility
  const toggleComments = (postId: string) => {
    if (!expandedComments[postId]) {
      fetchComments(postId)
    }
    setExpandedComments((prev: Record<string, Comment[]>) => {
      if (prev[postId]) {
        const { [postId]: _, ...rest } = prev
        return rest
      } else {
        return { ...prev, [postId]: prev[postId] || [] }
      }
    })
  }

  return (
    <div className="min-h-screen bg-cream w-full">
      <TopBar title="Feed" profile={currentUser} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-4 lg:gap-6">

          {/* LEFT — Profile Card */}
          <div className="hidden lg:block">
            <div className="bg-white border border-line/30 rounded-2xl overflow-hidden shadow-sm sticky top-20">
              <div className="h-16 bg-gradient-to-r from-teal to-teal-dark" />
              <div className="px-4 pb-4 -mt-8 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream font-semibold mb-2`}>
                  {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(currentUser?.full_name || 'U')}
                </div>
                <Link href="/profile" className="font-semibold text-sm text-ink hover:text-teal block">{currentUser?.full_name}</Link>
                <div className="text-xs text-muted mt-0.5 line-clamp-2">{currentUser?.headline || (currentUser?.role || '').toUpperCase()}</div>
              </div>
              <div className="border-t border-line/20 px-4 py-3 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-muted">Posts</span>
                  <span className="font-semibold text-teal">{postsCount}</span>
                </div>
              </div>
              <Link href="/profile" className="block border-t border-line/20 px-4 py-2.5 text-center text-xs font-semibold text-ink-soft hover:bg-cream hover:text-teal transition-colors">
                View Profile
              </Link>
            </div>
          </div>

          {/* CENTER — Composer + Posts */}
          <div className="space-y-3 sm:space-y-4 min-w-0">

            {/* COMPOSER */}
            <div className="bg-white border border-line/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
              {!composerOpen ? (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0`}>
                    {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(currentUser?.full_name || 'U')}
                  </div>
                  <button onClick={() => setComposerOpen(true)} className="flex-1 bg-cream border-2 border-line/50 rounded-full px-5 py-2.5 text-sm text-muted text-left hover:bg-cream-dark/30 transition-colors">
                    Share your startup journey...
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0`}>
                      {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(currentUser?.full_name || 'U')}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-ink">{currentUser?.full_name}</div>
                      <div className="text-xs text-muted">Posting to everyone</div>
                    </div>
                  </div>
                  <textarea ref={textareaRef} autoFocus value={draft} onChange={e => setDraft(e.target.value)} placeholder="What do you want to talk about?" rows={4}
                    className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted mb-3" />
                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-line/30 mb-3 max-h-80">
                      <img src={imagePreview} alt="Preview" className="w-full object-cover" />
                      <button onClick={clearImage} className="absolute top-2 right-2 w-8 h-8 bg-ink/70 hover:bg-ink text-cream rounded-full flex items-center justify-center text-sm">✕</button>
                    </div>
                  )}
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)"
                    className="w-full bg-cream/50 border border-line/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-teal mb-3" />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <div className="flex items-center justify-between border-t border-line/20 pt-3 flex-wrap gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {['idea', 'update', 'looking-for', 'milestone'].map(t => (
                        <button key={t} onClick={() => setPostType(t)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${postType === t ? 'border-teal bg-teal text-cream' : 'border-line bg-white text-muted hover:border-teal/50'}`}>
                          {t === 'idea' && '💡'}{t === 'update' && '📣'}{t === 'looking-for' && '🔍'}{t === 'milestone' && '🎯'} {t}
                        </button>
                      ))}
                      <button onClick={() => fileInputRef.current?.click()}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all flex items-center gap-1 ${imageFile ? 'border-teal bg-teal-light/40 text-teal' : 'border-line bg-white text-muted hover:border-teal/50'}`}>
                        📷 Photo
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setComposerOpen(false); setDraft(''); clearImage(); setTags('') }} className="px-4 py-1.5 text-xs text-muted hover:text-ink">Cancel</button>
                      <button onClick={handlePost} disabled={posting || (!draft.trim() && !imageFile)}
                        className="px-5 py-1.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-full text-xs font-semibold hover:shadow-lg disabled:opacity-40 transition-all">
                        {posting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* POSTS LIST */}
            {posts.length === 0 ? (
              <div className="bg-white border border-line/30 rounded-2xl p-10 sm:p-12 text-center shadow-sm">
                <div className="text-4xl sm:text-5xl mb-3">🚀</div>
                <h3 className="font-display text-lg sm:text-xl text-ink mb-2">No posts yet</h3>
                <p className="text-xs sm:text-sm text-muted">Be the first to share!</p>
              </div>
            ) : (
              posts.map(post => {
                if (!post) return null
                const displayPost = (post.is_repost && post.original_post) ? post.original_post : post
                const author = displayPost?.profiles || post?.profiles
                if (!author) return null

                const myReaction = reactions[post.id]
                const isOwner = post.user_id === currentUser?.id
                const gradient = getGradient(author?.full_name || 'U')
                const commentCount = commentCounts[post.id] || post.comments_count || 0
                const isExpanded = !!expandedComments[post.id]
                const comments = expandedComments[post.id] || []
                const isLoadingComments = loadingComments[post.id]
                const commentInput = commentInputs[post.id] || ''
                const isSubmitting = submittingComment[post.id]

                return (
                  <article key={post.id} className="bg-white border border-line/30 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">

                    {/* REPOST HEADER */}
                    {post.is_repost && (
                      <div className="px-3 sm:px-4 py-2 text-xs text-muted border-b border-line/20 bg-cream/30 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="font-semibold">{post.profiles?.full_name}</span> reposted
                        {post.content && ' with thoughts'}
                      </div>
                    )}

                    {/* REPOST THOUGHTS */}
                    {post.is_repost && post.content && (
                      <div className="px-3 sm:px-4 pt-3 pb-2 text-sm text-ink whitespace-pre-wrap border-b border-line/20">
                        {post.content}
                      </div>
                    )}

                    {/* MAIN CONTENT */}
                    <div className="p-3 sm:p-4">

                      {/* HEADER WITH AUTHOR + 3-DOT MENU */}
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <Link href={`/profile/${author.id}`} className="shrink-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-xs sm:text-sm font-semibold shadow-md overflow-hidden`}>
                            {author?.avatar_url ? (
                              <img src={author.avatar_url} alt={author.full_name} className="w-full h-full object-cover" />
                            ) : getInitials(author?.full_name || 'U')}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <Link href={`/profile/${author.id}`} className="font-semibold text-xs sm:text-sm text-ink hover:text-teal truncate">
                              {author?.full_name}
                            </Link>
                            <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-light/60 text-teal-dark border border-teal/20">
                              {(author?.role || 'founder').toUpperCase().slice(0, 8)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted">· {timeAgo(displayPost.created_at)}</span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted truncate">
                            {author?.headline || author?.company || (author?.role || '').toUpperCase()}
                          </div>
                        </div>

                        {/* 3-DOT BUTTON */}
                        <button
                          onClick={(e) => openMenu(post.id, e)}
                          className="post-menu-trigger w-9 h-9 rounded-full hover:bg-cream-dark/50 flex items-center justify-center text-muted hover:text-ink transition-colors shrink-0 -mr-1 -mt-1"
                          aria-label="Post options"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                          </svg>
                        </button>
                      </div>

                      {/* POST CONTENT */}
                      {!post.is_repost && displayPost.content && (
                        <div className="mt-3 text-sm text-ink whitespace-pre-wrap break-words">
                          {displayPost.content}
                        </div>
                      )}

                      {/* POST IMAGE */}
                      {displayPost.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-line/20">
                          <img src={displayPost.image_url} alt="Post image" className="w-full max-h-96 object-cover" loading="lazy" />
                        </div>
                      )}

                      {/* TAGS */}
                      {displayPost.tags && displayPost.tags.length > 0 && (
                        <div className="mt-3 flex gap-1.5 flex-wrap">
                          {displayPost.tags.map((t: string) => (
                            <span key={t} className="text-[10px] bg-cream border border-line/30 px-2 py-0.5 rounded-full text-ink-soft">#{t}</span>
                          ))}
                        </div>
                      )}

                      {/* STATS */}
                      {(post.reactions_count > 0 || commentCount > 0) && (
                        <div className="mt-3 pt-2 flex items-center justify-between text-[10px] sm:text-xs text-muted border-t border-line/20">
                          <span>{post.reactions_count > 0 ? (post.reactions_count + ' reaction' + (post.reactions_count !== 1 ? 's' : '')) : ''}</span>
                          <button 
                            onClick={() => toggleComments(post.id)}
                            className="hover:text-teal transition-colors"
                          >
                            {commentCount > 0 ? (commentCount + ' comment' + (commentCount !== 1 ? 's' : '')) : ''}
                          </button>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="mt-2 pt-1 grid grid-cols-3 gap-1 border-t border-line/20">

                        {/* REACT */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (myReaction) handleReact(post.id, myReaction)
                              else setShowReactionPicker(showReactionPicker === post.id ? null : post.id)
                            }}
                            onMouseEnter={() => setShowReactionPicker(post.id)}
                            className={`w-full py-2 rounded-lg text-xs font-medium hover:bg-cream-dark/30 transition-colors flex items-center justify-center gap-1 ${myReaction ? 'text-teal' : 'text-ink-soft'}`}
                          >
                            <span className="text-base">{myReaction ? REACTIONS.find(r => r.key === myReaction)?.emoji : '👍'}</span>
                            <span className="hidden sm:inline">{myReaction ? REACTIONS.find(r => r.key === myReaction)?.label : 'Like'}</span>
                          </button>
                          {showReactionPicker === post.id && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-line rounded-2xl shadow-2xl p-1.5 flex gap-0.5 z-30" onMouseLeave={() => setShowReactionPicker(null)}>
                              {REACTIONS.map(r => (
                                <button key={r.key} onClick={() => handleReact(post.id, r.key)}
                                  className={`w-9 h-9 rounded-xl hover:bg-cream-dark flex items-center justify-center text-lg hover:scale-125 transition-all ${myReaction === r.key ? 'bg-teal-light' : ''}`}
                                  title={r.label}>{r.emoji}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* COMMENT BUTTON */}
                        <button
                          onClick={() => {
                            if (!expandedComments[post.id]) {
                              fetchComments(post.id)
                            }
                            toggleComments(post.id)
                            setTimeout(() => {
                              const input = document.getElementById(`comment-input-${post.id}`)
                              input?.focus()
                            }, 100)
                          }}
                          className="py-2 rounded-lg text-xs font-medium text-ink-soft hover:bg-cream-dark/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          <span className="hidden sm:inline">Comment</span>
                        </button>

                        {/* REPOST */}
                        <div className="relative">
                          <button onClick={() => setShowRepostMenu(showRepostMenu === post.id ? null : post.id)}
                            className="w-full py-2 rounded-lg text-xs font-medium text-ink-soft hover:bg-cream-dark/30 transition-colors flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
                            </svg>
                            <span className="hidden sm:inline">Repost</span>
                          </button>
                          {showRepostMenu === post.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setShowRepostMenu(null)} />
                              <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-line rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                <button onClick={() => quickRepost(post)} className="w-full text-left px-4 py-2.5 text-sm text-ink-soft hover:bg-cream">
                                  🔄 Quick repost
                                </button>
                                <button onClick={() => { setShowRepostMenu(null); setRepostModalPost(post) }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-ink-soft hover:bg-cream border-t border-line/20">
                                  ✏️ Repost with thoughts
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* COMMENTS SECTION - EXPANDABLE */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-line/20">
                          {/* Comments List */}
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {isLoadingComments ? (
                              <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
                              </div>
                            ) : comments.length === 0 ? (
                              <p className="text-xs text-muted text-center py-4">No comments yet. Be the first to comment!</p>
                            ) : (
                              comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                  <Link href={`/profile/${comment.user_id}`} className="shrink-0">
                                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(comment.profiles?.full_name || 'U')} flex items-center justify-center text-cream text-[10px] font-semibold overflow-hidden`}>
                                      {comment.profiles?.avatar_url ? (
                                        <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                      ) : getInitials(comment.profiles?.full_name || 'U')}
                                    </div>
                                  </Link>
                                  <div className="flex-1">
                                    <div className="bg-cream/50 rounded-xl px-3 py-2">
                                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                        <Link href={`/profile/${comment.user_id}`} className="font-semibold text-xs text-ink hover:text-teal">
                                          {comment.profiles?.full_name}
                                        </Link>
                                        <span className="text-[10px] text-muted">· {timeAgo(comment.created_at)}</span>
                                      </div>
                                      <p className="text-xs text-ink whitespace-pre-wrap break-words">{comment.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment Input */}
                          <div className="mt-3 flex gap-2 items-start">
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(currentUser?.full_name || 'U')} flex items-center justify-center text-cream text-[10px] font-semibold overflow-hidden shrink-0`}>
                              {currentUser?.avatar_url ? (
                                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : getInitials(currentUser?.full_name || 'U')}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                id={`comment-input-${post.id}`}
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInputs((prev: Record<string, string>) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey && commentInput.trim()) {
                                    e.preventDefault()
                                    submitComment(post.id)
                                  }
                                }}
                                placeholder="Add a comment..."
                                className="flex-1 bg-cream border border-line/50 rounded-full px-4 py-2 text-xs outline-none focus:border-teal focus:bg-white transition-colors"
                              />
                              <button
                                onClick={() => submitComment(post.id)}
                                disabled={!commentInput.trim() || isSubmitting}
                                className="px-4 py-2 bg-teal text-cream rounded-full text-xs font-semibold hover:bg-teal-dark disabled:opacity-40 transition-colors"
                              >
                                {isSubmitting ? '...' : 'Post'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          {/* RIGHT — SUGGESTIONS */}
          <div className="hidden lg:block">
            <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-5 shadow-sm sticky top-20">
              <h3 className="font-display text-base text-ink mb-3">People you may know</h3>
              <div className="space-y-3">
                {suggestedPeople.length === 0 ? (
                  <p className="text-xs text-muted">No suggestions yet.</p>
                ) : (
                  suggestedPeople.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(p.full_name)} flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0`}>
                        {p.avatar_url ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" /> : getInitials(p.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${p.id}`} className="font-semibold text-xs text-ink hover:text-teal block truncate">
                          {p.full_name}
                        </Link>
                        <div className="text-[10px] text-muted truncate">{p.headline || (p.role || '').toUpperCase()}</div>
                      </div>
                      <Link href={`${messagingPath}?to=${p.id}`} className="text-[10px] text-teal font-medium hover:underline shrink-0">
                        Connect
                      </Link>
                    </div>
                  ))
                )}
              </div>
              <Link href={currentUser?.role === 'mentor' ? '/mentors/search' : '/founders/search'}
                className="block mt-4 pt-3 border-t border-line/20 text-center text-xs font-semibold text-teal hover:text-teal-dark">
                See more
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* PORTAL-STYLE FIXED MENU DROPDOWN */}
      {showMenu && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => { setShowMenu(null); setMenuPosition(null) }}
          />

          <div
            className="post-menu-dropdown fixed z-50 w-52 bg-white border border-line rounded-xl shadow-2xl overflow-hidden py-1"
            style={{
              top: menuPosition.top + 'px',
              right: menuPosition.right + 'px',
            }}
          >
            <button
              onClick={() => toggleSave(showMenu)}
              className="w-full text-left px-4 py-2.5 text-sm text-ink-soft hover:bg-cream flex items-center gap-3 transition-colors"
            >
              <span className="text-base">{savedPosts[showMenu] ? '🔖' : '📑'}</span>
              <span>{savedPosts[showMenu] ? 'Unsave post' : 'Save post'}</span>
            </button>

            <button
              onClick={() => copyLink(showMenu)}
              className="w-full text-left px-4 py-2.5 text-sm text-ink-soft hover:bg-cream flex items-center gap-3 transition-colors border-t border-line/20"
            >
              <span className="text-base">🔗</span>
              <span>Copy link</span>
            </button>

            {posts.find(p => p.id === showMenu)?.user_id === currentUser?.id && (
              <button
                onClick={() => deletePost(showMenu)}
                className="w-full text-left px-4 py-2.5 text-sm text-rust hover:bg-rust-soft/30 flex items-center gap-3 transition-colors border-t border-line/20"
              >
                <span className="text-base">🗑️</span>
                <span>Delete post</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* REPOST MODAL */}
      {repostModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm" onClick={() => { setRepostModalPost(null); setRepostDraft('') }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-line/30 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Repost with thoughts</h3>
              <button onClick={() => { setRepostModalPost(null); setRepostDraft('') }} className="w-8 h-8 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted text-lg">✕</button>
            </div>
            <div className="p-5">
              <textarea autoFocus value={repostDraft} onChange={e => setRepostDraft(e.target.value)} placeholder="Add your thoughts..." rows={4}
                className="w-full bg-cream border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal resize-none mb-3" />
              {repostModalPost.profiles && (
                <div className="border border-line/30 rounded-xl p-3 bg-cream/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(repostModalPost.profiles.full_name)} flex items-center justify-center text-cream text-[10px] font-semibold overflow-hidden`}>
                      {repostModalPost.profiles.avatar_url ? <img src={repostModalPost.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(repostModalPost.profiles.full_name)}
                    </div>
                    <div className="text-xs font-semibold text-ink">{repostModalPost.profiles.full_name}</div>
                  </div>
                  <div className="text-sm text-ink whitespace-pre-wrap line-clamp-4">{repostModalPost.content}</div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-line/30 flex justify-end gap-2">
              <button onClick={() => { setRepostModalPost(null); setRepostDraft('') }} className="px-4 py-2 text-sm text-ink-soft hover:text-ink">Cancel</button>
              <button onClick={repostWithThoughts} disabled={reposting}
                className="px-5 py-2 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-full text-sm font-semibold hover:shadow-lg disabled:opacity-40 transition-all flex items-center gap-1.5">
                {reposting ? <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : 'Repost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {toast.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}