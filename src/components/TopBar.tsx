'use client'

export default function TopBar({ title, profile }: { title: string; profile: any }) {
  function getInitials(name: string) {
    return (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="bg-cream border-b border-line/60 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
      <h1 className="font-display text-xl text-ink">{title}</h1>
      <div className="flex-1 max-w-md mx-8 relative">
        <input
          placeholder="Search startups, mentors..."
          className="w-full bg-white border border-line rounded-lg px-4 py-2 pl-10 text-sm outline-none focus:border-teal"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-muted hover:text-teal text-lg">🔔</button>
        <div className="w-9 h-9 rounded-full bg-teal text-cream flex items-center justify-center text-xs font-semibold">
          {getInitials(profile?.full_name)}
        </div>
      </div>
    </div>
  )
}