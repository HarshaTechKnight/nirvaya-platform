'use client'

import { useState, useEffect, useRef } from 'react'
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
    'from-teal-400 to-teal-600', 'from-rust-400 to-rust-600',
    'from-purple-400 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getDateLabel(date: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const d = new Date(date)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function Messaging({
  currentUser, allProfiles, initialMessages,
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
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const conversationPartnerIds = new Set<string>()
  messages.forEach(m => {
    if (m.sender_id === currentUser.id) conversationPartnerIds.add(m.receiver_id)
    if (m.receiver_id === currentUser.id) conversationPartnerIds.add(m.sender_id)
  })

  const conversations = allProfiles
    .filter(p => conversationPartnerIds.has(p.id))
    .map(p => {
      const lastMsg = [...messages].reverse().find(m =>
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

  const newChatPeople = allProfiles
    .filter(p => !conversationPartnerIds.has(p.id) && p.id !== currentUser.id)
    .filter(p => !search || p.full_name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10)

  const activeMessages = activeChat
    ? messages.filter(m =>
        (m.sender_id === currentUser.id && m.receiver_id === activeChat.id) ||
        (m.receiver_id === currentUser.id && m.sender_id === activeChat.id)
      )
    : []

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeMessages.length, activeChat?.id])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }, [draft])

  useEffect(() => {
    if (!activeChat) return
    const unreadIds = messages.filter(m => m.sender_id === activeChat.id && m.receiver_id === currentUser.id && !m.is_read).map(m => m.id)
    if (unreadIds.length === 0) return
    setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
    supabase.from('messages').update({ is_read: true } as any).in('id', unreadIds).then()
  }, [activeChat?.id])

  useEffect(() => {
    const channel = supabase.channel('messages-' + currentUser.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'receiver_id=eq.' + currentUser.id },
        (payload) => { 
          const newMsg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          setTyping(true)
          setTimeout(() => setTyping(false), 2000)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id])

  async function handleSend() {
    if (!draft.trim() || !activeChat || sending) return
    setSending(true)
    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id, receiver_id: activeChat.id, content: draft.trim(), is_read: false,
    } as any).select().single()
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
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <TopBar title="Messages" profile={currentUser} />
      
      {/* Main container with proper height management */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        
        {/* CHAT LIST - Mobile friendly */}
        <div className={`
          ${showMobileList ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          absolute md:relative
          top-0 left-0
          w-full md:w-80 lg:w-96 
          h-full
          bg-white shadow-xl 
          flex flex-col 
          transition-transform duration-300 ease-in-out
          z-20 md:z-auto
        `}>
          {/* Header */}
          <div className="relative overflow-hidden shrink-0">
            <div className="h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-teal-500"></div>
            <div className="px-5 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-xl text-gray-900">Messages</h2>
                  {totalUnread > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-teal-600">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                      {totalUnread} unread
                    </span>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  type="text" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search conversations..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-300">
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 && !search && (
              <div className="py-2">
                <div className="px-5 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">Recent Chats</span>
                </div>
                {conversations.map(({ profile, lastMsg, unread }) => (
                  <button 
                    key={profile.id} 
                    onClick={() => { setActiveChat(profile); setShowMobileList(false) }} 
                    className={`w-full flex items-start gap-3 px-5 py-3 transition-all duration-300 text-left ${
                      activeChat?.id === profile.id 
                        ? 'bg-gradient-to-r from-teal-50 to-transparent border-l-4 border-teal-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(profile.full_name)} flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden`}>
                        {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">{profile.full_name}</span>
                        {lastMsg && <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(lastMsg.created_at)}</span>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                          {lastMsg?.sender_id === currentUser.id && (
                            <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span>{lastMsg?.content || 'No messages yet'}</span>
                        </div>
                        {unread > 0 && (
                          <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-sm">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* New Chats */}
            {(search || conversations.length === 0) && newChatPeople.length > 0 && (
              <div className="py-2">
                <div className="px-5 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    {search ? 'Search Results' : 'Start New Chat'}
                  </span>
                </div>
                {newChatPeople.map(profile => (
                  <button 
                    key={profile.id} 
                    onClick={() => startNewChat(profile)} 
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-300 text-left group"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(profile.full_name)} flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden shrink-0`}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{profile.full_name}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {profile.role?.toUpperCase()}
                        {profile.headline && ` · ${profile.headline.substring(0, 30)}`}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-100 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {conversations.length === 0 && newChatPeople.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">No conversations yet</p>
                <p className="text-xs text-gray-400">Search for people to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT WINDOW - Mobile optimized with visible input */}
        <div className={`
          ${!showMobileList ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0
          absolute md:relative
          top-0 left-0
          w-full md:flex-1
          h-full
          bg-gradient-to-br from-gray-50 to-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          z-10 md:z-auto
        `}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>
              <h2 className="font-bold text-xl text-gray-900 mb-2">Welcome to Messages</h2>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Select a conversation from the sidebar or start a new chat with someone
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm shrink-0">
                <button 
                  onClick={() => setShowMobileList(true)} 
                  className="md:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-white font-bold shadow-md overflow-hidden shrink-0`}>
                  {activeChat.avatar_url ? <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(activeChat.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{activeChat.full_name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Area - Takes remaining space */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  activeMessages.map((msg, i) => {
                    const isMine = msg.sender_id === currentUser.id
                    const prevMsg = activeMessages[i - 1]
                    const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()
                    const isFirstFromSender = !prevMsg || prevMsg.sender_id !== msg.sender_id
                    const nextMsg = activeMessages[i + 1]
                    const isLastFromSender = !nextMsg || nextMsg.sender_id !== msg.sender_id
                    
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            <span className="px-3 text-[10px] font-semibold text-gray-400">{getDateLabel(msg.created_at)}</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isFirstFromSender ? 'mt-2' : 'mt-0.5'}`}>
                          {!isMine && isFirstFromSender && (
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-auto overflow-hidden`}>
                              {activeChat.avatar_url ? <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(activeChat.full_name)}
                            </div>
                          )}
                          {!isMine && !isFirstFromSender && <div className="w-7 h-7 mr-2 shrink-0"/>}
                          <div className="max-w-[75%] sm:max-w-[70%]">
                            <div className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                              isMine 
                                ? `bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md ${
                                    isFirstFromSender ? 'rounded-2xl rounded-br-md' : isLastFromSender ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl'
                                  }` 
                                : `bg-white text-gray-700 border border-gray-200 shadow-sm ${
                                    isFirstFromSender ? 'rounded-2xl rounded-bl-md' : isLastFromSender ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl'
                                  }`
                            }`}>
                              {msg.content}
                            </div>
                            {isLastFromSender && (
                              <div className={`text-[10px] text-gray-400 mt-1 px-2 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                {formatTime(msg.created_at)}
                                {isMine && (
                                  msg.is_read 
                                    ? <span className="text-teal-500">✓✓ Read</span>
                                    : <span className="text-gray-400">✓ Sent</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - ALWAYS VISIBLE at bottom */}
              <div className="bg-white border-t border-gray-200 p-3 shadow-lg shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea 
                      ref={textareaRef} 
                      value={draft} 
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
                      placeholder={`Message ${activeChat.full_name}...`} 
                      rows={1}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:bg-white transition-all resize-none"
                      style={{ minHeight: '42px', maxHeight: '100px' }}
                    />
                  </div>
                  <button 
                    onClick={handleSend} 
                    disabled={!draft.trim() || sending}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0 hover:scale-105"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}