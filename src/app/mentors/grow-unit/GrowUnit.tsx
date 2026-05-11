'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

const COURSE_TYPES = [
  { value: 'article', label: 'Article', icon: '📄', color: 'from-blue-500 to-cyan-500' },
  { value: 'video', label: 'Video', icon: '🎬', color: 'from-rust to-rust-dark' },
  { value: 'pdf', label: 'PDF Guide', icon: '📕', color: 'from-purple-500 to-indigo-600' },
  { value: 'workshop', label: 'Workshop', icon: '🎓', color: 'from-amber-400 to-orange-500' },
  { value: 'template', label: 'Template', icon: '📋', color: 'from-emerald-400 to-teal-600' },
]

export default function GrowUnit({
  initialCourses,
  initialJournals,
  profile,
}: {
  initialCourses: any[]
  initialJournals: any[]
  profile: any
}) {
  const supabase = createClient()
  const [courses, setCourses] = useState(initialCourses)
  const [journals, setJournals] = useState(initialJournals)
  const [tab, setTab] = useState<'overview' | 'course' | 'journal'>('overview')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Course form
  const [cTitle, setCTitle] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cType, setCType] = useState('article')
  const [cUrl, setCUrl] = useState('')
  const [cTags, setCTags] = useState('')
  const [cLoading, setCLoading] = useState(false)

  // Journal form
  const [jTitle, setJTitle] = useState('')
  const [jContent, setJContent] = useState('')
  const [jTags, setJTags] = useState('')
  const [jLoading, setJLoading] = useState(false)

  // Stats
  const totalPublished = courses.length + journals.length
  const courseTypes = [...new Set(courses.map(c => c.type))]
  const recentItems = [...courses, ...journals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  async function publishCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!cTitle.trim()) return
    setCLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .insert({
        mentor_id: profile.id,
        title: cTitle.trim(),
        description: cDesc.trim(),
        type: cType,
        file_url: cUrl.trim(),
        tags: cTags.split(',').map(t => t.trim()).filter(Boolean),
        is_published: true,
      } as any)
      .select()
      .single()
    if (!error && data) {
      setCourses([data, ...courses])
      setCTitle('')
      setCDesc('')
      setCUrl('')
      setCTags('')
      setCType('article')
      setTab('overview')
      showToast('🎉 Course published successfully!')
    } else {
      showToast('❌ Failed to publish course')
    }
    setCLoading(false)
  }

  async function publishJournal(e: React.FormEvent) {
    e.preventDefault()
    if (!jTitle.trim() || !jContent.trim()) return
    setJLoading(true)
    const { data, error } = await supabase
      .from('journals')
      .insert({
        mentor_id: profile.id,
        title: jTitle.trim(),
        content: jContent.trim(),
        tags: jTags.split(',').map(t => t.trim()).filter(Boolean),
        is_published: true,
      } as any)
      .select()
      .single()
    if (!error && data) {
      setJournals([data, ...journals])
      setJTitle('')
      setJContent('')
      setJTags('')
      setTab('overview')
      showToast('📝 Journal published successfully!')
    } else {
      showToast('❌ Failed to publish journal')
    }
    setJLoading(false)
  }

  function getTypeConfig(type: string) {
    return COURSE_TYPES.find(t => t.value === type) || COURSE_TYPES[0]
  }

  function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return Math.floor(s / 60) + 'm ago'
    if (s < 86400) return Math.floor(s / 3600) + 'h ago'
    if (s < 604800) return Math.floor(s / 86400) + 'd ago'
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50">
      <TopBar title="Grow Unit" profile={profile} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rust/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-teal font-semibold mb-3 bg-teal-light/50 px-3 py-1.5 rounded-full border border-teal/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Mentor Studio
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink mb-2">
                Grow <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">Unit</span>
              </h1>
              <p className="text-sm text-ink-soft max-w-lg">
                Share your knowledge with the founder community. Publish courses, write journals, and help startups grow.
              </p>
            </div>
            
            <div className="flex gap-2.5">
              <button
                onClick={() => setTab('course')}
                className={`group px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  tab === 'course'
                    ? 'bg-gradient-to-r from-teal to-teal-dark text-cream shadow-lg shadow-teal/20'
                    : 'bg-white border-2 border-line/50 text-ink-soft hover:border-teal/50 hover:shadow-md'
                }`}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Course
              </button>
              <button
                onClick={() => setTab('journal')}
                className={`group px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  tab === 'journal'
                    ? 'bg-gradient-to-r from-rust to-rust-dark text-cream shadow-lg shadow-rust/20'
                    : 'bg-white border-2 border-line/50 text-ink-soft hover:border-rust/50 hover:shadow-md'
                }`}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z" />
                </svg>
                New Journal
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-line/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold bg-teal/10 text-teal px-2 py-1 rounded-full">📚</span>
                </div>
                <div className="font-display text-3xl text-teal font-bold group-hover:scale-110 transition-transform">{courses.length}</div>
                <div className="text-xs text-muted mt-1 font-medium">Courses Published</div>
              </div>

              <div className="bg-white border border-line/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rust to-rust-dark flex items-center justify-center text-white shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold bg-rust/10 text-rust px-2 py-1 rounded-full">📝</span>
                </div>
                <div className="font-display text-3xl text-rust font-bold group-hover:scale-110 transition-transform">{journals.length}</div>
                <div className="text-xs text-muted mt-1 font-medium">Journals Written</div>
              </div>

              <div className="bg-white border border-line/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{courseTypes.length}</span>
                </div>
                <div className="font-display text-3xl text-purple-600 font-bold group-hover:scale-110 transition-transform">{courseTypes.length}</div>
                <div className="text-xs text-muted mt-1 font-medium">Content Types</div>
              </div>

              <div className="bg-gradient-to-br from-ink to-ink-soft text-cream rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="text-[10px] uppercase tracking-wider text-cream/50 font-semibold mb-2">Total Content</div>
                  <div className="font-display text-4xl font-bold group-hover:scale-110 transition-transform">{totalPublished}</div>
                  <div className="text-xs text-cream/60 mt-1">Resources for founders</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {recentItems.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-lg text-ink mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-teal rounded-full"></span>
                  Recent Activity
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentItems.map((item, idx) => {
                    const isCourse = 'type' in item
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-line/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all animate-fade-up flex items-start gap-3"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${isCourse ? 'from-teal to-teal-dark' : 'from-rust to-rust-dark'} flex items-center justify-center text-white shadow-md shrink-0`}>
                          {isCourse ? '📚' : '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-ink truncate">{item.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted">{timeAgo(item.created_at)}</span>
                            {isCourse && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-light/50 text-teal-dark">
                                {item.type?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My Courses Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-ink flex items-center gap-2">
                  <span className="text-2xl">📚</span> My Courses
                </h2>
                {courses.length > 0 && (
                  <span className="text-xs text-muted">{courses.length} course{courses.length > 1 ? 's' : ''}</span>
                )}
              </div>
              
              {courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((c, idx) => {
                    const typeConfig = getTypeConfig(c.type)
                    return (
                      <div
                        key={c.id}
                        className="group bg-white border border-line/30 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden animate-fade-up"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-teal/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${typeConfig.color} text-white mb-3 shadow-sm`}>
                          {typeConfig.icon} {typeConfig.label}
                        </div>
                        <h3 className="font-display text-base text-ink mb-2 group-hover:text-teal transition-colors line-clamp-2">{c.title}</h3>
                        {c.description && (
                          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2 mb-3">{c.description}</p>
                        )}
                        {c.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {c.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-[10px] bg-cream-dark/30 border border-line/20 px-2 py-0.5 rounded-full text-muted">
                                #{tag}
                              </span>
                            ))}
                            {c.tags.length > 3 && (
                              <span className="text-[10px] text-muted">+{c.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        {c.file_url && (
                          <div className="mt-3 pt-3 border-t border-line/20">
                            <a
                              href={c.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal hover:text-teal-dark font-medium flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Resource →
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <button
                  onClick={() => setTab('course')}
                  className="w-full bg-gradient-to-br from-cream to-cream-dark/30 border-2 border-dashed border-line/50 rounded-2xl p-10 text-center hover:border-teal/40 hover:shadow-lg transition-all group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                  <div className="text-sm text-ink-soft font-medium mb-1">No courses yet</div>
                  <div className="text-xs text-muted mb-4">Share your knowledge with the community</div>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl text-xs font-semibold group-hover:shadow-lg group-hover:shadow-teal/20 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Course
                  </span>
                </button>
              )}
            </div>

            {/* My Journals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-ink flex items-center gap-2">
                  <span className="text-2xl">📝</span> My Journals
                </h2>
                {journals.length > 0 && (
                  <span className="text-xs text-muted">{journals.length} journal{journals.length > 1 ? 's' : ''}</span>
                )}
              </div>
              
              {journals.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {journals.map((j, idx) => (
                    <div
                      key={j.id}
                      className="group bg-white border border-line/30 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden animate-fade-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rust/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rust to-rust-dark flex items-center justify-center text-xs text-white shadow-md">📝</div>
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-rust/10 text-rust border border-rust/20">
                          JOURNAL
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-ink mb-3 group-hover:text-rust transition-colors">{j.title}</h3>
                      <p className="text-sm text-ink-soft leading-relaxed line-clamp-4 whitespace-pre-line mb-4">{j.content}</p>
                      {j.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-line/20">
                          {j.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] bg-cream-dark/30 border border-line/20 px-2 py-0.5 rounded-full text-muted">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setTab('journal')}
                  className="w-full bg-gradient-to-br from-cream to-cream-dark/30 border-2 border-dashed border-line/50 rounded-2xl p-10 text-center hover:border-rust/40 hover:shadow-lg transition-all group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</div>
                  <div className="text-sm text-ink-soft font-medium mb-1">No journals yet</div>
                  <div className="text-xs text-muted mb-4">Write insights, research, and analysis for founders</div>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rust to-rust-dark text-cream rounded-xl text-xs font-semibold group-hover:shadow-lg group-hover:shadow-rust/20 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z" />
                    </svg>
                    Write Your First Journal
                  </span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Course Form */}
        {tab === 'course' && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <button
              onClick={() => setTab('overview')}
              className="text-xs text-muted hover:text-teal mb-4 flex items-center gap-1.5 group"
            >
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </button>

            <form onSubmit={publishCourse} className="bg-white border border-line/30 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-xl text-ink">Create New Course</h2>
                  <p className="text-xs text-muted">Share your expertise with the founder community</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">
                    Course Title <span className="text-rust">*</span>
                  </label>
                  <input
                    required
                    value={cTitle}
                    onChange={e => setCTitle(e.target.value)}
                    placeholder="e.g., Foundational Funding Framework"
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Description</label>
                  <textarea
                    value={cDesc}
                    onChange={e => setCDesc(e.target.value)}
                    rows={4}
                    placeholder="What will founders learn from this course?"
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Content Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COURSE_TYPES.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setCType(type.value)}
                          className={`p-3 rounded-xl text-xs font-semibold transition-all border-2 flex items-center gap-2 ${
                            cType === type.value
                              ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-md`
                              : 'bg-cream/50 border-line/50 text-ink-soft hover:border-teal/50'
                          }`}
                        >
                          <span className="text-base">{type.icon}</span>
                          <span className="hidden sm:inline">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Resource URL</label>
                    <input
                      value={cUrl}
                      onChange={e => setCUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Tags</label>
                  <input
                    value={cTags}
                    onChange={e => setCTags(e.target.value)}
                    placeholder="funding, startup, pitch (comma separated)"
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={cLoading || !cTitle.trim()}
                    className="flex-1 py-3.5 bg-gradient-to-r from-teal to-teal-dark text-cream rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-teal/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {cLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Publish Course
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('overview')}
                    className="px-6 py-3.5 border-2 border-line rounded-xl text-sm font-medium text-ink-soft hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Journal Form */}
        {tab === 'journal' && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <button
              onClick={() => setTab('overview')}
              className="text-xs text-muted hover:text-teal mb-4 flex items-center gap-1.5 group"
            >
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Overview
            </button>

            <form onSubmit={publishJournal} className="bg-white border border-line/30 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rust to-rust-dark flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.6a2 2 0 112.8 2.8L11.8 15.2 8 16l.8-3.8L18.6 2.4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-xl text-ink">Write Journal Entry</h2>
                  <p className="text-xs text-muted">Share insights, research, and analysis</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">
                    Title <span className="text-rust">*</span>
                  </label>
                  <input
                    required
                    value={jTitle}
                    onChange={e => setJTitle(e.target.value)}
                    placeholder="e.g., Q3 Economic Growth — AP Innovation Hubs"
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-rust focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">
                    Content <span className="text-rust">*</span>
                  </label>
                  <textarea
                    required
                    value={jContent}
                    onChange={e => setJContent(e.target.value)}
                    rows={14}
                    placeholder="Write your insights, research findings, or analysis..."
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-rust focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Tags</label>
                  <input
                    value={jTags}
                    onChange={e => setJTags(e.target.value)}
                    placeholder="economics, innovation, ap (comma separated)"
                    className="w-full bg-cream/50 border-2 border-line/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-rust focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={jLoading || !jTitle.trim() || !jContent.trim()}
                    className="flex-1 py-3.5 bg-gradient-to-r from-rust to-rust-dark text-cream rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-rust/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {jLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Publish Journal
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('overview')}
                    className="px-6 py-3.5 border-2 border-line rounded-xl text-sm font-medium text-ink-soft hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ink to-ink-soft text-cream px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium z-50 animate-fade-up flex items-center gap-2">
          {toastMessage}
        </div>
      )}
    </div>
  )
}