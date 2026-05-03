'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TopBar from '@/components/TopBar'

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

  // Course form
  const [cTitle, setCTitle] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cType, setCType] = useState('article')
  const [cUrl, setCUrl] = useState('')
  const [cLoading, setCLoading] = useState(false)

  // Journal form
  const [jTitle, setJTitle] = useState('')
  const [jContent, setJContent] = useState('')
  const [jLoading, setJLoading] = useState(false)

  async function publishCourse(e: React.FormEvent) {
    e.preventDefault()
    setCLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .insert({
        mentor_id: profile.id,
        title: cTitle,
        description: cDesc,
        type: cType,
        file_url: cUrl,
        is_published: true,
      } as any)
      .select()
      .single()
    if (!error && data) {
      setCourses([data, ...courses])
      setCTitle('')
      setCDesc('')
      setCUrl('')
      setTab('overview')
    }
    setCLoading(false)
  }

  async function publishJournal(e: React.FormEvent) {
    e.preventDefault()
    setJLoading(true)
    const { data, error } = await supabase
      .from('journals')
      .insert({
        mentor_id: profile.id,
        title: jTitle,
        content: jContent,
        is_published: true,
      } as any)
      .select()
      .single()
    if (!error && data) {
      setJournals([data, ...journals])
      setJTitle('')
      setJContent('')
      setTab('overview')
    }
    setJLoading(false)
  }

  return (
    <>
      <TopBar title="Grow Unit" profile={profile}/>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-teal font-semibold mb-2">
              Mentor Studio
            </div>
            <h1 className="font-display text-3xl text-ink mb-1">Grow Unit</h1>
            <p className="text-sm text-ink-soft">
              Publish courses and journals for the founder community.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('course')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'course' ? 'bg-teal text-cream' : 'bg-white border border-line text-ink-soft hover:border-teal'
              }`}
            >
              📤 Upload Course
            </button>
            <button
              onClick={() => setTab('journal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'journal' ? 'bg-teal text-cream' : 'bg-white border border-line text-ink-soft hover:border-teal'
              }`}
            >
              ✍ Write Journal
            </button>
          </div>
        </div>

        {/* Stats row */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-line/50 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">Courses</div>
                <div className="font-display text-3xl text-teal">{courses.length}</div>
              </div>
              <div className="bg-white border border-line/50 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">Journals</div>
                <div className="font-display text-3xl text-teal">{journals.length}</div>
              </div>
              <div className="bg-ink text-cream rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-wider text-cream/50 font-semibold mb-2">Total Published</div>
                <div className="font-display text-3xl">{courses.length + journals.length}</div>
              </div>
            </div>

            {/* My Courses */}
            <div className="mb-10">
              <h2 className="font-display text-lg text-ink mb-4">My Courses</h2>
              {courses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map(c => (
                    <div key={c.id} className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                          {c.type.toUpperCase()}
                        </span>
                        {c.is_published && (
                          <span className="text-[9px] uppercase tracking-wider text-teal">Live</span>
                        )}
                      </div>
                      <h3 className="font-display text-base text-ink mb-2">{c.title}</h3>
                      <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-cream-dark/40 border border-dashed border-line rounded-2xl p-8 text-center text-sm text-muted">
                  No courses yet. Click "Upload Course" to publish your first one.
                </div>
              )}
            </div>

            {/* My Journals */}
            <div>
              <h2 className="font-display text-lg text-ink mb-4">My Journals</h2>
              {journals.length > 0 ? (
                <div className="space-y-3">
                  {journals.map(j => (
                    <div key={j.id} className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm">
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-rust-soft text-rust mb-2 inline-block">
                        JOURNAL
                      </span>
                      <h3 className="font-display text-lg text-ink mb-2">{j.title}</h3>
                      <p className="text-sm text-ink-soft leading-relaxed line-clamp-3 whitespace-pre-line">
                        {j.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-cream-dark/40 border border-dashed border-line rounded-2xl p-8 text-center text-sm text-muted">
                  No journals yet. Click "Write Journal" to publish.
                </div>
              )}
            </div>
          </>
        )}

        {/* Course form */}
        {tab === 'course' && (
          <form onSubmit={publishCourse} className="bg-white border border-line/50 rounded-2xl p-7 max-w-2xl">
            <h2 className="font-display text-xl text-ink mb-5">Upload New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Title *</label>
                <input
                  required
                  value={cTitle}
                  onChange={e => setCTitle(e.target.value)}
                  placeholder="Foundational Funding Framework"
                  className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Description</label>
                <textarea
                  value={cDesc}
                  onChange={e => setCDesc(e.target.value)}
                  rows={4}
                  placeholder="What founders will learn..."
                  className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Type</label>
                  <select
                    value={cType}
                    onChange={e => setCType(e.target.value)}
                    className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Resource URL</label>
                  <input
                    value={cUrl}
                    onChange={e => setCUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={cLoading || !cTitle.trim()}
                  className="flex-1 py-3 bg-teal text-cream rounded-lg font-medium text-sm hover:bg-teal-dark disabled:opacity-40"
                >
                  {cLoading ? 'Publishing...' : 'Publish Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('overview')}
                  className="px-5 py-3 border border-line text-ink-soft rounded-lg text-sm hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Journal form */}
        {tab === 'journal' && (
          <form onSubmit={publishJournal} className="bg-white border border-line/50 rounded-2xl p-7 max-w-2xl">
            <h2 className="font-display text-xl text-ink mb-5">Write Journal Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Title *</label>
                <input
                  required
                  value={jTitle}
                  onChange={e => setJTitle(e.target.value)}
                  placeholder="Q3 Economic Growth — AP Innovation Hubs"
                  className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-ink block mb-1.5">Content *</label>
                <textarea
                  required
                  value={jContent}
                  onChange={e => setJContent(e.target.value)}
                  rows={12}
                  placeholder="Write your insights, research, or analysis..."
                  className="w-full bg-cream/50 border border-line rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal focus:bg-white resize-none leading-relaxed"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={jLoading || !jTitle.trim() || !jContent.trim()}
                  className="flex-1 py-3 bg-teal text-cream rounded-lg font-medium text-sm hover:bg-teal-dark disabled:opacity-40"
                >
                  {jLoading ? 'Publishing...' : 'Publish Journal'}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('overview')}
                  className="px-5 py-3 border border-line text-ink-soft rounded-lg text-sm hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  )
}