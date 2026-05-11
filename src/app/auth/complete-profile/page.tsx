'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DOMAINS = [
  'Fintech', 'Edtech', 'Agritech', 'Healthtech', 'E-commerce',
  'Logistics', 'SaaS', 'Deep Tech', 'Clean Energy', 'Maritime Tech', 'Other'
]

type QuestionType = 'avatar' | 'text' | 'textarea' | 'select' | 'tags' | 'optional-text'

type Question = {
  id: string
  type: QuestionType
  prompt: string
  subtitle?: string
  placeholder?: string
  options?: string[]
  required?: boolean
  icon?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'avatar',
    type: 'avatar',
    prompt: 'Add a profile photo',
    subtitle: 'Helps people recognize you across the network. Optional but recommended.',
    icon: '📸',
  },
  {
    id: 'full_name',
    type: 'text',
    prompt: 'What is your name?',
    subtitle: 'This is how you will appear across CoFlare.',
    placeholder: 'e.g. Sai Kiran Vardhan',
    required: true,
    icon: '👤',
  },
  {
    id: 'headline',
    type: 'text',
    prompt: 'What do you do?',
    subtitle: 'A short headline. Founders, mentors, and investors will see this first.',
    placeholder: 'e.g. Founder at VizagEdge Technologies',
    icon: '💼',
  },
  {
    id: 'company',
    type: 'optional-text',
    prompt: 'Where do you work?',
    subtitle: 'Your company, startup, or organization name.',
    placeholder: 'e.g. VizagEdge Technologies',
    icon: '🏢',
  },
  {
    id: 'bio',
    type: 'textarea',
    prompt: 'Tell us your story',
    subtitle: 'A short executive summary about your work and what you are building.',
    placeholder: 'Driving the next generation of maritime logistics from Visakhapatnam...',
    icon: '✍️',
  },
  {
    id: 'location',
    type: 'text',
    prompt: 'Where are you based?',
    subtitle: 'Helps connect you with locals in the AP ecosystem.',
    placeholder: 'e.g. Vijayawada, AP',
    icon: '📍',
  },
  {
    id: 'domain',
    type: 'select',
    prompt: 'What is your primary domain?',
    subtitle: 'Pick the area that best describes your expertise or focus.',
    options: DOMAINS,
    icon: '🎯',
  },
  {
    id: 'skills',
    type: 'tags',
    prompt: 'What are your top skills?',
    subtitle: 'Add skills one at a time. Hit Enter or comma to add. 3 to 8 recommended.',
    placeholder: 'e.g. Strategic Planning',
    icon: '🛠️',
  },
  {
    id: 'linkedin_url',
    type: 'optional-text',
    prompt: 'Got a LinkedIn?',
    subtitle: 'Optional. Helps build trust in the network.',
    placeholder: 'https://linkedin.com/in/you',
    icon: '🔗',
  },
]

