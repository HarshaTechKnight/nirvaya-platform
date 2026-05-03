import { createClient } from '@/lib/supabase/server'
import TopBar from '@/components/TopBar'

export default async function GrowUnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: journals } = await supabase
    .from('journals')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <>
      <TopBar title="Grow Unit" profile={profile}/>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-wider text-teal font-semibold mb-2">
            Mentor Curriculum
          </div>
          <h1 className="font-display text-3xl text-ink mb-2">Curated knowledge for founders</h1>
          <p className="text-sm text-ink-soft">
            Courses and journals published by Co-Flare's mentor network.
          </p>
        </div>

        {/* Courses */}
        <div className="mb-10">
          <h2 className="font-display text-lg text-ink mb-4">Published Courses</h2>
          {courses && courses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map(c => (
                <div key={c.id} className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-teal-light text-teal-dark">
                      COURSE
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted">{c.type}</span>
                  </div>
                  <h3 className="font-display text-base text-ink mb-2">{c.title}</h3>
                  <p className="text-xs text-ink-soft leading-relaxed mb-3 line-clamp-2">{c.description}</p>
                  <div className="text-xs text-muted">By {c.profiles?.full_name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream-dark/40 border border-dashed border-line rounded-2xl p-8 text-center text-sm text-muted">
              No courses published yet. Check back soon.
            </div>
          )}
        </div>

        {/* Journals */}
        <div>
          <h2 className="font-display text-lg text-ink mb-4">Research Journals</h2>
          {journals && journals.length > 0 ? (
            <div className="space-y-3">
              {journals.map(j => (
                <div key={j.id} className="bg-white border border-line/50 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-rust-soft text-rust">
                      JOURNAL
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-ink mb-2">{j.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed line-clamp-3 mb-3 whitespace-pre-line">
                    {j.content}
                  </p>
                  <div className="text-xs text-muted">By {j.profiles?.full_name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-cream-dark/40 border border-dashed border-line rounded-2xl p-8 text-center text-sm text-muted">
              No journals published yet.
            </div>
          )}
        </div>
      </div>
    </>
  )
}