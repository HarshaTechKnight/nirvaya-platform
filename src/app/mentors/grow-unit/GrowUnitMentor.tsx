'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

type Course = {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  cover_url: string
  is_published: boolean
  views_count: number
  created_at: string
}

type Journal = {
  id: string
  title: string
  content: string
  tags: string[]
  read_minutes: number
  cover_url: string
  is_published: boolean
  views_count: number
  created_at: string
}

const CATEGORIES = ['Fundraising', 'Product', 'Engineering', 'Marketing', 'Sales', 'Operations', 'Hiring', 'Strategy']
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd ago'
}

export default function GrowUnitMentor({
  profile,
  initialCourses,
  initialJournals,
}: {
  profile: any
  initialCourses: Course[]
  initialJournals: Journal[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<'courses' | 'journals'>('courses')
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [journals, setJournals] = useState<Journal[]>(initialJournals)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showJournalForm, setShowJournalForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Course form state
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [courseCat, setCourseCat] = useState(CATEGORIES[0])
  const [courseDiff, setCourseDiff] = useState('beginner')
  const [courseDuration, setCourseDuration] = useState('30')
  const [courseFile, setCourseFile] = useState<File | null>(null)
  const [courseCoverFile, setCourseCoverFile] = useState<File | null>(null)
  const [savingCourse, setSavingCourse] = useState(false)
  const courseCoverRef = useRef<HTMLInputElement>(null)
  const courseFileRef = useRef<HTMLInputElement>(null)

  // Journal form state
  const [journalTitle, setJournalTitle] = useState('')
  const [journalContent, setJournalContent] = useState('')
  const [journalTags, setJournalTags] = useState('')
  const [journalCoverFile, setJournalCoverFile] = useState<File | null>(null)
  const [savingJournal, setSavingJournal] = useState(false)
  const journalCoverRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'bin'
    const path = profile.id + '/' + folder + '/' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('mentor-content').upload(path, file)
    if (error) {
      showToast('Upload failed: ' + error.message)
      return null
    }
    const { data } = supabase.storage.from('mentor-content').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSaveCourse(asDraft: boolean) {
    if (!courseTitle.trim()) {
      showToast('Title required')
      return
    }
    setSavingCourse(true)

    let coverUrl: string | null = null
    if (courseCoverFile) coverUrl = await uploadFile(courseCoverFile, 'courses/covers')

    let contentUrl: string | null = null
    if (courseFile) contentUrl = await uploadFile(courseFile, 'courses/content')

    const { data, error } = await supabase
      .from('courses')
      .insert({
        mentor_id: profile.id,
        title: courseTitle.trim(),
        description: courseDesc.trim(),
        category: courseCat,
        difficulty: courseDiff,
        duration_minutes: parseInt(courseDuration) || 30,
        cover_url: coverUrl,
        content_url: contentUrl,
        is_published: !asDraft,
      } as any)
      .select()
      .single()

    if (error) {
      showToast('Failed: ' + error.message)
    } else if (data) {
      setCourses([data as Course, ...courses])
      setCourseTitle('')
      setCourseDesc('')
      setCourseFile(null)
      setCourseCoverFile(null)
      setShowCourseForm(false)
      showToast(asDraft ? 'Saved as draft' : 'Course published')
    }
    setSavingCourse(false)
  }

  async function handleSaveJournal(asDraft: boolean) {
    if (!journalTitle.trim() || !journalContent.trim()) {
      showToast('Title and content required')
      return
    }
    setSavingJournal(true)

    let coverUrl: string | null = null
    if (journalCoverFile) coverUrl = await uploadFile(journalCoverFile, 'journals/covers')

    const wordCount = journalContent.trim().split(/\s+/).length
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

    const { data, error } = await supabase
      .from('journals')
      .insert({
        mentor_id: profile.id,
        title: journalTitle.trim(),
        content: journalContent.trim(),
        tags: journalTags.split(',').map(t => t.trim()).filter(Boolean),
        cover_url: coverUrl,
        read_minutes: readMinutes,
        is_published: !asDraft,
      } as any)
      .select()
      .single()

    if (error) {
      showToast('Failed: ' + error.message)
    } else if (data) {
      setJournals([data as Journal, ...journals])
      setJournalTitle('')
      setJournalContent('')
      setJournalTags('')
      setJournalCoverFile(null)
      setShowJournalForm(false)
      showToast(asDraft ? 'Saved as draft' : 'Journal published')
    }
    setSavingJournal(false)
  }

  async function togglePublish(type: 'course' | 'journal', id: string, current: boolean) {
    const table = type === 'course' ? 'courses' : 'journals'
    const { error } = await supabase
      .from(table)
      .update({ is_published: !current } as any)
      .eq('id', id)

    if (!error) {
      if (type === 'course') {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: !current } : c))
      } else {
        setJournals(prev => prev.map(j => j.id === id ? { ...j, is_published: !current } : j))
      }
      showToast(current ? 'Unpublished' : 'Published')
    }
  }

  async function deleteItem(type: 'course' | 'journal', id: string) {
    if (!confirm('Delete permanently?')) return
    const table = type === 'course' ? 'courses' : 'journals'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) {
      if (type === 'course') setCourses(prev => prev.filter(c => c.id !== id))
      else setJournals(prev => prev.filter(j => j.id !== id))
      showToast('Deleted')
    }
  }

  return (
    <>
      <TopBar title="Grow Unit" profile={profile} />
      <div className="p-8 max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-ink mb-1">Grow Unit</h1>
          <p className="text-sm text-ink-soft">Publish courses and journals to share your expertise with founders.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-line/50 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-semibold">Courses</div>
            <div className="font-display text-2xl text-ink mt-1">{courses.length}</div>
          </div>
          <div className="bg-white border border-line/50 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-semibold">Journals</div>
            <div className="font-display text-2xl text-ink mt-1">{journals.length}</div>
          </div>
          <div className="bg-white border border-line/50 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-semibold">Published</div>
            <div className="font-display text-2xl text-ink mt-1">
              {courses.filter(c => c.is_published).length + journals.filter(j => j.is_published).length}
            </div>
          </div>
          <div className="bg-white border border-line/50 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted font-semibold">Total Views</div>
            <div className="font-display text-2xl text-ink mt-1">
              {courses.reduce((s, c) => s + (c.views_count || 0), 0) +
               journals.reduce((s, j) => s + (j.views_count || 0), 0)}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-5 border-b border-line">
          <button
            onClick={() => setTab('courses')}
            className={
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
              (tab === 'courses' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink')
            }
          >
            Courses
          </button>
          <button
            onClick={() => setTab('journals')}
            className={
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
              (tab === 'journals' ? 'border-teal text-teal' : 'border-transparent text-muted hover:text-ink')
            }
          >
            Journals
          </button>
        </div>

        {/* COURSES TAB */}
        {tab === 'courses' && (
          <>
            {!showCourseForm ? (
              <button
                onClick={() => setShowCourseForm(true)}
                className="w-full bg-white border-2 border-dashed border-line rounded-xl p-6 text-center text-muted hover:border-teal hover:text-teal transition-colors mb-5"
              >
                + Upload New Course
              </button>
            ) : (
              <div className="bg-white border border-line/50 rounded-2xl p-6 mb-5">
                <h3 className="font-display text-lg text-ink mb-4">New Course</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Title</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={e => setCourseTitle(e.target.value)}
                      placeholder="e.g. Fundraising Fundamentals for First-time Founders"
                      className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={courseDesc}
                      onChange={e => setCourseDesc(e.target.value)}
                      placeholder="What founders will learn from this course"
                      className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Category</label>
                      <select
                        value={courseCat}
                        onChange={e => setCourseCat(e.target.value)}
                        className="w-full bg-cream border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Level</label>
                      <select
                        value={courseDiff}
                        onChange={e => setCourseDiff(e.target.value)}
                        className="w-full bg-cream border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal capitalize"
                      >
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Duration (min)</label>
                      <input
                        type="number"
                        value={courseDuration}
                        onChange={e => setCourseDuration(e.target.value)}
                        className="w-full bg-cream border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Cover Image</label>
                      <input
                        ref={courseCoverRef}
                        type="file"
                        accept="image/*"
                        onChange={e => setCourseCoverFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        onClick={() => courseCoverRef.current?.click()}
                        className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:border-teal text-left truncate"
                      >
                        {courseCoverFile ? courseCoverFile.name : 'Choose cover image...'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Content (PDF/Video)</label>
                      <input
                        ref={courseFileRef}
                        type="file"
                        accept=".pdf,video/*"
                        onChange={e => setCourseFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        onClick={() => courseFileRef.current?.click()}
                        className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:border-teal text-left truncate"
                      >
                        {courseFile ? courseFile.name : 'Choose file...'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowCourseForm(false)}
                      className="px-4 py-2 text-sm text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveCourse(true)}
                      disabled={savingCourse}
                      className="px-4 py-2 border border-line text-ink-soft rounded-lg text-sm font-medium hover:bg-cream disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handleSaveCourse(false)}
                      disabled={savingCourse}
                      className="px-5 py-2 bg-teal text-cream rounded-lg text-sm font-medium hover:bg-teal-dark disabled:opacity-50"
                    >
                      {savingCourse ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COURSES LIST */}
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted text-sm">
                  No courses yet. Click upload to create your first.
                </div>
              ) : (
                courses.map(c => (
                  <div key={c.id} className="bg-white border border-line/50 rounded-2xl overflow-hidden">
                    {c.cover_url ? (
                      <div className="aspect-video bg-cream-dark overflow-hidden">
                        <img src={c.cover_url} alt={c.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-linear-to-br from-teal to-teal-dark flex items-center justify-center text-cream font-display text-4xl">
                        {c.title[0]}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                          {c.category}
                        </span>
                        <span className="text-[9px] uppercase text-muted">{c.difficulty}</span>
                        {!c.is_published && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rust-soft text-rust">
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-base text-ink mb-1 line-clamp-2">{c.title}</h3>
                      <p className="text-xs text-ink-soft line-clamp-2 mb-3">{c.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{c.duration_minutes} min · {c.views_count || 0} views</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePublish('course', c.id, c.is_published)}
                            className="text-teal hover:text-teal-dark text-xs"
                          >
                            {c.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => deleteItem('course', c.id)}
                            className="text-rust hover:text-rust/70 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* JOURNALS TAB */}
        {tab === 'journals' && (
          <>
            {!showJournalForm ? (
              <button
                onClick={() => setShowJournalForm(true)}
                className="w-full bg-white border-2 border-dashed border-line rounded-xl p-6 text-center text-muted hover:border-teal hover:text-teal transition-colors mb-5"
              >
                + Write New Journal
              </button>
            ) : (
              <div className="bg-white border border-line/50 rounded-2xl p-6 mb-5">
                <h3 className="font-display text-lg text-ink mb-4">New Journal Entry</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Title</label>
                    <input
                      type="text"
                      value={journalTitle}
                      onChange={e => setJournalTitle(e.target.value)}
                      placeholder="e.g. The 7-figure pitch: what fund partners actually look for"
                      className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Content</label>
                    <textarea
                      rows={12}
                      value={journalContent}
                      onChange={e => setJournalContent(e.target.value)}
                      placeholder="Write your insights, frameworks, stories..."
                      className="w-full bg-cream border border-line rounded-lg px-4 py-3 text-sm outline-none focus:border-teal resize-y leading-relaxed"
                    />
                    <div className="text-xs text-muted mt-1">
                      {journalContent.trim().split(/\s+/).filter(Boolean).length} words ·
                      {' ' + Math.max(1, Math.ceil(journalContent.trim().split(/\s+/).filter(Boolean).length / 200))} min read
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Tags</label>
                    <input
                      type="text"
                      value={journalTags}
                      onChange={e => setJournalTags(e.target.value)}
                      placeholder="fundraising, pitch, vc (comma separated)"
                      className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Cover Image</label>
                    <input
                      ref={journalCoverRef}
                      type="file"
                      accept="image/*"
                      onChange={e => setJournalCoverFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      onClick={() => journalCoverRef.current?.click()}
                      className="w-full bg-cream border border-line rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:border-teal text-left truncate"
                    >
                      {journalCoverFile ? journalCoverFile.name : 'Choose cover image...'}
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowJournalForm(false)}
                      className="px-4 py-2 text-sm text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveJournal(true)}
                      disabled={savingJournal}
                      className="px-4 py-2 border border-line text-ink-soft rounded-lg text-sm font-medium hover:bg-cream disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handleSaveJournal(false)}
                      disabled={savingJournal}
                      className="px-5 py-2 bg-teal text-cream rounded-lg text-sm font-medium hover:bg-teal-dark disabled:opacity-50"
                    >
                      {savingJournal ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* JOURNALS LIST */}
            <div className="space-y-3">
              {journals.length === 0 ? (
                <div className="text-center py-12 text-muted text-sm">
                  No journals yet. Click write to publish your first.
                </div>
              ) : (
                journals.map(j => (
                  <div key={j.id} className="bg-white border border-line/50 rounded-2xl p-5 flex gap-4">
                    {j.cover_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-cream-dark shrink-0">
                        <img src={j.cover_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {!j.is_published && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rust-soft text-rust">
                            Draft
                          </span>
                        )}
                        {(j.tags || []).slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display text-lg text-ink mb-1 line-clamp-1">{j.title}</h3>
                      <p className="text-sm text-ink-soft line-clamp-2 mb-2">{j.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{j.read_minutes} min read · {j.views_count || 0} views · {timeAgo(j.created_at)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePublish('journal', j.id, j.is_published)}
                            className="text-teal hover:text-teal-dark text-xs"
                          >
                            {j.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => deleteItem('journal', j.id)}
                            className="text-rust hover:text-rust/70 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-cream px-5 py-3 rounded-xl shadow-2xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </>
  )
}