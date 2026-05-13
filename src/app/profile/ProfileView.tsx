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
    'from-teal-400 to-teal-600', 'from-rust-400 to-rust-600',
    'from-purple-400 to-indigo-600', 'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600', 'from-pink-400 to-rose-500',
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
    full_name: '',
    headline: '',
    company: '',
    bio: '',
    location: '',
    linkedin_url: '',
    domains: [],
    skills: [],
    ...profile,
  })
  const [newSkill, setNewSkill] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        company: profile.company || '',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        domains: profile.domains || [],
        skills: profile.skills || [],
        avatar_url: profile.avatar_url,
        id: profile.id,
        role: profile.role,
        posts_count: profile.posts_count,
        connections_count: profile.connections_count,
        is_verified: profile.is_verified,
      })
    }
  }, [profile])

  // EARLY RETURN if profile null
  if (!profile || !profile.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-bold text-2xl text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">We could not load your profile.</p>
          <button onClick={() => router.push('/auth/login')} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all">
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // After early return, TypeScript STILL not narrow inside closures (handleSave, handleAvatarUpload)
  // So extract as local const explicitly typed as string
  const profileId: string = profile.id
  const profileRole: string = profile.role || 'founder'
  const profileIsVerified = !!profile.is_verified
  const profilePostsCount = profile.posts_count || 0
  const profileConnectionsCount = profile.connections_count || 0

  async function handleShare() {
    const url = window.location.origin + '/profile/' + profileId
    try {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    } catch {
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editedProfile.full_name,
        headline: editedProfile.headline,
        company: editedProfile.company,
        bio: editedProfile.bio,
        location: editedProfile.location,
        linkedin_url: editedProfile.linkedin_url,
        domains: editedProfile.domains || [],
        skills: editedProfile.skills || [],
      } as any)
      .eq('id', profileId)

    if (!error) {
      setIsEditing(false)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 2000)
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = profileId + '-' + Date.now() + '.' + fileExt
    const filePath = 'avatars/' + fileName

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl } as any)
      .eq('id', profileId)

    if (!updateError) {
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 2000)
      window.location.reload()
    }
  }

  function addSkill() {
    const currentSkills = editedProfile.skills || []
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setEditedProfile({ ...editedProfile, skills: [...currentSkills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  function removeSkill(skill: string) {
    const currentSkills = editedProfile.skills || []
    setEditedProfile({ ...editedProfile, skills: currentSkills.filter(s => s !== skill) })
  }

  function addDomain() {
    const currentDomains = editedProfile.domains || []
    if (newDomain.trim() && !currentDomains.includes(newDomain.trim())) {
      setEditedProfile({ ...editedProfile, domains: [...currentDomains, newDomain.trim()] })
      setNewDomain('')
    }
  }

  function removeDomain(domain: string) {
    const currentDomains = editedProfile.domains || []
    setEditedProfile({ ...editedProfile, domains: currentDomains.filter(d => d !== domain) })
  }

  function getNavForRole(role: string) {
    if (role === 'mentor') return [
      { label: 'Feed', icon: 'F', href: '/mentors/feed' },
      { label: 'Messages', icon: 'M', href: '/mentors/messaging' },
      { label: 'Discover', icon: 'D', href: '/mentors/search' },
      { label: 'Profile', icon: 'P', href: '/profile' },
      { label: 'Alerts', icon: 'A', href: '/mentors/notifications' },
      { label: 'Grow', icon: 'G', href: '/mentors/grow-unit' },
    ]
    if (role === 'investor') return [
      { label: 'Dashboard', icon: 'D', href: '/investors' },
      { label: 'Profile', icon: 'P', href: '/profile' },
    ]
    return [
      { label: 'Feed', icon: 'F', href: '/founders/feed' },
      { label: 'Messages', icon: 'M', href: '/founders/messaging' },
      { label: 'Discover', icon: 'D', href: '/founders/search' },
      { label: 'Profile', icon: 'P', href: '/profile' },
      { label: 'Alerts', icon: 'A', href: '/founders/notifications' },
      { label: 'Grow', icon: 'G', href: '/founders/grow-unit' },
    ]
  }

  function getPortalLabel(role: string) {
    if (role === 'mentor') return 'MENTOR PORTAL'
    if (role === 'investor') return 'INVESTOR PORTAL'
    return 'FOUNDER PORTAL'
  }

  function getDefaultHeadline() {
    const tag = ROLE_TAGS[profileRole] || 'MEMBER'
    return tag + ' . CoFlare Network'
  }

  function getRoleColor(role: string) {
    if (role === 'mentor') return 'bg-rust-50 text-rust-600 border-rust-200'
    if (role === 'investor') return 'bg-purple-50 text-purple-600 border-purple-200'
    return 'bg-teal-50 text-teal-600 border-teal-200'
  }

  const NAV_ITEMS = getNavForRole(profileRole)
  const avatarUrl = editedProfile.avatar_url || profile.avatar_url || null
  const fullName = editedProfile.full_name || profile.full_name || 'User'
  const initials = getInitials(fullName)
  const userGradient = getGradient(fullName)
  const safeSkills: string[] = editedProfile.skills || []
  const safeDomains: string[] = editedProfile.domains || []

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col lg:flex-row">

      <Sidebar navItems={NAV_ITEMS} profile={profile} portalLabel={getPortalLabel(profileRole)} />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">

        {/* TOP BAR */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="font-bold text-lg sm:text-xl text-gray-900">My Profile</h1>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${userGradient} flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden shrink-0`}>
            {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" /> : initials}
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">

            {/* EDIT TOGGLE */}
            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProfile({
                        full_name: profile.full_name || '',
                        headline: profile.headline || '',
                        company: profile.company || '',
                        bio: profile.bio || '',
                        location: profile.location || '',
                        linkedin_url: profile.linkedin_url || '',
                        domains: profile.domains || [],
                        skills: profile.skills || [],
                        avatar_url: profile.avatar_url,
                        id: profile.id,
                        role: profile.role,
                        posts_count: profile.posts_count,
                        connections_count: profile.connections_count,
                        is_verified: profile.is_verified,
                      })
                    }}
                    className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* COVER CARD */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="h-32 sm:h-40 lg:h-48 relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="px-4 sm:px-6 lg:px-8 pb-6 -mt-12 sm:-mt-14 lg:-mt-16 relative">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
                  <div className="relative group self-center sm:self-auto">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br ${userGradient} ring-4 ring-teal-100 flex items-center justify-center`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl sm:text-3xl font-bold">{initials}</span>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600 transition-all text-white text-xs font-bold"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <button onClick={handleShare} className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                      Share
                    </button>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-2 flex-wrap">
                        <input
                          type="text"
                          value={editedProfile.full_name || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                          className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none focus:border-teal-400"
                          placeholder="Full Name"
                        />
                        {profileIsVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">VERIFIED</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleColor(profileRole)}`}>
                          {ROLE_TAGS[profileRole] || 'MEMBER'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editedProfile.headline || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })}
                          className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none focus:border-teal-400"
                          placeholder="Headline"
                        />
                        <input
                          type="text"
                          value={editedProfile.company || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                          className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none focus:border-teal-400"
                          placeholder="Company"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-1">
                        <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900">{fullName}</h1>
                        {profileIsVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">VERIFIED</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleColor(profileRole)}`}>
                          {ROLE_TAGS[profileRole] || 'MEMBER'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {editedProfile.headline || getDefaultHeadline()}
                        {editedProfile.company && <span> at <span className="text-teal-600 font-semibold">{editedProfile.company}</span></span>}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">

              {/* LEFT COLUMN */}
              <div className="space-y-6">

                {/* BIO */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">About Me</h2>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      rows={6}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-teal-400 transition-all resize-none"
                      placeholder="Tell your story..."
                    />
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {editedProfile.bio || 'No bio added yet. Click Edit Profile to share your story.'}
                    </p>
                  )}
                </div>

                {/* SKILLS */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">Skills and Expertise</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Add a skill"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                        />
                        <button onClick={addSkill} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {safeSkills.length === 0 ? (
                          <p className="text-sm text-gray-400">No skills added yet.</p>
                        ) : (
                          safeSkills.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm border border-teal-200">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="ml-1 text-teal-400 hover:text-teal-600 text-xs">x</button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {safeSkills.length === 0 ? (
                        <p className="text-sm text-gray-400">No skills added yet</p>
                      ) : (
                        safeSkills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200">
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* DOMAINS */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">Areas of Interest</h2>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                          placeholder="Add a domain"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                        />
                        <button onClick={addDomain} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {safeDomains.length === 0 ? (
                          <p className="text-sm text-gray-400">No domains added yet.</p>
                        ) : (
                          safeDomains.map(domain => (
                            <span key={domain} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">
                              {domain}
                              <button onClick={() => removeDomain(domain)} className="ml-1 text-purple-400 hover:text-purple-600 text-xs">x</button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {safeDomains.length === 0 ? (
                        <p className="text-sm text-gray-400">No domains added yet</p>
                      ) : (
                        safeDomains.map(domain => (
                          <span key={domain} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">
                            {domain}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* LOCATION + LINKEDIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-4">Location</h2>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        placeholder="City, State, Country"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{editedProfile.location || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-4">LinkedIn</h2>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedProfile.linkedin_url || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                      />
                    ) : (
                      editedProfile.linkedin_url ? (
                        <a href={editedProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700 break-all">
                          {editedProfile.linkedin_url}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">No LinkedIn profile added</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* STATS */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">Network Impact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Posts</span>
                      <span className="font-bold text-2xl text-teal-400">{profilePostsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Connections</span>
                      <span className="font-bold text-2xl text-rust-400">{profileConnectionsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Profile Views</span>
                      <span className="font-bold text-2xl text-purple-400">0</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={profileRole === 'mentor' ? '/mentors/feed' : profileRole === 'investor' ? '/investors' : '/founders/feed'}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl transition-all"
                >
                  Create New Post
                </Link>

                {/* SHARE */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Share Your Profile</h3>
                  <p className="text-xs text-gray-500 mb-4">Let others discover you</p>
                  <button
                    onClick={handleShare}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                  >
                    Copy Profile Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* TOASTS */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
            Profile link copied
          </div>
        </div>
      )}

      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
            Profile updated successfully
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}