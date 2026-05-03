'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

const ICONS: Record<string, string> = {
  message: '💬',
  match: '🤝',
  like: '❤',
  connection: '🔔',
  system: '📢',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Notifications({ initialNotifs, profile }: { initialNotifs: any[]; profile: any }) {
  const supabase = createClient()
  const [notifs, setNotifs] = useState(initialNotifs)
  const unread = notifs.filter(n => !n.is_read).length

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true } as any).eq('id', id)
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true } as any).eq('user_id', profile.id).eq('is_read', false)
  }

  return (
    <>
      <TopBar title="Notifications" profile={profile}/>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-muted">{unread} unread</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-teal font-medium hover:text-teal-dark">
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                n.is_read
                  ? 'bg-white border-line/50'
                  : 'bg-white border-l-[3px] border-l-teal border-line/50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center text-base flex-shrink-0">
                {ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1">
                <div className="text-sm text-ink leading-relaxed">{n.content}</div>
                <div className="text-xs text-muted mt-1">{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0 mt-2"/>}
            </div>
          ))}
          {notifs.length === 0 && (
            <div className="text-center py-16 text-muted text-sm">No notifications yet</div>
          )}
        </div>
      </div>
    </>
  )
}