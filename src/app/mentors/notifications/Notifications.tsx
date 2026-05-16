'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const NOTIF_CONFIG: Record<string, { icon: string; emoji: string; label: string; gradient: string }> = {
  message: { icon: '💬', emoji: '✉️', label: 'Message', gradient: 'from-blue-500 to-blue-600' },
  match: { icon: '🤝', emoji: '🎯', label: 'Match', gradient: 'from-rust to-rust-dark' },
  like: { icon: '❤️', emoji: '💖', label: 'Like', gradient: 'from-rose-500 to-pink-500' },
  connection: { icon: '🔗', emoji: '👥', label: 'Connection', gradient: 'from-teal to-teal-dark' },
  system: { icon: '📢', emoji: '🔔', label: 'System', gradient: 'from-purple-500 to-purple-600' },
  grant: { icon: '💰', emoji: '💎', label: 'Grant', gradient: 'from-amber-400 to-orange-500' },
  milestone: { icon: '🎯', emoji: '🏆', label: 'Milestone', gradient: 'from-emerald-400 to-teal-600' },
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
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

  const groupedNotifs = filtered.reduce((groups: Record<string, any[]>, n) => {
    const label = getDateLabel(n.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
    return groups
  }, {})

  useEffect(() => {
    const channel = supabase.channel('notifs-' + profile.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + profile.id },
        (payload) => {
          const newNotif = payload.new as any
          setNotifs(prev => prev.some(n => n.id === newNotif.id) ? prev : [newNotif, ...prev])
          setToastMessage('🔔 New notification')
          setTimeout(() => setToastMessage(null), 3000)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile.id])

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true } as any).eq('user_id', profile.id).eq('is_read', false)
    setToastMessage('✅ All marked as read')
    setTimeout(() => setToastMessage(null), 2000)
  }

  async function deleteNotif(id: string, e: React.MouseEvent) {
    e.stopPropagation(); e.preventDefault()
    setNotifs(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
    setToastMessage('🗑️ Notification removed')
    setTimeout(() => setToastMessage(null), 2000)
  }

  async function clearAll() {
    setNotifs([])
    await supabase.from('notifications').delete().eq('user_id', profile.id)
    setShowConfirmClear(false)
    setToastMessage('✨ All cleared')
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
    <div className="min-h-screen w-full bg-gradient-to-b from-cream via-white to-cream/50">
      <TopBar title="Notifications" profile={profile} />
      
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal to-teal-dark flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl">🔔</span>
                </div>
                <div>
                  <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink">Notifications</h1>
                  <p className="text-xs sm:text-sm text-muted mt-0.5">Stay updated with your network</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-white rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-line/30">
                <div className="text-[10px] sm:text-xs text-muted">Total</div>
                <div className="font-display text-lg sm:text-xl text-ink">{notifs.length}</div>
              </div>
              <div className="bg-gradient-to-r from-teal to-teal-dark rounded-xl px-3 sm:px-4 py-2 shadow-lg">
                <div className="text-[10px] sm:text-xs text-cream/70">Unread</div>
                <div className="font-display text-lg sm:text-xl text-cream">{unreadCount}</div>
              </div>
              <div className="bg-white rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-line/30">
                <div className="text-[10px] sm:text-xs text-muted">Read</div>
                <div className="font-display text-lg sm:text-xl text-ink">{notifs.length - unreadCount}</div>
              </div>
            </div>
          </div>

          {unreadCount === 0 && notifs.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-teal-light/30 text-teal-dark px-3 py-1.5 rounded-full text-xs font-medium">🎉 All caught up!</div>
          )}
          {unreadCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-teal-light/30 text-teal-dark px-3 py-1.5 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse"></span>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-2 p-1 bg-white border border-line/30 rounded-xl sm:rounded-2xl shadow-sm">
            <button onClick={() => setFilter('all')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                filter === 'all' ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-md' : 'text-ink-soft hover:bg-cream-dark/30'
              }`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12"/></svg>
              All <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${filter === 'all' ? 'bg-cream/20' : 'bg-cream-dark/50'}`}>{notifs.length}</span>
            </button>
            <button onClick={() => setFilter('unread')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                filter === 'unread' ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-md' : 'text-ink-soft hover:bg-cream-dark/30'
              }`}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              Unread {unreadCount > 0 && <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${filter === 'unread' ? 'bg-cream/20' : 'bg-rust/10 text-rust'}`}>{unreadCount}</span>}
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs sm:text-sm text-teal font-medium hover:text-teal-dark px-3 sm:px-4 py-2 rounded-xl hover:bg-teal/5 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={() => setShowConfirmClear(true)} className="text-xs sm:text-sm text-muted hover:text-rust px-3 sm:px-4 py-2 rounded-xl hover:bg-rust/5 transition-all flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {Object.keys(groupedNotifs).length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedNotifs).map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-teal to-teal-dark flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cream rounded-full"></div>
                  </div>
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-teal">{dateLabel}</h3>
                  <div className="flex-1 h-px bg-line/30"></div>
                </div>

                <div className="space-y-2">
                  {items.map(n => {
                    const config = getNotifConfig(n.type)
                    const isUnread = !n.is_read
                    return (
                      <Link key={n.id} href={getLink(n)} onClick={() => !n.is_read && markRead(n.id)}
                        className={`group block rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                          isUnread ? 'bg-teal-light/10 border-teal/20 shadow-sm hover:shadow-md' : 'bg-white border-line/30 shadow-sm hover:shadow-md'
                        }`}>
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start gap-2.5 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md shrink-0`}>
                              <span className="text-lg sm:text-xl">{config.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cream-dark/50 text-muted">{config.label}</span>
                                <span className="text-[10px] sm:text-xs text-muted">{timeAgo(n.created_at)}</span>
                              </div>
                              <p className={`text-xs sm:text-sm leading-relaxed ${isUnread ? 'text-ink font-medium' : 'text-ink-soft'}`}>{n.content}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {isUnread && (
                                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); markRead(n.id) }}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal/10 hover:bg-teal text-teal hover:text-cream flex items-center justify-center transition-all">
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                </button>
                              )}
                              <button onClick={(e) => deleteNotif(n.id, e)}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cream-dark/50 hover:bg-rust/10 text-muted hover:text-rust flex items-center justify-center transition-all">
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{filter === 'unread' ? '🎉' : '🔔'}</div>
            <h3 className="font-display text-xl sm:text-2xl text-ink mb-1 sm:mb-2">{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</h3>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-6 max-w-sm mx-auto">{filter === 'unread' ? 'You\'ve read all your notifications.' : 'Activity will appear here.'}</p>
            {filter === 'unread' && notifs.length > 0 && (
              <button onClick={() => setFilter('all')} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all">View all</button>
            )}
          </div>
        )}
      </div>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConfirmClear(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="font-display text-lg text-ink mb-2">Clear all notifications?</h3>
              <p className="text-sm text-muted mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-2.5 border-2 border-line rounded-xl text-sm font-medium hover:bg-cream transition-all">Cancel</button>
                <button onClick={clearAll} className="flex-1 py-2.5 bg-rust text-cream rounded-xl text-sm font-medium hover:bg-rust-dark transition-all">Clear All</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ink to-ink-soft text-cream px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium z-50 animate-fade-up whitespace-nowrap">{toastMessage}</div>
      )}
    </div>
  )
}