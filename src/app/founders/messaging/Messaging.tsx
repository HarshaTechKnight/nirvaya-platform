'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string
  role: string
  headline?: string
  company?: string
  avatar_url?: string
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark',
    'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-purple-600',
  ]
  const index = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
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

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString()
}

function isYesterday(date: string) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return new Date(date).toDateString() === yesterday.toDateString()
}

function getDateLabel(date: string) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function Messaging({
  currentUser,
  allProfiles,
  initialMessages,
}: {
  currentUser: any
  allProfiles: Profile[]
  initialMessages: Message[]
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeChat, setActiveChat] = useState<Profile | null>(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [showMobileList, setShowMobileList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get unique conversation partners
  const conversationPartnerIds = new Set<string>()
  messages.forEach(m => {
    if (m.sender_id === currentUser.id) conversationPartnerIds.add(m.receiver_id)
    if (m.receiver_id === currentUser.id) conversationPartnerIds.add(m.sender_id)
  })

  // Build conversation list
  const conversations = allProfiles
    .filter(p => conversationPartnerIds.has(p.id))
    .map(p => {
      const lastMsg = [...messages]
        .reverse()
        .find(m =>
          (m.sender_id === currentUser.id && m.receiver_id === p.id) ||
          (m.receiver_id === currentUser.id && m.sender_id === p.id)
        )
      const unread = messages.filter(m =>
        m.sender_id === p.id && m.receiver_id === currentUser.id && !m.is_read
      ).length
      return { profile: p, lastMsg, unread }
    })
    .sort((a, b) => {
      if (!a.lastMsg) return 1
      if (!b.lastMsg) return -1
      return new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime()
    })

  // People to start new chat with
  const newChatPeople = allProfiles
    .filter(p => !conversationPartnerIds.has(p.id))
    .filter(p => !search || p.full_name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10)

  // Messages for active chat
  const activeMessages = activeChat
    ? messages.filter(m =>
        (m.sender_id === currentUser.id && m.receiver_id === activeChat.id) ||
        (m.receiver_id === currentUser.id && m.sender_id === activeChat.id)
      )
    : []

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length, activeChat?.id])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [draft])

  // Mark as read
  useEffect(() => {
    if (!activeChat) return
    const unreadIds = messages
      .filter(m => m.sender_id === activeChat.id && m.receiver_id === currentUser.id && !m.is_read)
      .map(m => m.id)
    if (unreadIds.length === 0) return

    setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
    supabase.from('messages').update({ is_read: true } as any).in('id', unreadIds).then()
  }, [activeChat?.id])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages-' + currentUser.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'receiver_id=eq.' + currentUser.id,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser.id])

  async function handleSend() {
    if (!draft.trim() || !activeChat || sending) return
    setSending(true)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: activeChat.id,
        content: draft.trim(),
        is_read: false,
      } as any)
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data as Message])
      setDraft('')
    }
    setSending(false)
  }

  function startNewChat(profile: Profile) {
    setActiveChat(profile)
    setSearch('')
    setShowMobileList(false)
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="flex h-screen bg-cream">

      {/* CHAT LIST SIDEBAR */}
      <div className={`${
        showMobileList ? 'flex' : 'hidden'
      } md:flex w-full md:w-80 lg:w-96 bg-white border-r border-line/50 flex-col relative`}>

        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal via-rust to-teal"></div>

        {/* Header */}
        <div className="p-5 border-b border-line/50 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl text-ink">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-gradient-to-r from-teal to-teal-dark text-cream text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md">
                {totalUnread} new
              </span>
            )}
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-cream/50 border-2 border-line/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-teal focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted hover:bg-muted/40"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Existing conversations */}
          {conversations.length > 0 && !search && (
            <div>
              <div className="px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-teal rounded-full"></span>
                Recent Chats
              </div>
              {conversations.map(({ profile, lastMsg, unread }) => {
                const gradient = getGradient(profile.full_name)
                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setActiveChat(profile)
                      setShowMobileList(false)
                    }}
                    className={`w-full flex items-start gap-3.5 p-4 border-b border-line/30 hover:bg-gradient-to-r hover:from-teal/5 hover:to-transparent transition-all text-left group ${
                      activeChat?.id === profile.id ? 'bg-teal-light/30 border-l-2 border-l-teal' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-sm font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-white`}>
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          getInitials(profile.full_name)
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-ink truncate group-hover:text-teal transition-colors">
                          {profile.full_name}
                        </div>
                        {lastMsg && (
                          <div className="text-[10px] text-muted shrink-0 font-medium">
                            {timeAgo(lastMsg.created_at)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="text-xs text-ink-soft truncate">
                          {lastMsg?.sender_id === currentUser.id && (
                            <span className="text-teal mr-1">You:</span>
                          )}
                          {lastMsg?.content || 'No messages yet'}
                        </div>
                        {unread > 0 && (
                          <span className="bg-gradient-to-r from-teal to-teal-dark text-cream text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shrink-0 shadow-sm">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {profile.role?.toUpperCase()}
                        {profile.company && ` · ${profile.company}`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* New chat suggestions */}
          {(search || conversations.length === 0) && newChatPeople.length > 0 && (
            <div>
              <div className="px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-rust rounded-full"></span>
                {search ? 'Search Results' : 'Start a Conversation'}
              </div>
              {newChatPeople.map(profile => {
                const gradient = getGradient(profile.full_name)
                return (
                  <button
                    key={profile.id}
                    onClick={() => startNewChat(profile)}
                    className="w-full flex items-center gap-3.5 p-4 border-b border-line/30 hover:bg-gradient-to-r hover:from-rust/5 hover:to-transparent transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-cream text-sm font-semibold shadow-md group-hover:shadow-lg transition-all ring-2 ring-white`}>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        getInitials(profile.full_name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate group-hover:text-teal transition-colors">
                        {profile.full_name}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {profile.role?.toUpperCase()}
                        {profile.headline && ` · ${profile.headline}`}
                      </div>
                      {profile.company && (
                        <div className="text-[10px] text-muted mt-0.5">{profile.company}</div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal/10 group-hover:bg-teal group-hover:scale-110 transition-all flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-teal group-hover:text-cream transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {conversations.length === 0 && newChatPeople.length === 0 && search && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-sm text-ink-soft font-medium">No people found</p>
              <p className="text-xs text-muted mt-1">Try a different search term</p>
            </div>
          )}

          {!search && conversations.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm text-ink-soft font-medium">No messages yet</p>
              <p className="text-xs text-muted mt-1">Search for people to start chatting</p>
            </div>
          )}
        </div>

        {/* Bottom user info */}
        <div className="p-4 border-t border-line/30 bg-cream/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(currentUser.full_name)} flex items-center justify-center text-cream text-xs font-semibold shadow-md`}>
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(currentUser.full_name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink truncate">{currentUser.full_name}</div>
              <div className="text-[10px] text-muted">You</div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`${
        !showMobileList ? 'flex' : 'hidden'
      } md:flex flex-1 flex-col bg-gradient-to-b from-cream to-white relative`}>

        {!activeChat ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal/20 to-rust/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream text-3xl shadow-xl animate-pulse-slow">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-3 border-white shadow-md"></div>
            </div>
            <h2 className="font-display text-2xl text-ink mb-2">Select a conversation</h2>
            <p className="text-sm text-muted max-w-xs text-center leading-relaxed">
              Choose a person from the left to view messages, or search to start a new chat.
            </p>
            
            {/* Animated dots */}
            <div className="flex gap-1.5 mt-8">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal/30 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white/80 backdrop-blur border-b border-line/30 px-5 py-3.5 flex items-center gap-3 shadow-sm">
              <button
                onClick={() => setShowMobileList(true)}
                className="md:hidden w-8 h-8 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-cream text-sm font-semibold shadow-md ring-2 ring-white shrink-0`}>
                {activeChat.avatar_url ? (
                  <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(activeChat.full_name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink truncate">{activeChat.full_name}</div>
                <div className="text-xs text-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted hover:text-ink transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted hover:text-ink transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1 scrollbar-thin">
              {activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-5xl mb-4">👋</div>
                  <p className="text-sm text-ink-soft font-medium">No messages yet</p>
                  <p className="text-xs text-muted mt-1">Send the first message below</p>
                </div>
              ) : (
                activeMessages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUser.id
                  const prevMsg = activeMessages[i - 1]
                  const showDate = !prevMsg || (
                    new Date(msg.created_at).toDateString() !==
                    new Date(prevMsg.created_at).toDateString()
                  )
                  const isFirstFromSender = !prevMsg || prevMsg.sender_id !== msg.sender_id
                  const nextMsg = activeMessages[i + 1]
                  const isLastFromSender = !nextMsg || nextMsg.sender_id !== msg.sender_id

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <div className="h-px flex-1 bg-line/30"></div>
                          <span className="px-4 text-[11px] text-muted font-medium bg-cream/50 mx-3">
                            {getDateLabel(msg.created_at)}
                          </span>
                          <div className="h-px flex-1 bg-line/30"></div>
                        </div>
                      )}
                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isFirstFromSender ? 'mt-1' : 'mt-0.5'}`}>
                        {!isMine && isFirstFromSender && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-cream text-[10px] font-semibold shrink-0 mr-2 mt-auto shadow-sm`}>
                            {activeChat.avatar_url ? (
                              <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              getInitials(activeChat.full_name)
                            )}
                          </div>
                        )}
                        {!isMine && !isFirstFromSender && <div className="w-8 mr-2 shrink-0"></div>}
                        <div className="max-w-[70%] lg:max-w-md">
                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                              isMine
                                ? `bg-gradient-to-br from-teal to-teal-dark text-cream ${
                                    isFirstFromSender ? 'rounded-2xl rounded-br-md' : 
                                    isLastFromSender ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl'
                                  } shadow-md`
                                : `bg-white text-ink border border-line/30 ${
                                    isFirstFromSender ? 'rounded-2xl rounded-bl-md' : 
                                    isLastFromSender ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl'
                                  } shadow-sm`
                            }`}
                          >
                            {msg.content}
                          </div>
                          {isLastFromSender && (
                            <div className={`text-[10px] text-muted mt-1 px-3 flex items-center gap-1.5 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}>
                              {formatTime(msg.created_at)}
                              {isMine && (
                                <span className="flex items-center gap-0.5">
                                  {msg.is_read ? (
                                    <>
                                      <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>Read</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>Sent</span>
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-white/80 backdrop-blur border-t border-line/30 p-4 shadow-lg">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <button className="w-10 h-10 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted hover:text-teal transition-all shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={`Message ${activeChat.full_name}...`}
                    rows={1}
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:border-teal focus:bg-white transition-all resize-none"
                    style={{ minHeight: '46px' }}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted hover:text-teal transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-teal to-teal-dark flex items-center justify-center text-cream hover:shadow-lg hover:shadow-teal/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 group"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-[10px] text-muted text-center mt-2 flex items-center justify-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-cream-dark/50 rounded text-[9px] font-mono">Enter</kbd>
                <span>to send</span>
                <span className="text-line">·</span>
                <kbd className="px-1.5 py-0.5 bg-cream-dark/50 rounded text-[9px] font-mono">Shift + Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}