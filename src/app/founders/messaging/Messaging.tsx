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
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600',
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
    .filter(p => !conversationPartnerIds.has(p.id))
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
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
        (payload) => { const newMsg = payload.new as Message; setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]) }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id])

  async function handleSend() {
    if (!draft.trim() || !activeChat || sending) return
    setSending(true)
    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id, receiver_id: activeChat.id, content: draft.trim(), is_read: false,
    } as any).select().single()
    if (!error && data) { setMessages(prev => [...prev, data as Message]); setDraft('') }
    setSending(false)
  }

  function startNewChat(profile: Profile) { setActiveChat(profile); setSearch(''); setShowMobileList(false) }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="flex flex-col h-full w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <TopBar title="Messages" profile={currentUser} />
      
      <div className="flex flex-1 w-full overflow-hidden min-h-0">
        {/* CHAT LIST */}
        <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 bg-white border-r border-line/50 flex-col shrink-0 h-full`}>
          <div className="h-1 bg-gradient-to-r from-teal via-rust to-teal shrink-0" />
          
          <div className="p-3 sm:p-4 border-b border-line/50 shrink-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." className="w-full bg-cream/50 border-2 border-line/50 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm outline-none focus:border-teal focus:bg-white transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted">✕</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {conversations.length > 0 && !search && (
              <div>
                <div className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-muted font-semibold flex items-center gap-2"><span className="w-1 h-3 bg-teal rounded-full"/>Recent Chats</div>
                {conversations.map(({ profile, lastMsg, unread }) => (
                  <button key={profile.id} onClick={() => { setActiveChat(profile); setShowMobileList(false) }} className={`w-full flex items-start gap-2.5 p-3 border-b border-line/30 hover:bg-teal/5 transition-all text-left ${activeChat?.id === profile.id ? 'bg-teal-light/20 border-l-2 border-l-teal' : ''}`}>
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(profile.full_name)} flex items-center justify-center text-cream text-xs font-semibold shadow-md overflow-hidden`}>
                        {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2"><div className="text-xs font-semibold text-ink truncate">{profile.full_name}</div>{lastMsg && <div className="text-[9px] text-muted shrink-0">{timeAgo(lastMsg.created_at)}</div>}</div>
                      <div className="flex items-center justify-between gap-2 mt-0.5"><div className="text-[11px] text-ink-soft truncate">{lastMsg?.sender_id === currentUser.id && <span className="text-teal mr-1">You:</span>}{lastMsg?.content || 'No messages'}</div>{unread > 0 && <span className="bg-teal text-cream text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shrink-0">{unread}</span>}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {(search || conversations.length === 0) && newChatPeople.length > 0 && (
              <div>
                <div className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-muted font-semibold flex items-center gap-2"><span className="w-1 h-3 bg-rust rounded-full"/>{search ? 'Results' : 'Start Chat'}</div>
                {newChatPeople.map(profile => (
                  <button key={profile.id} onClick={() => startNewChat(profile)} className="w-full flex items-center gap-2.5 p-3 border-b border-line/30 hover:bg-rust/5 transition-all text-left">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(profile.full_name)} flex items-center justify-center text-cream text-xs font-semibold shadow-md overflow-hidden shrink-0`}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                    </div>
                    <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-ink truncate">{profile.full_name}</div><div className="text-[10px] text-muted truncate">{profile.role?.toUpperCase()}{profile.headline && ` · ${profile.headline}`}</div></div>
                    <div className="w-7 h-7 rounded-full bg-teal/10 hover:bg-teal hover:scale-110 transition-all flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full min-h-0 bg-gradient-to-b from-cream to-white`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal/20 to-rust/20 flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
              </div>
              <h2 className="font-display text-lg text-ink mb-1">Select a conversation</h2>
              <p className="text-xs text-muted text-center">Choose a person from the left to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white border-b border-line/30 px-3 py-2.5 flex items-center gap-2 shadow-sm shrink-0">
                <button onClick={() => setShowMobileList(true)} className="md:hidden w-8 h-8 rounded-full hover:bg-cream-dark flex items-center justify-center text-muted shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-cream text-xs font-semibold shadow-md overflow-hidden shrink-0`}>
                  {activeChat.avatar_url ? <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(activeChat.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-ink truncate">{activeChat.full_name}</div>
                  <div className="text-[10px] text-muted"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block mr-1"/>Online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xs text-ink-soft font-medium">No messages yet</p>
                    <p className="text-[10px] text-muted mt-1">Send the first message below</p>
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
                        {showDate && <div className="flex items-center justify-center my-3"><div className="h-px flex-1 bg-line/30"/><span className="px-3 text-[10px] text-muted font-medium mx-2 whitespace-nowrap">{getDateLabel(msg.created_at)}</span><div className="h-px flex-1 bg-line/30"/></div>}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isFirstFromSender ? 'mt-1' : 'mt-0.5'}`}>
                          {!isMine && isFirstFromSender && (
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getGradient(activeChat.full_name)} flex items-center justify-center text-cream text-[8px] font-semibold shrink-0 mr-1.5 mt-auto overflow-hidden`}>
                              {activeChat.avatar_url ? <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(activeChat.full_name)}
                            </div>
                          )}
                          {!isMine && !isFirstFromSender && <div className="w-6 h-6 mr-1.5 shrink-0"/>}
                          <div className="max-w-[80%]">
                            <div className={`px-3 py-2 text-xs leading-relaxed break-words ${isMine ? `bg-gradient-to-br from-teal to-teal-dark text-cream ${isFirstFromSender ? 'rounded-2xl rounded-br-md' : isLastFromSender ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl'} shadow-md` : `bg-white text-ink border border-line/30 ${isFirstFromSender ? 'rounded-2xl rounded-bl-md' : isLastFromSender ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl'} shadow-sm`}`}>{msg.content}</div>
                            {isLastFromSender && <div className={`text-[9px] text-muted mt-0.5 px-2 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>{formatTime(msg.created_at)}{isMine && (msg.is_read ? ' · Read' : ' · Sent')}</div>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Input - ALWAYS VISIBLE */}
              <div className="bg-white border-t border-line/30 p-2.5 shadow-lg shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea ref={textareaRef} value={draft} onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
                      placeholder={`Message ${activeChat.full_name}...`} rows={1}
                      className="w-full bg-cream/50 border-2 border-line/50 rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-teal focus:bg-white transition-all resize-none"
                      style={{ minHeight: '38px', maxHeight: '100px' }}/>
                  </div>
                  <button onClick={handleSend} disabled={!draft.trim() || sending}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-teal to-teal-dark flex items-center justify-center text-cream hover:shadow-lg disabled:opacity-40 transition-all shrink-0">
                    {sending ? <div className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin"/> : 
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>}
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