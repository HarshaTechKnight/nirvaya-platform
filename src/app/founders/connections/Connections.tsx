'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Connections({
  profile,
  initialConnections,
}: {
  profile: any
  initialConnections: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [connections, setConnections] = useState(initialConnections)
  const [tab, setTab] = useState<'all' | 'pending' | 'sent'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const accepted = connections.filter(c => c.status === 'accepted')
  const pendingReceived = connections.filter(c => c.status === 'pending' && c.receiver_id === profile.id)
  const pendingSent = connections.filter(c => c.status === 'pending' && c.sender_id === profile.id)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function accept(id: string) {
    setBusyId(id)
    const { data } = await supabase
      .from('connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, role, headline, company, avatar_url),
        receiver:profiles!receiver_id(id, full_name, role, headline, company, avatar_url)
      `)
      .single()

    if (data) {
      setConnections(prev => prev.map(c => c.id === id ? data : c))
      showToast('Connection accepted')
    }
    setBusyId(null)
  }

  async function remove(id: string, label: string) {
    if (!confirm('Remove this ' + label + '?')) return
    setBusyId(id)
    await supabase.from('connections').delete().eq('id', id)
    setConnections(prev => prev.filter(c => c.id !== id))
    showToast(label + ' removed')
    setBusyId(null)
  }

  function getOtherProfile(conn: any) {
    return conn.sender_id === profile.id ? conn.receiver : conn.sender
  }

  function goToMessage(otherId: string) {
    const path = profile.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging'
    router.push(path + '?to=' + otherId)
  }

  const visibleConnections =
    tab === 'pending' ? pendingReceived :
    tab === 'sent' ? pendingSent :
    accepted

  return (
    <>
      <TopBar title="Connections" profile={profile} />
      <div className="p-8 max-w-4xl mx-auto">

        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink mb-1">My Network</h1>
          <p className="text-sm text-ink-soft">Manage your connections and requests.</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-5 border-b border-line">
          <button
            onClick={() => setTab('all')}
            className={
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
              (tab === 'all' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink')
            }
          >
            Connections ({accepted.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className={
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors relative ' +
              (tab === 'pending' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink')
            }
          >
            Pending ({pendingReceived.length})
            {pendingReceived.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rust text-cream text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('sent')}
            className={
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
              (tab === 'sent' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink')
            }
          >
            Sent ({pendingSent.length})
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {visibleConnections.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              {tab === 'all' && 'No connections yet. Find people to connect with.'}
              {tab === 'pending' && 'No pending requests.'}
              {tab === 'sent' && 'No requests sent.'}
            </div>
          ) : (
            visibleConnections.map(conn => {
              const other = getOtherProfile(conn)
              if (!other) return null

              return (
                <div key={conn.id} className="bg-white border border-line/50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-dark text-cream flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
                    {other.avatar_url ? (
                      <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : getInitials(other.full_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-ink">{other.full_name}</span>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                        {(other.role || '').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5 truncate">
                      {other.headline || other.company || ''}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {tab === 'all' && (
                      <>
                        <button
                          onClick={() => goToMessage(other.id)}
                          className="px-4 py-2 bg-teal text-cream rounded-lg text-xs font-medium hover:bg-teal-dark transition-colors"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => remove(conn.id, 'connection')}
                          disabled={busyId === conn.id}
                          className="px-3 py-2 border border-line text-rust rounded-lg text-xs font-medium hover:bg-rust-soft disabled:opacity-50 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    )}

                    {tab === 'pending' && (
                      <>
                        <button
                          onClick={() => accept(conn.id)}
                          disabled={busyId === conn.id}
                          className="px-4 py-2 bg-teal text-cream rounded-lg text-xs font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => remove(conn.id, 'request')}
                          disabled={busyId === conn.id}
                          className="px-3 py-2 border border-line text-ink-soft rounded-lg text-xs font-medium hover:bg-cream disabled:opacity-50 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {tab === 'sent' && (
                      <button
                        onClick={() => remove(conn.id, 'request')}
                        disabled={busyId === conn.id}
                        className="px-4 py-2 border border-line text-rust rounded-lg text-xs font-medium hover:bg-rust-soft disabled:opacity-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-cream px-5 py-3 rounded-xl shadow-2xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </>
  )
}