'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string
  role: string
  headline?: string
  company?: string
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

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get unique conversation partners from messages
  const conversationPartnerIds = new Set<string>()
  messages.forEach(m => {
    if (m.sender_id === currentUser.id) conversationPartnerIds.add(m.receiver_id)
    if (m.receiver_id === currentUser.id) conversationPartnerIds.add(m.sender_id)
  })

  // Build conversation list (existing chats + searchable people)
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

  // People to start new chat with (filtered by search)
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

  // Auto-scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length, activeChat?.id])

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!activeChat) return
    const unreadIds = messages
      .filter(m => m.sender_id === activeChat.id && m.receiver_id === currentUser.id && !m.is_read)
      .map(m => m.id)
    if (unreadIds.length === 0) return

    setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
    supabase.from('messages').update({ is_read: true } as any).in('id', unreadIds).then()
  }, [activeChat?.id])

  // Realtime subscription for new messages
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
  }

  return (
    <div className="flex h-screen">
      {/* CHAT LIST SIDEBAR */}
      <div className="w-80 bg-white border-r border-line flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-line">
          <h1 className="font-display text-2xl text-ink mb-3">Messages</h1>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full bg-cream border border-line rounded-lg px-4 py-2 text-sm outline-none focus:border-teal"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">

          {/* Existing conversations */}
          {conversations.length > 0 && (
            <div>
              <div className="px-5 py-2 text-xs uppercase tracking-wider text-muted font-semibold">
                Recent
              </div>
              {conversations.map(({ profile, lastMsg, unread }) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveChat(profile)}
                  className={
                    'w-full flex items-start gap-3 p-4 border-b border-line hover:bg-cream transition-colors text-left ' +
                    (activeChat?.id === profile.id ? 'bg-teal-light' : '')
                  }
                >
                  <div className="w-11 h-11 rounded-full bg-teal-dark text-cream flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(profile.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-ink truncate">{profile.full_name}</div>
                      {lastMsg && (
                        <div className="text-xs text-muted shrink-0">{timeAgo(lastMsg.created_at)}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="text-xs text-ink-soft truncate">
                        {lastMsg?.sender_id === currentUser.id && 'You: '}
                        {lastMsg?.content || 'No messages yet'}
                      </div>
                      {unread > 0 && (
                        <span className="bg-teal text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Start new chat */}
          {(search || conversations.length === 0) && newChatPeople.length > 0 && (
            <div>
              <div className="px-5 py-2 text-xs uppercase tracking-wider text-muted font-semibold mt-2">
                Start New Chat
              </div>
              {newChatPeople.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => startNewChat(profile)}
                  className="w-full flex items-center gap-3 p-4 border-b border-line hover:bg-cream transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-teal-light text-teal-dark flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(profile.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{profile.full_name}</div>
                    <div className="text-xs text-muted truncate">
                      {profile.role.toUpperCase()}
                      {profile.company && ' · ' + profile.company}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {conversations.length === 0 && newChatPeople.length === 0 && (
            <div className="p-8 text-center text-sm text-muted">
              No people found. Try different search.
            </div>
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-cream">

        {!activeChat ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-teal-light text-teal-dark flex items-center justify-center text-3xl font-display mb-4">
              M
            </div>
            <h2 className="font-display text-2xl text-ink mb-2">Select a conversation</h2>
            <p className="text-sm text-muted max-w-xs">
              Choose a person from the left to view messages, or search to start a new chat.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-line px-6 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-dark text-cream flex items-center justify-center text-xs font-semibold shrink-0">
                {getInitials(activeChat.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink truncate">{activeChat.full_name}</div>
                <div className="text-xs text-muted truncate">
                  {activeChat.headline || activeChat.role.toUpperCase()}
                </div>
              </div>
              <span className="text-xs text-teal font-medium">Online</span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeMessages.length === 0 ? (
                <div className="text-center text-sm text-muted py-12">
                  No messages yet. Send the first message below.
                </div>
              ) : (
                activeMessages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUser.id
                  const prevMsg = activeMessages[i - 1]
                  const showDate = !prevMsg || (
                    new Date(msg.created_at).toDateString() !==
                    new Date(prevMsg.created_at).toDateString()
                  )

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-muted bg-cream-dark px-3 py-1 rounded-full">
                            {new Date(msg.created_at).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      <div className={'flex ' + (isMine ? 'justify-end' : 'justify-start')}>
                        <div className="max-w-md">
                          <div
                            className={
                              'px-4 py-2.5 rounded-2xl text-sm leading-relaxed ' +
                              (isMine
                                ? 'bg-teal text-cream rounded-br-sm'
                                : 'bg-white text-ink border border-line rounded-bl-sm')
                            }
                          >
                            {msg.content}
                          </div>
                          <div
                            className={
                              'text-xs text-muted mt-1 px-2 ' +
                              (isMine ? 'text-right' : 'text-left')
                            }
                          >
                            {formatTime(msg.created_at)}
                            {isMine && msg.is_read && ' · Read'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-line p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={'Message ' + activeChat.full_name + '...'}
                  rows={1}
                  className="flex-1 bg-cream border border-line rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal resize-none max-h-32"
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="px-5 py-3 bg-teal text-cream rounded-2xl text-sm font-medium hover:bg-teal-dark disabled:opacity-40"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
              <div className="text-xs text-muted mt-2 text-center">
                Press Enter to send · Shift+Enter for new line
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}