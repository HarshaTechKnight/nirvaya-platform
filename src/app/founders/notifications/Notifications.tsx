'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const NOTIF_CONFIG: Record<string, { icon: string; emoji: string; bg: string; label: string }> = {
  message: { icon: '💬', emoji: '✉️', bg: 'from-blue-500 to-cyan-500', label: 'Message' },
  match: { icon: '🤝', emoji: '🎯', bg: 'from-rust to-rust-dark', label: 'Match' },
  like: { icon: '❤️', emoji: '💖', bg: 'from-red-400 to-rose-500', label: 'Like' },
  connection: { icon: '🔗', emoji: '👥', bg: 'from-teal to-teal-dark', label: 'Connection' },
  system: { icon: '📢', emoji: '🔔', bg: 'from-purple-500 to-indigo-600', label: 'System' },
  grant: { icon: '💰', emoji: '💎', bg: 'from-amber-400 to-orange-500', label: 'Grant' },
  milestone: { icon: '🎯', emoji: '🏆', bg: 'from-emerald-400 to-teal-600', label: 'Milestone' },
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  if (s < 604800) return Math.floor(s / 86400) + 'd ago'
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function getDateLabel(date: string) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function Notifications({ initialNotifs, profile }: { initialNotifs: any[]; profile: any }) {
  const supabase = createClient()
  const [notifs, setNotifs] = useState(initialNotifs)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const unreadCount = notifs.filter(n => !n.is_read).length
  const filtered = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs

  // Group by date
  const groupedNotifs = filtered.reduce((groups: Record<string, any[]>, n) => {
    const label = getDateLabel(n.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
    return groups
  }, {})

  useEffect(() => {
    const channel = supabase
      .channel('notifs-' + profile.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + profile.id },
        (payload) => {
          const newNotif = payload.new as any
          setNotifs(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile.id])

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true } as any).eq('user_id', profile.id).eq('is_read', false)
    setToastMessage('✅ All notifications marked as read')
    setTimeout(() => setToastMessage(null), 2000)
  }

  async function deleteNotif(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setNotifs(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
    setToastMessage('🗑️ Notification removed')
    setTimeout(() => setToastMessage(null), 2000)
  }

  async function clearAll() {
    setNotifs([])
    await supabase.from('notifications').delete().eq('user_id', profile.id)
    setShowConfirmClear(false)
    setToastMessage('All notifications cleared')
    setTimeout(() => setToastMessage(null), 2000)
  }

  const getNotifConfig = (type: string) => NOTIF_CONFIG[type] || NOTIF_CONFIG.system
  const getLink = (n: any) => {
    const links: Record<string, string> = {
      message: profile?.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging',
      like: profile?.role === 'mentor' ? '/mentors/feed' : '/founders/feed',
      connection: profile?.role === 'mentor' ? '/mentors/search' : '/founders/search',
      match: profile?.role === 'mentor' ? '/mentors/search' : '/founders/search',
    }
    return links[n.type] || (profile?.role === 'mentor' ? '/mentors/feed' : '/founders/feed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50">
      <TopBar title="Notifications" profile={profile} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-ink mb-1">Notifications</h1>
              <p className="text-sm text-muted">
                {unreadCount > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal rounded-full animate-pulse"></span>
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🎉</span> All caught up!
                  </span>
                )}
              </p>
            </div>
            
            {/* Quick stats */}
            {notifs.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted">
                <div className="text-center">
                  <div className="font-display text-lg text-ink">{notifs.length}</div>
                  <div>Total</div>
                </div>
                <div className="w-px h-8 bg-line/50"></div>
                <div className="text-center">
                  <div className="font-display text-lg text-teal">{unreadCount}</div>
                  <div>Unread</div>
                </div>
                <div className="w-px h-8 bg-line/50"></div>
                <div className="text-center">
                  <div className="font-display text-lg text-ink-soft">{notifs.length - unreadCount}</div>
                  <div>Read</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Actions Bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2 p-1 bg-white border border-line/50 rounded-full shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-md'
                  : 'text-muted hover:text-ink hover:bg-cream-dark/30'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" />
              </svg>
              All
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === 'all' ? 'bg-cream/20' : 'bg-cream-dark/50'}`}>
                {notifs.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-md'
                  : 'text-muted hover:text-ink hover:bg-cream-dark/30'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Unread
              {unreadCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === 'unread' ? 'bg-cream/20' : 'bg-rust/10 text-rust'}`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-teal font-medium hover:text-teal-dark px-4 py-2 rounded-xl hover:bg-teal/5 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-muted hover:text-rust px-4 py-2 rounded-xl hover:bg-rust/5 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List grouped by date */}
        {Object.keys(groupedNotifs).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedNotifs).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xs uppercase tracking-wider text-muted font-semibold">{dateLabel}</h3>
                  <div className="flex-1 h-px bg-line/30"></div>
                </div>

                {/* Notifications */}
                <div className="space-y-2">
                  {items.map(n => {
                    const config = getNotifConfig(n.type)
                    return (
                      <Link
                        key={n.id}
                        href={getLink(n)}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                          n.is_read
                            ? 'bg-white border-line/30 hover:shadow-md hover:border-line/50'
                            : 'bg-gradient-to-r from-teal-light/20 to-white border-teal/20 hover:shadow-lg hover:border-teal/40 shadow-sm'
                        }`}
                      >
                        {/* Unread indicator line */}
                        {!n.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal to-teal-dark rounded-r-full"></div>
                        )}

                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-md shrink-0 relative`}>
                          <span className="text-lg">{config.icon}</span>
                          {!n.is_read && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rust rounded-full border-2 border-white shadow-sm"></span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cream-dark/50 text-muted">
                              {config.label}
                            </span>
                            <span className="text-[11px] text-muted">{timeAgo(n.created_at)}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${n.is_read ? 'text-ink-soft' : 'text-ink font-medium'}`}>
                            {n.content}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                markRead(n.id)
                              }}
                              className="w-8 h-8 rounded-full bg-teal/10 hover:bg-teal hover:text-cream flex items-center justify-center transition-all text-teal"
                              title="Mark as read"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => deleteNotif(n.id, e)}
                            className="w-8 h-8 rounded-full hover:bg-rust/10 hover:text-rust flex items-center justify-center transition-all text-muted"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal/10 to-rust/10 flex items-center justify-center">
                <span className="text-5xl">{filter === 'unread' ? '🎉' : '🔔'}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal rounded-full flex items-center justify-center text-cream text-sm animate-bounce">✓</div>
            </div>
            <h3 className="font-display text-xl text-ink mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
              {filter === 'unread' 
                ? "You've read all your notifications. Time to build something great!" 
                : "When you receive notifications, they'll appear here. Stay tuned!"}
            </p>
            {filter === 'unread' && notifs.length > 0 && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConfirmClear(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="font-display text-lg text-ink mb-2">Clear all notifications?</h3>
              <p className="text-sm text-muted mb-6">This action cannot be undone. All notifications will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-2.5 border-2 border-line rounded-xl text-sm font-medium text-ink-soft hover:bg-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rust to-rust-dark text-cream rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ink to-ink-soft text-cream px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up flex items-center gap-2">
          {toastMessage}
        </div>
      )}
    </div>
  )
}