function getInitials(name: string) {
  return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function CompleteProfileWizard() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isAnimating, setIsAnimating] = useState(false)

  const currentQ = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1
  const progress = ((step + 1) / QUESTIONS.length) * 100

  useEffect(() => {
    if (inputRef.current && currentQ.type !== 'select' && currentQ.type !== 'avatar') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [step, currentQ.type])

  function getAnswer(id: string) {
    return answers[id] || (id === 'skills' ? [] : '')
  }

  function setAnswer(id: string, value: any) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function canProceed() {
    if (!currentQ.required) return true
    const val = answers[currentQ.id]
    if (currentQ.type === 'tags') return Array.isArray(val) && val.length > 0
    return val && String(val).trim().length > 0
  }

  function handleNext() {
    if (!canProceed() || isAnimating) return
    if (isLast) {
      submit()
      return
    }
    setDirection('forward')
    setIsAnimating(true)
    setTimeout(() => {
      setStep(step + 1)
      setIsAnimating(false)
    }, 300)
  }

  function handleBack() {
    if (step === 0 || isAnimating) return
    setDirection('backward')
    setIsAnimating(true)
    setTimeout(() => {
      setStep(step - 1)
      setIsAnimating(false)
    }, 300)
  }

  function handleSkip() {
    if (currentQ.required || isAnimating) return
    if (isLast) {
      submit()
      return
    }
    setDirection('forward')
    setIsAnimating(true)
    setTimeout(() => {
      setStep(step + 1)
      setIsAnimating(false)
    }, 300)
  }

  function addSkill() {
    const val = skillInput.trim().replace(',', '')
    if (!val) return
    const current = answers.skills || []
    if (current.includes(val)) {
      setSkillInput('')
      return
    }
    setAnswer('skills', [...current, val])
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    const current = answers.skills || []
    setAnswer('skills', current.filter((s: string) => s !== skill))
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const reader = new FileReader()
      reader.onload = ev => setPreviewUrl(ev.target?.result as string)
      reader.readAsDataURL(file)

      const ext = file.name.split('.').pop() || 'jpg'
      const path = user.id + '/avatar-' + Date.now() + '.' + ext

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        setError('Upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      setAnswer('avatar_url', urlData.publicUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function removeAvatar() {
    setAnswer('avatar_url', '')
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function submit() {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const savedRole = localStorage.getItem('selected_role') || 'founder'

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: answers.full_name || '',
          headline: answers.headline || '',
          bio: answers.bio || '',
          company: answers.company || '',
          location: answers.location || '',
          domains: answers.domain ? [answers.domain.toLowerCase()] : [],
          linkedin_url: answers.linkedin_url || '',
          skills: answers.skills || [],
          avatar_url: answers.avatar_url || null,
          is_profile_complete: true,
          role: savedRole,
        } as any)

      if (upsertError) {
        setError(upsertError.message)
        setLoading(false)
        return
      }

      localStorage.removeItem('selected_role')

      if (savedRole === 'mentor') router.push('/mentors/feed')
      else if (savedRole === 'investor') router.push('/investors')
      else router.push('/founders/feed')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (currentQ.type === 'tags') {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addSkill()
      }
      return
    }
    if (e.key === 'Enter' && currentQ.type !== 'textarea') {
      e.preventDefault()
      handleNext()
    }
  }

  const avatarUrl = answers.avatar_url || previewUrl

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-teal/5 flex flex-col relative overflow-hidden">
      
      {/* Animated background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rust/5 rounded-full blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal/10 rounded-full blur-3xl animate-pulse-slow -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* PROGRESS BAR */}
      <div className="relative px-6 sm:px-8 pt-8 pb-2 max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream text-xs font-bold shadow-lg">
              {step + 1}
            </div>
            <div className="text-xs uppercase tracking-wider text-teal font-semibold">
              of {QUESTIONS.length} steps
            </div>
          </div>
          {!currentQ.required && (
            <button 
              onClick={handleSkip} 
              className="group text-xs text-muted hover:text-ink transition-colors flex items-center gap-1.5"
            >
              Skip
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Enhanced progress bar */}
        <div className="relative h-2.5 bg-cream-dark/50 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full transition-all duration-500 ease-out relative"
            style={{ width: progress + '%' }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-2 px-1">
          {QUESTIONS.map((q, i) => {
            const filled = answers[q.id] && (
              q.type === 'tags' ? (answers[q.id] || []).length > 0 : true
            )
            return (
              <button
                key={q.id}
                onClick={() => !isAnimating && setStep(i)}
                className="group relative"
                title={q.prompt}
              >
                <div className={
                  'w-2 h-2 rounded-full transition-all duration-300 ' +
                  (i === step 
                    ? 'bg-teal scale-150 shadow-lg shadow-teal/30' 
                    : filled 
                      ? 'bg-teal/60 hover:bg-teal' 
                      : 'bg-line hover:bg-muted')
                }></div>
                {i === step && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-cream text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {q.prompt}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* QUESTION */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 relative">
        <div className="max-w-2xl w-full">
          
          {/* Question card with animation */}
          <div 
            className={
              'transition-all duration-300 transform ' +
              (isAnimating 
                ? (direction === 'forward' 
                  ? '-translate-x-8 opacity-0' 
                  : 'translate-x-8 opacity-0')
                : 'translate-x-0 opacity-100')
            }
          >
            {/* Icon & Question */}
            <div className="mb-8 text-center">
              {currentQ.icon && (
                <div className="text-5xl mb-4 animate-bounce-in inline-block">
                  {currentQ.icon}
                </div>
              )}
              <h1 className="font-display text-3xl sm:text-4xl text-ink mb-3 leading-tight bg-gradient-to-r from-ink to-ink-soft bg-clip-text text-transparent">
                {currentQ.prompt}
              </h1>
              {currentQ.subtitle && (
                <p className="text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
                  {currentQ.subtitle}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className="mb-6">

              {/* AVATAR UPLOAD */}
              {currentQ.type === 'avatar' && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="absolute -inset-2 bg-gradient-to-r from-teal/20 to-rust/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {avatarUrl ? (
                      <div className="relative">
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-teal-dark to-teal text-cream flex items-center justify-center text-5xl sm:text-6xl font-display border-4 border-white shadow-2xl group-hover:scale-105 transition-transform">
                        {getInitials(answers.full_name || 'U')}
                      </div>
                    )}

                    {uploading && (
                      <div className="absolute inset-0 bg-ink/60 rounded-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                          <span className="text-cream text-xs font-medium">Uploading...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-teal/30 animate-pulse-ring pointer-events-none"></div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="group px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-xl hover:shadow-teal/25 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {avatarUrl ? 'Change Photo' : 'Choose Photo'}
                    </button>

                    {avatarUrl && (
                      <button
                        onClick={removeAvatar}
                        disabled={uploading}
                        className="px-5 py-3 border-2 border-line text-ink-soft rounded-xl text-sm font-medium hover:bg-cream-dark/40 hover:border-rust/30 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-muted mt-4 text-center max-w-xs">
                    PNG, JPG, or WEBP. Max 2MB. Square images look best.
                  </p>
                </div>
              )}

              {/* TEXT */}
              {(currentQ.type === 'text' || currentQ.type === 'optional-text') && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <input
                    ref={inputRef as any}
                    autoFocus
                    type="text"
                    value={getAnswer(currentQ.id)}
                    onChange={e => setAnswer(currentQ.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={currentQ.placeholder}
                    className="relative w-full bg-white border-2 border-line rounded-2xl px-6 py-5 text-lg sm:text-xl outline-none focus:border-teal focus:shadow-xl focus:shadow-teal/5 transition-all"
                  />
                </div>
              )}

              {/* TEXTAREA */}
              {currentQ.type === 'textarea' && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <textarea
                    ref={inputRef as any}
                    autoFocus
                    rows={5}
                    value={getAnswer(currentQ.id)}
                    onChange={e => setAnswer(currentQ.id, e.target.value)}
                    placeholder={currentQ.placeholder}
                    className="relative w-full bg-white border-2 border-line rounded-2xl px-6 py-5 text-lg outline-none focus:border-teal focus:shadow-xl focus:shadow-teal/5 transition-all resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* SELECT */}
              {currentQ.type === 'select' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentQ.options?.map((opt, idx) => {
                    const selected = getAnswer(currentQ.id) === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => setAnswer(currentQ.id, opt)}
                        className={
                          'p-4 rounded-xl text-sm font-medium transition-all duration-300 border-2 transform hover:scale-105 ' +
                          (selected
                            ? 'border-teal bg-gradient-to-br from-teal to-teal-dark text-cream shadow-xl shadow-teal/25 scale-105'
                            : 'border-line bg-white text-ink-soft hover:border-teal/50 hover:shadow-lg')
                        }
                        style={{
                          animationDelay: `${idx * 50}ms`,
                          animation: 'slideUp 0.5s ease-out forwards',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* TAGS */}
              {currentQ.type === 'tags' && (
                <div>
                  <div className="relative group mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <input
                      ref={inputRef as any}
                      autoFocus
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={currentQ.placeholder}
                      className="relative w-full bg-white border-2 border-line rounded-2xl px-6 py-5 text-lg sm:text-xl outline-none focus:border-teal focus:shadow-xl focus:shadow-teal/5 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted mb-4 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Press Enter or comma to add
                  </p>

                  {(answers.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(answers.skills || []).map((s: string, idx: number) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-light to-teal-light/50 text-teal-dark rounded-full text-sm font-medium border border-teal/20 animate-slide-up hover:shadow-md transition-all group"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {s}
                          <button 
                            onClick={() => removeSkill(s)} 
                            className="w-5 h-5 rounded-full bg-teal/10 hover:bg-rust/20 hover:text-rust flex items-center justify-center text-xs transition-all"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {(!answers.skills || answers.skills.length === 0) && (
                    <div className="flex flex-wrap gap-2 opacity-30">
                      {['Leadership', 'Product', 'Strategy'].map(skill => (
                        <span key={skill} className="px-4 py-2.5 bg-cream-dark/30 rounded-full text-sm text-muted">
                          {skill}
                        </span>
                      ))}
                      <span className="px-4 py-2.5 text-sm text-muted self-center">← suggestions</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-rust-soft border border-rust/30 text-rust text-sm p-4 rounded-xl mb-5 flex items-start gap-3 animate-fade-up">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={step === 0 || isAnimating}
                className="group px-5 py-3 text-sm text-ink-soft font-medium hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading || uploading || isAnimating}
                className="group px-8 py-3.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-sm font-medium hover:shadow-xl hover:shadow-teal/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-w-[160px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : isLast ? (
                  <>
                    Enter CoFlare
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-5 text-xs text-muted flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Press Enter to continue
              {!currentQ.required && ' · Skip to leave blank'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}