'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

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
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

export default function Network({
  profile,
  initialConnections,
  initialSuggestions,
}: {
  profile: any
  initialConnections: any[]
  initialSuggestions: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [connections, setConnections] = useState(initialConnections)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'grow' | 'catch-up'>('grow')

  const accepted = connections.filter(c => c.status === 'accepted')
  const pendingReceived = connections.filter(c => c.status === 'pending' && c.receiver_id === profile.id)
  const pendingSent = connections.filter(c => c.status === 'pending' && c.sender_id === profile.id)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function acceptInvite(connectionId: string) {
    setBusyId(connectionId)
    const { data } = await supabase
      .from('connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() } as any)
      .eq('id', connectionId)
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, role, headline, company, avatar_url, location, domains, skills),
        receiver:profiles!receiver_id(id, full_name, role, headline, company, avatar_url, location, domains, skills)
      `)
      .single()

    if (data) {
      setConnections(prev => prev.map(c => c.id === connectionId ? data : c))
      showToast('Connection accepted')
    }
    setBusyId(null)
  }

  async function ignoreInvite(connectionId: string) {
    setBusyId(connectionId)
    await supabase.from('connections').delete().eq('id', connectionId)
    setConnections(prev => prev.filter(c => c.id !== connectionId))
    showToast('Invitation ignored')
    setBusyId(null)
  }

  async function sendRequest(otherId: string) {
    setBusyId(otherId)
    const { data } = await supabase
      .from('connections')
      .insert({
        sender_id: profile.id,
        receiver_id: otherId,
        status: 'pending',
      } as any)
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, role, headline, company, avatar_url, location, domains, skills),
        receiver:profiles!receiver_id(id, full_name, role, headline, company, avatar_url, location, domains, skills)
      `)
      .single()

    if (data) {
      setConnections(prev => [...prev, data])
      setSuggestions(prev => prev.filter(s => s.id !== otherId))
      showToast('Connection request sent')
    }
    setBusyId(null)
  }

  function dismissSuggestion(suggestionId: string) {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  async function removeConnection(connectionId: string) {
    if (!confirm('Remove this connection?')) return
    setBusyId(connectionId)
    await supabase.from('connections').delete().eq('id', connectionId)
    setConnections(prev => prev.filter(c => c.id !== connectionId))
    showToast('Connection removed')
    setBusyId(null)
  }

  function getOtherProfile(conn: any) {
    return conn.sender_id === profile.id ? conn.receiver : conn.sender
  }

  function goToMessage(otherId: string) {
    const path = profile.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging'
    router.push(path + '?to=' + otherId)
  }

  function goToProfile(profileId: string) {
    router.push('/profile/' + profileId)
  }

  return (
    <>
      <TopBar title="My Network" profile={profile} />

      <div className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">

            {/* ─── LEFT SIDEBAR — Manage my network ─── */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-line/40">
                  <h2 className="font-display text-base text-ink">Manage my network</h2>
                </div>
                <div className="py-1">
                  {[
                    { label: 'Connections', count: accepted.length, href: '#', active: true },
                    { label: 'Following & followers', count: 0, href: '#' },
                    { label: 'Groups', count: 0, href: '#' },
                    { label: 'Events', count: 0, href: '#' },
                    { label: 'Pages', count: 0, href: '#' },
                    { label: 'Newsletters', count: 0, href: '#' },
                  ].map(item => (
                    <button
                      key={item.label}
                      className={
                        'w-full flex items-center justify-between px-5 py-2.5 text-sm hover:bg-cream/60 transition-colors ' +
                        (item.active ? 'bg-cream font-semibold text-ink' : 'text-ink-soft')
                      }
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-muted">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick stats card */}
              <div className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm mt-4">
                <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Your Network</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Connections</span>
                    <span className="font-display text-lg text-teal">{accepted.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Pending</span>
                    <span className="font-display text-lg text-rust">{pendingReceived.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Sent</span>
                    <span className="font-display text-lg text-muted">{pendingSent.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── CENTER — Main content ─── */}
            <div className="space-y-4">

              {/* TABS — Grow / Catch up */}
              <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-line/40">
                  <button
                    onClick={() => setActiveView('grow')}
                    className={
                      'flex-1 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ' +
                      (activeView === 'grow'
                        ? 'border-teal text-teal'
                        : 'border-transparent text-muted hover:text-ink')
                    }
                  >
                    Grow
                  </button>
                  <button
                    onClick={() => setActiveView('catch-up')}
                    className={
                      'flex-1 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ' +
                      (activeView === 'catch-up'
                        ? 'border-teal text-teal'
                        : 'border-transparent text-muted hover:text-ink')
                    }
                  >
                    Catch up ({accepted.length})
                  </button>
                </div>
              </div>

              {/* GROW VIEW */}
              {activeView === 'grow' && (
                <>
                  {/* INVITATIONS PANEL */}
                  {pendingReceived.length > 0 && (
                    <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 border-b border-line/40 flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-ink">Invitations ({pendingReceived.length})</h3>
                        <button className="text-xs text-teal hover:text-teal-dark font-medium">Show all</button>
                      </div>

                      <div className="divide-y divide-line/40">
                        {pendingReceived.slice(0, 4).map(conn => {
                          const sender = conn.sender
                          if (!sender) return null
                          return (
                            <div key={conn.id} className="p-4 flex items-center gap-3">
                              <button
                                onClick={() => goToProfile(sender.id)}
                                className={'w-12 h-12 rounded-full bg-linear-to-br ' + getGradient(sender.full_name) + ' flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0'}
                              >
                                {sender.avatar_url ? (
                                  <img src={sender.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : getInitials(sender.full_name)}
                              </button>

                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => goToProfile(sender.id)}
                                  className="font-semibold text-sm text-ink hover:text-teal text-left block truncate"
                                >
                                  {sender.full_name}
                                </button>
                                <div className="text-xs text-muted truncate">
                                  {sender.headline || sender.company || (sender.role || '').toUpperCase()}
                                </div>
                                <div className="text-[10px] text-muted mt-0.5">
                                  Wants to connect with you
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => ignoreInvite(conn.id)}
                                  disabled={busyId === conn.id}
                                  className="px-4 py-1.5 border-2 border-line text-ink-soft rounded-full text-xs font-semibold hover:bg-cream disabled:opacity-50 transition-colors"
                                >
                                  Ignore
                                </button>
                                <button
                                  onClick={() => acceptInvite(conn.id)}
                                  disabled={busyId === conn.id}
                                  className="px-4 py-1.5 border-2 border-teal text-teal bg-white rounded-full text-xs font-semibold hover:bg-teal hover:text-cream disabled:opacity-50 transition-colors"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* PEOPLE YOU MAY KNOW — Grid of cards */}
                  {suggestions.length > 0 && (
                    <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 border-b border-line/40 flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-ink">People you may know</h3>
                        <button className="text-xs text-teal hover:text-teal-dark font-medium">Show all</button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                        {suggestions.slice(0, 8).map(person => (
                          <div
                            key={person.id}
                            className="relative bg-white border border-line/40 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Dismiss X */}
                            <button
                              onClick={() => dismissSuggestion(person.id)}
                              className="absolute top-2 right-2 z-10 w-7 h-7 bg-ink/70 hover:bg-ink text-cream rounded-full flex items-center justify-center text-xs font-bold backdrop-blur transition-colors"
                              title="Dismiss"
                            >
                              X
                            </button>

                            {/* Banner */}
                            <div className={'h-14 bg-linear-to-br ' + getGradient(person.full_name)} />

                            <div className="px-3 pb-3 -mt-8 text-center">
                              {/* Avatar overlapping banner */}
                              <button
                                onClick={() => goToProfile(person.id)}
                                className="mx-auto w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-linear-to-br from-teal to-teal-dark flex items-center justify-center text-cream font-semibold mb-2"
                              >
                                {person.avatar_url ? (
                                  <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : getInitials(person.full_name)}
                              </button>

                              {/* Name */}
                              <button
                                onClick={() => goToProfile(person.id)}
                                className="font-semibold text-sm text-ink hover:text-teal block w-full truncate"
                              >
                                {person.full_name}
                              </button>

                              {/* Role badge */}
                              <div className="text-[9px] uppercase tracking-wider font-bold text-teal mt-0.5">
                                {(person.role || '').toUpperCase()}
                              </div>

                              {/* Headline */}
                              <div className="text-xs text-muted mt-1 line-clamp-2 h-8 leading-tight">
                                {person.headline || person.company || person.location || 'CoFlare member'}
                              </div>

                              {/* Connect button */}
                              <button
                                onClick={() => sendRequest(person.id)}
                                disabled={busyId === person.id}
                                className="w-full mt-3 py-1.5 border-2 border-teal text-teal rounded-full text-xs font-semibold hover:bg-teal hover:text-cream disabled:opacity-50 transition-colors"
                              >
                                {busyId === person.id ? 'Sending...' : '+ Connect'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SENT REQUESTS */}
                  {pendingSent.length > 0 && (
                    <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 border-b border-line/40">
                        <h3 className="font-semibold text-sm text-ink">Sent requests ({pendingSent.length})</h3>
                      </div>

                      <div className="divide-y divide-line/40">
                        {pendingSent.map(conn => {
                          const receiver = conn.receiver
                          if (!receiver) return null
                          return (
                            <div key={conn.id} className="p-4 flex items-center gap-3">
                              <div className={'w-12 h-12 rounded-full bg-linear-to-br ' + getGradient(receiver.full_name) + ' flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0'}>
                                {receiver.avatar_url ? (
                                  <img src={receiver.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : getInitials(receiver.full_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-ink truncate">{receiver.full_name}</div>
                                <div className="text-xs text-muted truncate">
                                  {receiver.headline || (receiver.role || '').toUpperCase()}
                                </div>
                                <div className="text-[10px] text-muted mt-0.5">Awaiting response</div>
                              </div>
                              <button
                                onClick={() => removeConnection(conn.id)}
                                disabled={busyId === conn.id}
                                className="px-4 py-1.5 border-2 border-line text-ink-soft rounded-full text-xs font-semibold hover:border-rust hover:text-rust disabled:opacity-50 transition-colors"
                              >
                                Withdraw
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state if nothing */}
                  {pendingReceived.length === 0 && suggestions.length === 0 && pendingSent.length === 0 && (
                    <div className="bg-white border border-line/50 rounded-2xl p-12 text-center shadow-sm">
                      <h3 className="font-display text-xl text-ink mb-2">You are all caught up</h3>
                      <p className="text-sm text-ink-soft mb-5">
                        No pending invitations or suggestions right now. Find more people through search.
                      </p>
                      <Link
                        href={profile.role === 'mentor' ? '/mentors/search' : '/founders/search'}
                        className="inline-block px-6 py-2.5 bg-teal text-cream rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
                      >
                        Find People
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* CATCH UP VIEW — Existing connections */}
              {activeView === 'catch-up' && (
                <div className="bg-white border border-line/50 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-line/40">
                    <h3 className="font-semibold text-sm text-ink">Your connections ({accepted.length})</h3>
                  </div>

                  {accepted.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-sm text-ink-soft mb-5">No connections yet</p>
                      <Link
                        href={profile.role === 'mentor' ? '/mentors/search' : '/founders/search'}
                        className="inline-block px-6 py-2.5 bg-teal text-cream rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
                      >
                        Find People
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-line/40">
                      {accepted.map(conn => {
                        const other = getOtherProfile(conn)
                        if (!other) return null
                        return (
                          <div key={conn.id} className="p-4 flex items-center gap-3 hover:bg-cream/40 transition-colors">
                            <button
                              onClick={() => goToProfile(other.id)}
                              className={'w-12 h-12 rounded-full bg-linear-to-br ' + getGradient(other.full_name) + ' flex items-center justify-center text-cream text-xs font-semibold overflow-hidden shrink-0'}
                            >
                              {other.avatar_url ? (
                                <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : getInitials(other.full_name)}
                            </button>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => goToProfile(other.id)}
                                className="font-semibold text-sm text-ink hover:text-teal block truncate text-left"
                              >
                                {other.full_name}
                              </button>
                              <div className="text-xs text-muted truncate">
                                {other.headline || other.company || (other.role || '').toUpperCase()}
                              </div>
                              {other.location && (
                                <div className="text-[10px] text-muted mt-0.5">{other.location}</div>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => goToMessage(other.id)}
                                className="px-4 py-1.5 border-2 border-teal text-teal rounded-full text-xs font-semibold hover:bg-teal hover:text-cream transition-colors"
                              >
                                Message
                              </button>
                              <button
                                onClick={() => removeConnection(conn.id)}
                                disabled={busyId === conn.id}
                                className="px-3 py-1.5 border-2 border-line text-ink-soft rounded-full text-xs font-semibold hover:border-rust hover:text-rust disabled:opacity-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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