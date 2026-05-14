'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'

const ROLE_TAGS: Record<string, string> = {
  founder: 'FOUNDER',
  'co-founder': 'CO-FOUNDER',
  freelancer: 'FREELANCER',
  'biz-owner': 'BIZ OWNER',
  mentor: 'MENTOR',
  investor: 'INVESTOR',
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGradient(seed: string) {
  const gradients = [
    'from-teal to-teal-dark', 'from-rust to-rust-dark',
    'from-purple-500 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

type Profile = {
  id?: string
  full_name?: string
  headline?: string
  role?: string
  company?: string
  bio?: string
  domains?: string[]
  location?: string
  skills?: string[]
  linkedin_url?: string
  avatar_url?: string
  posts_count?: number
  connections_count?: number
  is_verified?: boolean
}

export default function ProfileView({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [showShareToast, setShowShareToast] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile>({
    full_name: '', headline: '', company: '', bio: '', location: '', linkedin_url: '', domains: [], skills: [], ...profile,
  })
  const [newSkill, setNewSkill] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name || '', headline: profile.headline || '', company: profile.company || '',
        bio: profile.bio || '', location: profile.location || '', linkedin_url: profile.linkedin_url || '',
        domains: profile.domains || [], skills: profile.skills || [], avatar_url: profile.avatar_url,
        id: profile.id, role: profile.role, posts_count: profile.posts_count, connections_count: profile.connections_count, is_verified: profile.is_verified,
      })
    }
  }, [profile])

  if (!profile || !profile.id) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal/20 to-rust/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Profile Not Found</h2>
          <p className="text-sm text-muted mb-6">We could not load your profile.</p>
          <button onClick={() => router.push('/auth/login')} className="px-6 py-3 bg-teal text-cream rounded-xl text-sm font-medium hover:bg-teal-dark transition-all">
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  const profileId: string = profile.id
  const profileRole: string = profile.role || 'founder'
  const profileIsVerified = !!profile.is_verified
  const profilePostsCount = profile.posts_count || 0
  const profileConnectionsCount = profile.connections_count || 0

  async function handleShare() {
    const url = window.location.origin + '/profile/' + profileId
    try { await navigator.clipboard.writeText(url); setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2000) }
    catch { setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2000) }
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      full_name: editedProfile.full_name, headline: editedProfile.headline, company: editedProfile.company,
      bio: editedProfile.bio, location: editedProfile.location, linkedin_url: editedProfile.linkedin_url,
      domains: editedProfile.domains || [], skills: editedProfile.skills || [],
    } as any).eq('id', profileId)
    if (!error) { setIsEditing(false); setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 2000); window.location.reload() }
    setLoading(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = profileId + '-' + Date.now() + '.' + fileExt
    const filePath = 'avatars/' + fileName
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
    if (uploadError) return
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl } as any).eq('id', profileId)
    setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 2000); window.location.reload()
  }

  function addSkill() { const s = editedProfile.skills || []; if (newSkill.trim() && !s.includes(newSkill.trim())) { setEditedProfile({ ...editedProfile, skills: [...s, newSkill.trim()] }); setNewSkill('') } }
  function removeSkill(skill: string) { setEditedProfile({ ...editedProfile, skills: (editedProfile.skills || []).filter(s => s !== skill) }) }
  function addDomain() { const d = editedProfile.domains || []; if (newDomain.trim() && !d.includes(newDomain.trim())) { setEditedProfile({ ...editedProfile, domains: [...d, newDomain.trim()] }); setNewDomain('') } }
  function removeDomain(domain: string) { setEditedProfile({ ...editedProfile, domains: (editedProfile.domains || []).filter(d => d !== domain) }) }

  function getNavForRole(role: string) {
    if (role === 'mentor') return [
      { label: 'Feed', icon: '📰', href: '/mentors/feed' }, { label: 'Messages', icon: '💬', href: '/mentors/messaging' },
      { label: 'Discover', icon: '🔍', href: '/mentors/search' }, { label: 'Profile', icon: '👤', href: '/profile' },
      { label: 'Alerts', icon: '🔔', href: '/mentors/notifications' }, { label: 'Grow', icon: '📈', href: '/mentors/grow-unit' },
    ]
    if (role === 'investor') return [{ label: 'Dashboard', icon: '💎', href: '/investors' }, { label: 'Profile', icon: '👤', href: '/profile' }]
    return [
      { label: 'Feed', icon: '📰', href: '/founders/feed' }, { label: 'Messages', icon: '💬', href: '/founders/messaging' },
      { label: 'Discover', icon: '🔍', href: '/founders/search' }, { label: 'Profile', icon: '👤', href: '/profile' },
      { label: 'Alerts', icon: '🔔', href: '/founders/notifications' }, { label: 'Grow', icon: '📈', href: '/founders/grow-unit' },
    ]
  }

  function getPortalLabel(role: string) { if (role === 'mentor') return 'MENTOR PORTAL'; if (role === 'investor') return 'INVESTOR PORTAL'; return 'FOUNDER PORTAL' }
  function getDefaultHeadline() { return (ROLE_TAGS[profileRole] || 'MEMBER') + ' · CoFlare Network' }
  function getRoleColor(role: string) { if (role === 'mentor') return 'bg-rust/10 text-rust border-rust/20'; if (role === 'investor') return 'bg-purple-50 text-purple-600 border-purple-200'; return 'bg-teal-light text-teal-dark border-teal/20' }

  const NAV_ITEMS = getNavForRole(profileRole)
  const avatarUrl = editedProfile.avatar_url || profile.avatar_url || null
  const fullName = editedProfile.full_name || profile.full_name || 'User'
  const initials = getInitials(fullName)
  const userGradient = getGradient(fullName)
  const safeSkills: string[] = editedProfile.skills || []
  const safeDomains: string[] = editedProfile.domains || []

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cream via-white to-teal/5 flex flex-col lg:flex-row">
      <Sidebar navItems={NAV_ITEMS} profile={profile} portalLabel={getPortalLabel(profileRole)} />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        <div className="bg-white/80 backdrop-blur border-b border-line/30 px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="font-display text-lg sm:text-xl text-ink">My Profile</h1>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-cream text-xs font-semibold shadow-md overflow-hidden shrink-0`}>
            {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" /> : initials}
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-6xl mx-auto">

            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z"/></svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 sm:px-5 py-2 border-2 border-line rounded-xl text-xs sm:text-sm font-medium text-ink-soft hover:bg-cream transition-all">Cancel</button>
                  <button onClick={handleSave} disabled={loading} className="px-4 sm:px-5 py-2 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all">{loading ? 'Saving...' : 'Save'}</button>
                </div>
              )}
            </div>

            <div className="bg-white border border-line/30 rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="h-32 sm:h-40 lg:h-48 relative overflow-hidden bg-gradient-to-r from-ink via-teal-dark to-teal">
                <div className="absolute inset-0 opacity-20"><div className="absolute top-10 left-10 w-40 h-40 bg-teal/30 rounded-full blur-3xl"/><div className="absolute bottom-0 right-10 w-60 h-60 bg-rust/20 rounded-full blur-3xl"/></div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 -mt-12 sm:-mt-14 lg:-mt-16 relative">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="relative group self-center sm:self-auto">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br ${userGradient} ring-4 ring-teal/10`}>
                      {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <span className="text-cream text-2xl sm:text-3xl font-semibold">{initials}</span>}
                    </div>
                    {isEditing && (
                      <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-teal rounded-full flex items-center justify-center shadow-lg hover:bg-teal-dark transition-all text-cream text-xs font-bold">+</button>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <button onClick={handleShare} className="px-3 sm:px-4 py-2 border-2 border-line rounded-xl text-xs sm:text-sm text-ink-soft hover:bg-cream transition-all">Share</button>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-2 flex-wrap">
                        <input type="text" value={editedProfile.full_name || ''} onChange={e => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                          className="font-display text-xl sm:text-2xl lg:text-3xl text-ink bg-cream border-2 border-line/50 rounded-lg px-3 py-1 outline-none focus:border-teal" placeholder="Full Name" />
                        {profileIsVerified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal/20">VERIFIED</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleColor(profileRole)}`}>{ROLE_TAGS[profileRole] || 'MEMBER'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={editedProfile.headline || ''} onChange={e => setEditedProfile({ ...editedProfile, headline: e.target.value })}
                          className="text-sm text-ink-soft bg-cream border-2 border-line/50 rounded-lg px-3 py-1 outline-none focus:border-teal" placeholder="Headline" />
                        <input type="text" value={editedProfile.company || ''} onChange={e => setEditedProfile({ ...editedProfile, company: e.target.value })}
                          className="text-sm text-ink-soft bg-cream border-2 border-line/50 rounded-lg px-3 py-1 outline-none focus:border-teal" placeholder="Company" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-1">
                        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-ink">{fullName}</h1>
                        {profileIsVerified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-dark border border-teal/20">VERIFIED</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleColor(profileRole)}`}>{ROLE_TAGS[profileRole] || 'MEMBER'}</span>
                      </div>
                      <p className="text-sm text-ink-soft">{editedProfile.headline || getDefaultHeadline()}{editedProfile.company && <span> at <span className="text-teal font-semibold">{editedProfile.company}</span></span>}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h2 className="font-display text-base sm:text-lg text-ink mb-3 sm:mb-4">About Me</h2>
                  {isEditing ? (
                    <textarea value={editedProfile.bio || ''} onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })} rows={6}
                      className="w-full bg-cream border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal transition-all resize-none" placeholder="Tell your story..." />
                  ) : (
                    <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{editedProfile.bio || 'No bio added yet.'}</p>
                  )}
                </div>

                <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h2 className="font-display text-base sm:text-lg text-ink mb-3 sm:mb-4">Skills</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-3">
                        <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Add a skill" className="flex-1 bg-cream border-2 border-line/50 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal" />
                        <button onClick={addSkill} className="px-4 py-2 bg-teal text-cream rounded-xl text-sm font-medium hover:bg-teal-dark transition-all">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">{safeSkills.map(skill => <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-light/50 text-teal-dark rounded-lg text-sm border border-teal/20">{skill}<button onClick={() => removeSkill(skill)} className="text-teal/50 hover:text-rust text-xs">×</button></span>)}</div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">{safeSkills.length === 0 ? <p className="text-sm text-muted">No skills added</p> : safeSkills.map(skill => <span key={skill} className="px-3 py-1.5 bg-cream border border-line/30 rounded-lg text-sm text-ink-soft">{skill}</span>)}</div>
                  )}
                </div>

                <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h2 className="font-display text-base sm:text-lg text-ink mb-3 sm:mb-4">Domains</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-3">
                        <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                          placeholder="Add a domain" className="flex-1 bg-cream border-2 border-line/50 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal" />
                        <button onClick={addDomain} className="px-4 py-2 bg-teal text-cream rounded-xl text-sm font-medium hover:bg-teal-dark transition-all">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">{safeDomains.map(domain => <span key={domain} className="inline-flex items-center gap-1 px-3 py-1.5 bg-rust/10 text-rust rounded-lg text-sm border border-rust/20">{domain}<button onClick={() => removeDomain(domain)} className="text-rust/50 hover:text-rust text-xs">×</button></span>)}</div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">{safeDomains.length === 0 ? <p className="text-sm text-muted">No domains added</p> : safeDomains.map(domain => <span key={domain} className="px-3 py-1.5 bg-rust/10 text-rust rounded-lg text-sm border border-rust/20">{domain}</span>)}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h2 className="font-display text-base sm:text-lg text-ink mb-3 sm:mb-4">Location</h2>
                    {isEditing ? <input type="text" value={editedProfile.location || ''} onChange={e => setEditedProfile({ ...editedProfile, location: e.target.value })} placeholder="City, State" className="w-full bg-cream border-2 border-line/50 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal" />
                      : <p className="text-sm text-ink-soft">{editedProfile.location || 'Not specified'}</p>}
                  </div>
                  <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h2 className="font-display text-base sm:text-lg text-ink mb-3 sm:mb-4">LinkedIn</h2>
                    {isEditing ? <input type="url" value={editedProfile.linkedin_url || ''} onChange={e => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full bg-cream border-2 border-line/50 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal" />
                      : editedProfile.linkedin_url ? <a href={editedProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal hover:text-teal-dark break-all">{editedProfile.linkedin_url}</a> : <p className="text-sm text-muted">Not added</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div className="bg-gradient-to-br from-ink to-ink-soft text-cream rounded-2xl p-5 sm:p-6 shadow-xl">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cream/50 font-semibold">Network Insights</span>
                  <div className="space-y-4 mt-4">
                    {[{ label: 'Posts', value: profilePostsCount, color: 'text-teal' }, { label: 'Connections', value: profileConnectionsCount, color: 'text-rust' }, { label: 'Views', value: 0, color: 'text-purple-400' }].map(item => (
                      <div key={item.label} className="flex items-center justify-between"><span className="text-xs text-cream/60">{item.label}</span><span className={`font-display text-xl sm:text-2xl font-semibold ${item.color}`}>{item.value}</span></div>
                    ))}
                  </div>
                </div>
                <Link href={profileRole === 'mentor' ? '/mentors/feed' : profileRole === 'investor' ? '/investors' : '/founders/feed'}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-2xl text-sm font-medium hover:shadow-xl transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Create Post
                </Link>
                <div className="bg-white border border-line/30 rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                  <h3 className="font-semibold text-ink mb-1">Share Profile</h3>
                  <p className="text-xs text-muted mb-4">Let others discover you</p>
                  <button onClick={handleShare} className="w-full py-2.5 bg-cream border border-line/50 text-ink-soft rounded-xl text-sm font-medium hover:bg-cream-dark transition-all">Copy Link</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showShareToast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up">Profile link copied!</div>}
      {showSaveToast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up">Profile updated!</div>}
    </div>
  )
}