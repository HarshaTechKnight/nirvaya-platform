'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

export default function Search({
  initialProfiles,
  currentUser,
  initialConnections,
}: {
  initialProfiles: any[]
  currentUser: any
  initialConnections: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [connections, setConnections] = useState(initialConnections)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const messagingPath = currentUser?.role === 'mentor' ? '/mentors/messaging' : '/founders/messaging'

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function getConnectionInfo(otherId: string) {
    const conn = connections.find(c =>
      (c.sender_id === currentUser.id && c.receiver_id === otherId) ||
      (c.receiver_id === currentUser.id && c.sender_id === otherId)
    )
    if (!conn) return { status: 'none' as const, connectionId: null }
    if (conn.status === 'accepted') return { status: 'accepted' as const, connectionId: conn.id }
    if (conn.sender_id === currentUser.id) return { status: 'pending_sent' as const, connectionId: conn.id }
    return { status: 'pending_received' as const, connectionId: conn.id }
  }

  async function sendRequest(otherId: string) {
    setBusyId(otherId)
    const { data, error } = await supabase.from('connections').insert({
      sender_id: currentUser.id, receiver_id: otherId, status: 'pending',
    } as any).select().single()
    if (error) showToast('Failed: ' + error.message)
    else if (data) { setConnections(prev => [...prev, data]); showToast('Invitation sent!') }
    setBusyId(null)
  }

  async function withdrawRequest(connectionId: string) {
    setBusyId(connectionId)
    const { error } = await supabase.from('connections').delete().eq('id', connectionId)
    if (error) showToast('Failed: ' + error.message)
    else { setConnections(prev => prev.filter(c => c.id !== connectionId)); showToast('Invitation withdrawn') }
    setBusyId(null)
  }

  async function acceptRequest(connectionId: string) {
    setBusyId(connectionId)
    const { error } = await supabase.from('connections')
      .update({ status: 'accepted' } as any).eq('id', connectionId)
    if (error) showToast('Failed: ' + error.message)
    else { setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'accepted' } : c)); showToast('Connected!') }
    setBusyId(null)
  }

  async function ignoreRequest(connectionId: string) {
    setBusyId(connectionId)
    const { error } = await supabase.from('connections').delete().eq('id', connectionId)
    if (error) showToast('Failed: ' + error.message)
    else { setConnections(prev => prev.filter(c => c.id !== connectionId)); showToast('Invitation ignored') }
    setBusyId(null)
  }

  function goToMessage(otherId: string) {
    router.push(`${messagingPath}?to=${otherId}`)
  }

  // Filter out already connected and get recommendations
  const pendingSentIds = new Set(connections.filter(c => c.sender_id === currentUser.id && c.status === 'pending').map(c => c.receiver_id))
  const acceptedIds = new Set(connections.filter(c => c.status === 'accepted').flatMap(c => [c.sender_id, c.receiver_id]))
  
  const recommendations = initialProfiles.filter(p => 
    p.id !== currentUser.id && !acceptedIds.has(p.id)
  )

  // Pending invitations received
  const pendingReceived = connections.filter(c => c.receiver_id === currentUser.id && c.status === 'pending')
  const pendingReceivedProfiles = initialProfiles.filter(p => pendingReceived.some(c => c.sender_id === p.id))

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <TopBar title="My Network" profile={currentUser} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Page Header - LinkedIn Style */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Grow your network</h1>
          <p className="text-sm text-gray-500 mt-1">Connect with founders, mentors, and professionals across India</p>
        </div>

        {/* Invitations Section */}
        {pendingReceivedProfiles.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-300 mb-4 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Invitations ({pendingReceivedProfiles.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingReceivedProfiles.map(profile => {
                const conn = pendingReceived.find(c => c.sender_id === profile.id)
                const gradient = getGradient(profile.full_name || 'U')
                return (
                  <div key={profile.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 overflow-hidden`}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 hover:text-blue-600 cursor-pointer">{profile.full_name}</div>
                      <div className="text-xs text-gray-500 truncate">{profile.headline || profile.company}</div>
                      {profile.location && <div className="text-xs text-gray-400 mt-0.5">{profile.location}</div>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => conn?.id && acceptRequest(conn.id)} disabled={busyId === conn?.id}
                        className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all">
                        Accept
                      </button>
                      <button onClick={() => conn?.id && ignoreRequest(conn.id)} disabled={busyId === conn?.id}
                        className="px-4 py-1.5 rounded-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        Ignore
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommendations Section - LinkedIn "People you may know" style */}
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              People you may know
            </h2>
            <span className="text-xs text-gray-500">{recommendations.length} suggestions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {recommendations.slice(0, 20).map(profile => {
              const { status, connectionId } = getConnectionInfo(profile.id)
              const isBusy = busyId === profile.id || busyId === connectionId
              const gradient = getGradient(profile.full_name || 'U')
              const isPendingSent = pendingSentIds.has(profile.id)

              return (
                <div key={profile.id} className="px-4 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0 overflow-hidden`}>
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover"/> : getInitials(profile.full_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 hover:text-blue-600 hover:underline cursor-pointer truncate">
                      {profile.full_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {profile.headline || profile.company || 'CoFlare Member'}
                    </div>
                    {profile.location && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {profile.location}
                      </div>
                    )}
                    {(profile.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {profile.skills.slice(0, 2).map((s: string) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">{s}</span>
                        ))}
                        {profile.skills.length > 2 && (
                          <span className="text-[10px] text-gray-400">{profile.skills.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {status === 'none' && !isPendingSent && (
                      <button onClick={() => sendRequest(profile.id)} disabled={isBusy}
                        className="px-5 py-2 rounded-full text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all whitespace-nowrap">
                        {isBusy ? 'Connecting...' : 'Connect'}
                      </button>
                    )}

                    {(status === 'pending_sent' || isPendingSent) && (
                      <div className="flex items-center gap-2">
                        <button disabled
                          className="px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-500 bg-gray-50 whitespace-nowrap">
                          ⌛ Pending
                        </button>
                        <button onClick={() => connectionId && withdrawRequest(connectionId)} disabled={isBusy}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors" title="Withdraw">
                          ✕
                        </button>
                      </div>
                    )}

                    {status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-full whitespace-nowrap">
                          ✓ Connected
                        </span>
                        <button onClick={() => goToMessage(profile.id)}
                          className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap">
                          Message
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {recommendations.length === 0 && (
              <div className="px-4 py-16 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all caught up!</h3>
                <p className="text-sm text-gray-500">No more recommendations right now. Check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl text-sm font-medium z-50 animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  )
}