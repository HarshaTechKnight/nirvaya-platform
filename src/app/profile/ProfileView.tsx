'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    'from-teal-500 to-teal-600', 'from-orange-500 to-orange-600',
    'from-purple-500 to-indigo-600', 'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
  ]
  const index = (seed || 'U').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[index % gradients.length]
}

export default function PublicProfileView({
  profile,
  viewerProfile,
  connection,
}: {
  profile: any
  viewerProfile: any
  connection: any
}) {
  const router = useRouter()
  const supabase = createClient()
  const [currentConnection, setCurrentConnection] = useState(connection)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState('about')
  const [isEditing, setIsEditing] = useState(false)
  const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'avatar' | 'cover' | null>(null)
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    headline: '',
    company: '',
    location: '',
    bio: '',
    skills: [] as string[],
    domains: [] as string[],
    linkedin_url: '',
    email: '',
    website: '',
    role: '',
  })
  const [newSkill, setNewSkill] = useState('')
  const [newDomain, setNewDomain] = useState('')
  
  // Image states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if viewing own profile
    if (viewerProfile && profile && viewerProfile.id === profile.id) {
      setIsViewingOwnProfile(true)
      // Initialize edit form with profile data
      setEditForm({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        company: profile.company || '',
        location: profile.location || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        domains: profile.domains || [],
        linkedin_url: profile.linkedin_url || '',
        email: profile.email || '',
        website: profile.website || '',
        role: profile.role || '',
      })
      setAvatarUrl(profile.avatar_url || null)
    }
  }, [profile, viewerProfile])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const viewerRole = viewerProfile?.role || 'founder'
  const fullName = profile.full_name || 'User'
  const initials = getInitials(fullName)
  const gradient = getGradient(fullName)

  const status =
    !currentConnection ? 'none' :
    currentConnection.status === 'accepted' ? 'accepted' :
    currentConnection.sender_id === viewerProfile.id ? 'pending_sent' : 'pending_received'

  async function sendRequest() {
    setBusy(true)
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({ sender_id: viewerProfile.id, receiver_id: profile.id, status: 'pending' })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setCurrentConnection(data)
        showToast('Connection request sent', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to send request', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function acceptRequest() {
    if (!currentConnection) return
    setBusy(true)
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', currentConnection.id)
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setCurrentConnection(data)
        showToast('Connection accepted', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to accept request', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function withdrawOrDecline() {
    if (!currentConnection) return
    setBusy(true)
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', currentConnection.id)
      
      if (error) throw error
      
      setCurrentConnection(null)
      showToast('Removed', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to remove', 'error')
    } finally {
      setBusy(false)
    }
  }

  function goToMessage() {
    const path = viewerRole === 'mentor' ? '/mentors/messaging' : '/founders/messaging'
    router.push(path + '?to=' + profile.id)
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (!file) return null
    
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar_${profile.id}_${Date.now()}.${fileExt}`
    const filePath = fileName
    
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, { upsert: true })
    
    if (uploadError) {
      showToast('Failed to upload image', 'error')
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)
    
    return publicUrl
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return
    
    setUploading(true)
    setUploadType('avatar')
    
    const publicUrl = await uploadImage(avatarFile)
    
    if (publicUrl) {
      setAvatarUrl(publicUrl)
      setAvatarPreview(null)
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
      
      if (error) {
        showToast('Failed to update profile picture', 'error')
      } else {
        showToast('Profile picture updated!', 'success')
        if (avatarInputRef.current) {
          avatarInputRef.current.value = ''
        }
        setAvatarFile(null)
      }
    }
    
    setUploading(false)
    setUploadType(null)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSaveProfile() {
    setUploading(true)
    
    let newAvatarUrl = avatarUrl
    
    if (avatarFile) {
      const uploaded = await uploadImage(avatarFile)
      if (uploaded) newAvatarUrl = uploaded
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        headline: editForm.headline,
        company: editForm.company,
        location: editForm.location,
        bio: editForm.bio,
        skills: editForm.skills,
        domains: editForm.domains,
        linkedin_url: editForm.linkedin_url,
        email: editForm.email,
        website: editForm.website,
        role: editForm.role,
        avatar_url: newAvatarUrl,
      })
      .eq('id', profile.id)
    
    if (error) {
      showToast('Failed to update profile: ' + error.message, 'error')
    } else {
      showToast('Profile updated successfully!', 'success')
      setIsEditing(false)
      setAvatarPreview(null)
      setAvatarFile(null)
      setAvatarUrl(newAvatarUrl)
      router.refresh()
    }
    setUploading(false)
  }

  function handleAddSkill() {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  function handleRemoveSkill(skill: string) {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  function handleAddDomain() {
    if (newDomain.trim() && !editForm.domains.includes(newDomain.trim())) {
      setEditForm(prev => ({
        ...prev,
        domains: [...prev.domains, newDomain.trim()]
      }))
      setNewDomain('')
    }
  }

  function handleRemoveDomain(domain: string) {
    setEditForm(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain)
    }))
  }

  // Navigation
  const founderNav = [
    { label: 'Feed', icon: '📰', href: '/founders/feed' },
    { label: 'My Network', icon: '👥', href: '/founders/connections' },
    { label: 'Messages', icon: '💬', href: '/founders/messaging' },
    { label: 'Discover', icon: '🔍', href: '/founders/search' },
    { label: 'Profile', icon: '👤', href: '/profile' },
    { label: 'Alerts', icon: '🔔', href: '/founders/notifications' },
    { label: 'Grow', icon: '📈', href: '/founders/grow-unit' },
  ]

  const mentorNav = [
    { label: 'Feed', icon: '📰', href: '/mentors/feed' },
    { label: 'My Network', icon: '👥', href: '/mentors/connections' },
    { label: 'Messages', icon: '💬', href: '/mentors/messaging' },
    { label: 'Discover', icon: '🔍', href: '/mentors/search' },
    { label: 'Profile', icon: '👤', href: '/profile' },
    { label: 'Alerts', icon: '🔔', href: '/mentors/notifications' },
    { label: 'Grow', icon: '📈', href: '/mentors/grow-unit' },
  ]

  const NAV = viewerRole === 'mentor' ? mentorNav : founderNav

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row">
      <Sidebar 
        navItems={NAV} 
        profile={viewerProfile} 
        portalLabel={viewerRole.toUpperCase() + ' PORTAL'} 
      />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="text-sm text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          {isViewingOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
          
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setAvatarPreview(null)
                  setAvatarFile(null)
                  // Reset form to original values
                  setEditForm({
                    full_name: profile.full_name || '',
                    headline: profile.headline || '',
                    company: profile.company || '',
                    location: profile.location || '',
                    bio: profile.bio || '',
                    skills: profile.skills || [],
                    domains: profile.domains || [],
                    linkedin_url: profile.linkedin_url || '',
                    email: profile.email || '',
                    website: profile.website || '',
                    role: profile.role || '',
                  })
                }}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={uploading}
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {initials}
                  </div>
                )}
              </div>
              
              {isViewingOwnProfile && isEditing && (
                <>
                  <label className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" ref={avatarInputRef} />
                  </label>
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={uploading && uploadType === 'avatar'}
                      className="absolute -bottom-1 -right-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                    >
                      {uploading && uploadType === 'avatar' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            
            {/* Edit Mode vs View Mode */}
            {isEditing ? (
              <div className="w-full max-w-md space-y-4">
                <div>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:border-teal-500"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="founder">Founder</option>
                    <option value="co-founder">Co-Founder</option>
                    <option value="mentor">Mentor</option>
                    <option value="investor">Investor</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="biz-owner">Biz Owner</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.headline}
                    onChange={(e) => setEditForm(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="Headline (e.g., Tech Entrepreneur)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="Company"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="Location"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={editForm.linkedin_url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    placeholder="Bio"
                  />
                </div>
                
                {/* Skills Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editForm.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      placeholder="Add a skill..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    />
                    <button onClick={handleAddSkill} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Domains Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domains</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editForm.domains.map((domain) => (
                      <span key={domain} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                        {domain}
                        <button onClick={() => handleRemoveDomain(domain)} className="hover:text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                      placeholder="Add a domain..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    />
                    <button onClick={handleAddDomain} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h1>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {ROLE_TAGS[profile.role || ''] || 'MEMBER'}
                  </span>
                  {profile.is_verified && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-center max-w-md mb-3">
                  {profile.headline || (profile.role || '').toUpperCase()}
                  {profile.company && ` at ${profile.company}`}
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons for Non-Owners */}
          {!isViewingOwnProfile && !isEditing && (
            <div className="flex justify-center gap-3 mb-8">
              {status === 'none' && (
                <button onClick={sendRequest} disabled={busy}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
                  {busy ? 'Sending...' : 'Connect'}
                </button>
              )}
              {status === 'pending_sent' && (
                <button onClick={withdrawOrDecline} disabled={busy}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Withdraw Request
                </button>
              )}
              {status === 'pending_received' && (
                <div className="flex gap-2">
                  <button onClick={acceptRequest} disabled={busy}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
                    Accept
                  </button>
                  <button onClick={withdrawOrDecline} disabled={busy}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Decline
                  </button>
                </div>
              )}
              {status === 'accepted' && (
                <div className="flex gap-2">
                  <button onClick={goToMessage}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                    Message
                  </button>
                  <button onClick={withdrawOrDecline} disabled={busy}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tabs - Only show when not editing */}
          {!isEditing && (
            <>
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8">
                  {[
                    { id: 'about', label: 'About' },
                    { id: 'skills', label: 'Skills & Expertise' },
                    { id: 'domains', label: 'Domains' },
                    { id: 'contact', label: 'Contact' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? 'text-teal-600 border-b-2 border-teal-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* About Section */}
                {activeTab === 'about' && profile.bio && (
                  <div className="bg-white rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Skills Section */}
                {activeTab === 'skills' && (
                  <div className="bg-white rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills || []).map((skill: string) => (
                        <span 
                          key={skill} 
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {(profile.skills || []).length === 0 && (
                        <p className="text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Domains Section */}
                {activeTab === 'domains' && (
                  <div className="bg-white rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {(profile.domains || []).map((domain: string) => (
                        <span 
                          key={domain} 
                          className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200"
                        >
                          {domain}
                        </span>
                      ))}
                      {(profile.domains || []).length === 0 && (
                        <p className="text-gray-500">No domains added yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Section */}
                {activeTab === 'contact' && (
                  <div className="space-y-3">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">LinkedIn</h3>
                            <p className="text-sm text-gray-500">Connect professionally</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}

                    {profile.email && (
                      <a 
                        href={`mailto:${profile.email}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Email</h3>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {toast.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}