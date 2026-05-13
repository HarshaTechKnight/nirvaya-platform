'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const NOTIF_CONFIG: Record<string, { icon: string; emoji: string; bg: string; label: string; gradient: string }> = {
  message: { icon: '💬', emoji: '✉️', bg: 'bg-blue-50', label: 'Message', gradient: 'from-blue-500 to-blue-600' },
  match: { icon: '🤝', emoji: '🎯', bg: 'bg-rust-50', label: 'Match', gradient: 'from-rust-500 to-rust-600' },
  like: { icon: '❤️', emoji: '💖', bg: 'bg-rose-50', label: 'Like', gradient: 'from-rose-500 to-pink-500' },
  connection: { icon: '🔗', emoji: '👥', bg: 'bg-teal-50', label: 'Connection', gradient: 'from-teal-500 to-teal-600' },
  system: { icon: '📢', emoji: '🔔', bg: 'bg-purple-50', label: 'System', gradient: 'from-purple-500 to-purple-600' },
  grant: { icon: '💰', emoji: '💎', bg: 'bg-amber-50', label: 'Grant', gradient: 'from-amber-500 to-orange-500' },
  milestone: { icon: '🎯', emoji: '🏆', bg: 'bg-emerald-50', label: 'Milestone', gradient: 'from-emerald-500 to-teal-600' },
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${Math.floor(s / 10) * 10}s ago`
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
  const [selectedNotif, setSelectedNotif] = useState<string | null>(null)

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
          // Show toast for new notification
          setToastMessage(`🔔 New ${newNotif.type} notification`)
          setTimeout(() => setToastMessage(null), 3000)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile.id])

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
    setSelectedNotif(null)
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
    setToastMessage('✨ All notifications cleared')
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <TopBar title="Notifications" profile={profile} />
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-2xl sm:text-3xl text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Stay updated with your network</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-3">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="font-bold text-xl text-gray-900">{notifs.length}</div>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl px-4 py-2 shadow-lg">
                  <div className="text-xs text-teal-100">Unread</div>
                  <div className="font-bold text-xl text-white">{unreadCount}</div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500">Read</div>
                  <div className="font-bold text-xl text-gray-900">{notifs.length - unreadCount}</div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {unreadCount === 0 && notifs.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="text-base">🎉</span>
                All caught up! You're up to date.
              </div>
            )}
            {unreadCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Filter & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" />
              </svg>
              All
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
              }`}>
                {notifs.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Unread
              {unreadCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === 'unread' ? 'bg-white/20' : 'bg-red-100 text-red-600'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-sm text-gray-500 hover:text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {Object.keys(groupedNotifs).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedNotifs).map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-600">{dateLabel}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
                </div>

                {/* Notifications Cards */}
                <div className="space-y-2">
                  {items.map((n, idx) => {
                    const config = getNotifConfig(n.type)
                    const isUnread = !n.is_read
                    
                    return (
                      <Link
                        key={n.id}
                        href={getLink(n)}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`group block rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                          isUnread
                            ? 'bg-gradient-to-r from-teal-50/50 to-white border-teal-200 shadow-md hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${config.bg} flex items-center justify-center shadow-md shrink-0 relative`}>
                              <span className="text-2xl">{config.icon}</span>
                              {isUnread && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
                                    <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${config.bg} text-gray-700`}>
                                  <span>{config.emoji}</span>
                                  <span>{config.label}</span>
                                </span>
                                <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                              </div>
                              <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                {n.content}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                              {isUnread && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    markRead(n.id)
                                  }}
                                  className="w-9 h-9 rounded-xl bg-teal-100 hover:bg-teal-500 text-teal-600 hover:text-white flex items-center justify-center transition-all duration-300"
                                  title="Mark as read"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={(e) => deleteNotif(n.id, e)}
                                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-500 text-gray-500 hover:text-white flex items-center justify-center transition-all duration-300"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar for unread */}
                        {isUnread && (
                          <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-300 w-full animate-progress"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Creative Empty State */
          <div className="text-center py-16 sm:py-24">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center">
                {filter === 'unread' ? (
                  <span className="text-6xl animate-bounce">🎉</span>
                ) : (
                  <span className="text-6xl animate-float">🔔</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
            <h3 className="font-bold text-2xl text-gray-900 mb-2">
              {filter === 'unread' ? 'All caught up! 🎯' : 'Quiet for now 📭'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {filter === 'unread' 
                ? "You've read all your notifications. Time to focus on what matters!" 
                : "When someone interacts with you, you'll see it here. Stay tuned for updates!"}
            </p>
            {filter === 'unread' && notifs.length > 0 && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                View all notifications
              </button>
            )}
            {filter === 'all' && notifs.length === 0 && (
              <div className="text-sm text-gray-400">
                <p>✨ Start connecting with people to see notifications here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Clear Modal - Improved */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowConfirmClear(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl opacity-10"></div>
              <div className="relative p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl animate-shake">🗑️</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Clear all notifications?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. All notifications will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Enhanced */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-gray-900 backdrop-blur-lg text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="text-lg">{toastMessage.charAt(0)}</span>
            <span className="text-sm font-medium">{toastMessage.substring(2)}</span>
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
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-progress { animation: progress 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  )
}