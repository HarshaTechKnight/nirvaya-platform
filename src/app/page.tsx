import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── NAVBAR ── */}
      <nav className="border-b border-line/60">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-display text-xl tracking-tight text-teal font-semibold">
            CoFlare
          </div>
          <div className="hidden md:flex gap-8 text-sm text-ink-soft">
            <a href="#" className="hover:text-teal transition-colors">Feed</a>
            <a href="#features" className="hover:text-teal transition-colors">Startup Listings</a>
            <a href="#grow" className="hover:text-teal transition-colors">Grow Unit</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/auth/login" className="text-sm text-ink-soft hover:text-teal transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 bg-teal-light text-teal-dark text-xs font-medium tracking-wider uppercase rounded mb-6">
            Institutional Curator
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight text-ink mb-6">
            Empowering the{' '}
            <span className="italic-display text-teal">Next Wave</span>{' '}
            of Innovation
          </h1>
          <p className="text-ink-soft text-lg leading-relaxed max-w-lg mb-8">
            A unified platform where India's Founders, Mentors, and Investors connect, grow, and fund the future.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-6 py-3 bg-teal text-cream font-medium rounded hover:bg-teal-dark transition-colors">
              Join the Ecosystem
            </Link>
            <button className="px-6 py-3 bg-white border border-line text-ink font-medium rounded hover:bg-cream-dark transition-colors">
              Learn More
            </button>
          </div>
          <div className="flex items-center gap-3 mt-10">
            <div className="flex -space-x-2">
              {['#b85c38', '#0f6e56', '#2d3e37'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-cream" style={{ background: c }}/>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">500+ Active Startups</div>
              <div className="text-xs text-muted">Across India’s cities—tier 1, tier 2, &amp; beyond</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-teal-light via-cream-dark to-cream rounded-2xl overflow-hidden border border-line/60">
            <div className="absolute bottom-6 left-6 bg-white rounded-xl p-4 shadow-lg max-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-teal text-sm">📈</span>
                <span className="text-sm font-semibold text-ink">Growth Tracking</span>
              </div>
              <div className="text-xs text-muted">Real-time metrics for AP's emerging innovation hubs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-white border-y border-line/60 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-2">
            Tailored for Your <span className="italic-display text-teal">Ambition</span>
          </h2>
          <p className="text-ink-soft max-w-xl mb-12">
            Whether you're building from scratch or scaling to new heights, CoFlare provides the institutional backing you need.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Founder card */}
            <div className="bg-cream rounded-2xl p-8 relative overflow-hidden border border-line/40 md:col-span-1">
              <div className="w-10 h-10 bg-teal-light text-teal flex items-center justify-center rounded-lg mb-5 text-lg">🚀</div>
              <h3 className="font-display text-2xl text-ink mb-2">Founder &amp; Co-Founder</h3>
              <p className="text-sm text-ink-soft leading-relaxed max-w-xs mb-4">
                Access India's central funding pools, find your perfect technical match, and scale your vision.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white border border-line text-xs text-ink-soft rounded-full">Grant Support</span>
                <span className="px-3 py-1 bg-white border border-line text-xs text-ink-soft rounded-full">IP Protection</span>
              </div>
            </div>

            {/* Freelancer card */}
            <div className="bg-cream rounded-2xl p-8 border border-line/40">
              <div className="w-10 h-10 bg-rust-soft text-rust flex items-center justify-center rounded-lg mb-5 text-lg">💻</div>
              <h3 className="font-display text-2xl text-ink mb-2">Freelancer</h3>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Join the curated talent pool for high-growth startups in the region. Projects that matter, directly from the source.
              </p>
              <button className="text-sm text-teal hover:text-teal-dark font-medium">View Gigs →</button>
            </div>

            {/* Investor card */}
            <div className="bg-teal text-cream rounded-2xl p-8">
              <div className="w-10 h-10 bg-cream/20 flex items-center justify-center rounded-lg mb-5 text-lg">💰</div>
              <h3 className="font-display text-2xl mb-2">Investor</h3>
              <p className="text-sm text-cream/80 leading-relaxed mb-6">
                Early access to vetted, government-recognized startups. Diversify your portfolio with India's finest.
              </p>
              <button className="bg-cream text-teal px-5 py-2 rounded font-medium text-sm hover:bg-white transition-colors">
                Investor Early Access
              </button>
            </div>

            {/* Mentor card */}
            <div className="bg-cream rounded-2xl p-8 border border-line/40 grid grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="w-10 h-10 bg-teal-light text-teal flex items-center justify-center rounded-lg mb-5 text-lg">🎓</div>
                <h3 className="font-display text-2xl text-ink mb-2">Mentor</h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Guide the next generation. Join our elite circle of industry veterans and academic leaders from India's premier institutions.
                </p>
                <button className="mt-4 px-4 py-2 bg-rust text-cream text-sm font-medium rounded">Apply as Mentor</button>
              </div>
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <div className="font-display text-3xl text-teal">4.9/5</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">Mentor Rating</div>
                </div>
                <div>
                  <div className="font-display text-3xl text-ink">12k+</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">Hours Mentored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTOR LEDGER ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-10">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-4">
              The Investor <span className="italic-display text-teal">Ledger</span>
            </h2>
            <p className="text-ink-soft leading-relaxed mb-8">
              Transparency is the only currency that compounds. CoFlare provides a real-time command center for monitoring startup velocity, grant accountability, and the cascading economic impact rippling through emerging innovation corridors.
            </p>
            <div className="border-t border-line/60">
              {[['Total Funding Disbursed', '₹450 Cr+'], ['Recognized Startups', '1,240'], ['Innovation Hubs', '12']].map(([l, v]) => (
                <div key={l} className="flex justify-between py-4 border-b border-line/60">
                  <span className="text-sm text-ink-soft">{l}</span>
                  <span className="text-sm font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-line/60 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line/60">
              <div className="text-xs uppercase tracking-wider text-muted">Recent Activity · Amaravati</div>
              <div className="text-xs bg-teal-light text-teal-dark px-2 py-1 rounded font-medium">LIVE UPDATES</div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted border-b border-line/60">
                  <th className="text-left px-6 py-3 font-medium">Startup</th>
                  <th className="text-left py-3 font-medium">Stage</th>
                  <th className="text-left py-3 font-medium">Growth</th>
                  <th className="text-left py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { n: 'VizagAqua Tech', s: 'Agri-Tech', st: 'Series A', g: '+124%', c: 'bg-teal-light text-teal-dark', cl: 'Funding Open' },
                  { n: 'Gujarat Solar', s: 'Clean Energy', st: 'Seed', g: '+85%', c: 'bg-cream-dark text-ink-soft', cl: 'Grant Review' },
                  { n: 'Krishna Logistics', s: 'Supply Chain', st: 'MVP', g: '+42%', c: 'bg-teal-light text-teal-dark', cl: 'Matching' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-line/40 last:border-0">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink">{r.n}</div>
                      <div className="text-xs text-muted">{r.s}</div>
                    </td>
                    <td className="text-ink-soft">{r.st}</td>
                    <td className="text-teal font-medium">{r.g}</td>
                    <td><span className={`${r.c} text-xs px-2 py-1 rounded font-medium`}>{r.cl}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-teal text-cream py-16 px-8 text-center">
        <h2 className="font-display text-4xl md:text-5xl mb-4">
          Ready to build the future of India? 
        </h2>
        <p className="text-cream/80 max-w-xl mx-auto mb-8">
          Connect with visionary leaders from every corner of the country. Your journey starts here.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login" className="px-6 py-3 bg-cream text-teal rounded font-medium hover:bg-white transition-colors">
            Join the Ecosystem
          </Link>
          <button className="px-6 py-3 border border-cream/30 text-cream rounded font-medium hover:bg-cream/10 transition-colors">
            Contact Office
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-cream border-t border-line/60 px-8 py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 mb-10">
          <div>
            <div className="font-display text-xl text-teal font-semibold mb-3">CoFlare</div>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              The essential backbone for ecosystem builders—igniting discovery, sharpening curation, and driving sustained momentum.
            </p>
          </div>
          {[
            { title: 'Innovation Hubs', items: ['Visakhapatnam (IT Hub)', 'Bengaluru (FinTech)', 'Gujarat (Smart City)', 'Uttar Pradesh (Ports & Logistics)'] },
            { title: 'Quick Links', items: ['Grant Applications', 'Investor Network', 'Mentorship Program', 'Incubator Directory'] },
            { title: 'Government Support', items: ['AP Innovation Society', 'Startup Policy 2024', 'Tax Incentives', 'Seed Capital Fund'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-wider text-ink font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map(item => (
                  <li key={item}><a href="#" className="text-xs text-ink-soft hover:text-teal transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-line/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <div>© 2026 CoFlare Institutional Curator. All Rights Reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-teal">Privacy Policy</a>
            <a href="#" className="hover:text-teal">Terms of Service</a>
            <a href="#" className="hover:text-teal">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}