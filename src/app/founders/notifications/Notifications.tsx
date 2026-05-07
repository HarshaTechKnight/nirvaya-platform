'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const ICONS: Record<string, string> = {
  message: 'M',
  match: 'P',
  like: 'L',
  connection: 'C',
  system: 'S',
}

const COLORS: Record<string, string> = {
  message: 'bg-teal-light text-teal-dark',
  match: 'bg-rust-soft text-rust',
  like: 'bg-rust-soft text-rust',
  connection: 'bg-teal-light text-teal-dark',
  system: 'bg-cream-dark text-ink-soft',
}

const LINKS: Record<string, string> = {
  message: '/founders/messaging',
  like: '/founders/feed',
  connection: '/founders/search',
  match: '/founders/search',
  system: '/founders/feed',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  if (s < 604800) return Math.floor(s / 86400) + 'd ago'
  return new Date(date).toLocaleDateString()
}

export default function Notifications({ initialNotifs, profile }: { initialNotifs: any[]; profile: any }) {
  const supabase = createClient()
  const [notifs, setNotifs] = useState(initialNotifs)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifs.filter(n => !n.is_read).length
  const filtered = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs

  // Realtime: listen for new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifs-' + profile.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + profile.id,
        },
        (payload) => {
          const newNotif = payload.new as any
          setNotifs(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile.id])

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('user_id', profile.id)
      .eq('is_read', false)
  }

  async function deleteNotif(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setNotifs(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  async function clearAll() {
    if (!confirm('Delete all notifications?')) return
    setNotifs([])
    await supabase.from('notifications').delete().eq('user_id', profile.id)
  }

  return (
    <>
      <TopBar title="Notifications" profile={profile}/>
      <div className="p-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink mb-1">Notifications</h1>
          <p className="text-sm text-muted">
            {unreadCount > 0 ? unreadCount + ' unread' : 'All caught up'}
          </p>
        </div>

        {/* Filter tabs + actions */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={
                'px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                (filter === 'all'
                  ? 'border-teal text-teal bg-teal-light/40'
                  : 'border-line text-muted bg-white hover:border-teal/50')
              }
            >
              All ({notifs.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={
                'px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                (filter === 'unread'
                  ? 'border-teal text-teal bg-teal-light/40'
                  : 'border-line text-muted bg-white hover:border-teal/50')
              }
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-teal font-medium hover:text-teal-dark px-3 py-1.5"
              >
                Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted hover:text-rust px-3 py-1.5"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          {filtered.map(n => (
            <Link
              key={n.id}
              href={LINKS[n.type] || '/founders/feed'}
              onClick={() => markRead(n.id)}
              className={
                'group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-sm ' +
                (n.is_read
                  ? 'bg-white border-line/50'
                  : 'bg-white border-l-[3px] border-l-teal border-line/50')
              }
            >
              <div
                className={
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ' +
                  (COLORS[n.type] || 'bg-cream-dark text-ink-soft')
                }
              >
                {ICONS[n.type] || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={'text-sm leading-relaxed ' + (n.is_read ? 'text-ink-soft' : 'text-ink font-medium')}>
                  {n.content}
                </div>
                <div className="text-xs text-muted mt-1">{timeAgo(n.created_at)}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-teal mt-2"/>}
                <button
                  onClick={(e) => deleteNotif(n.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-rust text-xs px-2 transition-opacity"
                  title="Delete"
                >
                  X
                </button>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-cream-dark text-muted flex items-center justify-center text-2xl font-display mx-auto mb-4">
                N
              </div>
              <div className="text-sm text-ink mb-1 font-medium">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <div className="text-xs text-muted">
                {filter === 'unread' ? 'You are all caught up' : 'Activity will appear here'}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}