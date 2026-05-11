import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-cream/80 backdrop-blur-xl z-50 border-b border-line/30">
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-teal/30 to-rust/30 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all">
                <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <span className="font-display text-xl text-ink font-bold tracking-tight">CoFlare</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Home','About','Features','How It Works','Pricing','Stories','FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,'-')}`} 
                className="text-sm text-ink-soft hover:text-teal transition-colors relative group py-1">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal to-teal-dark group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-ink-soft hover:text-teal hidden sm:block transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/auth/login"
              className="relative overflow-hidden bg-gradient-to-r from-teal to-teal-dark text-cream px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-teal/30 transition-all group">
              <span className="relative z-10">Join Network</span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-dark to-teal opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal/8 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal/8 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-float-slower"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-rust/8 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl animate-float"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#d4e8e0_0%,transparent_60%)] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur border border-teal/20 rounded-full px-4 py-2 mb-8 shadow-lg animate-bounce-gentle">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal"></span>
              </span>
              <span className="text-xs text-teal font-semibold tracking-wide">🚀 Live across 28 states</span>
            </div>

            <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.08] mb-8">
              <span className="block opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]" style={{animation:'fadeInUp 0.6s ease-out 0.2s forwards'}}>
                Where
              </span>
              <span className="block mt-3 opacity-0" style={{animation:'fadeInUp 0.6s ease-out 0.4s forwards'}}>
                <span className="relative inline-block group">
                  <span className="relative z-10 bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent animate-gradient">
                    Founders
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-2 bg-teal/30 -z-0 -skew-x-12 group-hover:w-full transition-all duration-500 rounded"></span>
                  <span className="absolute -top-2 -right-3 text-2xl animate-bounce-gentle opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                </span>
                {', '}
                <span className="relative inline-block group">
                  <span className="relative z-10 bg-gradient-to-r from-rust to-amber-600 bg-clip-text text-transparent animate-gradient">
                    Mentors
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-2 bg-rust/20 -z-0 -skew-x-12 group-hover:w-full transition-all duration-500 rounded"></span>
                  <span className="absolute -top-2 -right-3 text-2xl animate-bounce-gentle opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay:'0.3s'}}>💡</span>
                </span>
                {', '}
                <span className="relative inline-block group">
                  <span className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                    Investors
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-2 bg-purple-300/30 -z-0 -skew-x-12 group-hover:w-full transition-all duration-500 rounded"></span>
                  <span className="absolute -top-2 -right-3 text-2xl animate-bounce-gentle opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay:'0.6s'}}>💰</span>
                </span>
              </span>
              <span className="block mt-4 text-ink opacity-0" style={{animation:'fadeInUp 0.6s ease-out 0.8s forwards'}}>
                collaborate to build the next big thing.
                <span className="block w-24 h-1 bg-gradient-to-r from-teal via-rust to-purple-500 rounded-full mt-2"></span>
              </span>
            </h1>

            <p className="text-lg text-ink-soft leading-relaxed mb-10 max-w-xl opacity-0" style={{animation:'fadeInUp 0.6s ease-out 1s forwards'}}>
              CoFlare is a national platform connecting startup talent, capital, and expertise across India, from <span className="text-teal font-semibold">Bengaluru</span> to <span className="text-rust font-semibold">Bhubaneswar</span>.
            </p>

            <div className="flex flex-wrap gap-4 mb-10 opacity-0" style={{animation:'fadeInUp 0.6s ease-out 1.2s forwards'}}>
              <Link href="/auth/login"
                className="group relative overflow-hidden bg-gradient-to-r from-teal to-teal-dark text-cream px-8 py-4 rounded-xl text-sm font-semibold hover:shadow-2xl hover:shadow-teal/30 transition-all flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-dark to-teal opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></span>
              </Link>
              <a href="#how-it-works"
                className="group border-2 border-line bg-white/80 backdrop-blur text-ink px-8 py-4 rounded-xl text-sm font-medium hover:border-teal hover:shadow-xl transition-all flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                See How It Works
              </a>
            </div>

            <div className="flex items-center gap-5 pt-6 border-t border-line/30 opacity-0" style={{animation:'fadeInUp 0.6s ease-out 1.4s forwards'}}>
              <div className="flex -space-x-3">
                {['A','B','C','D','E'].map((l,i) => (
                  <div key={l} className="w-10 h-10 rounded-full border-3 border-cream bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-xs font-bold text-cream shadow-lg hover:scale-110 transition-transform hover:z-10 cursor-pointer"
                    style={{zIndex:5-i}}>{l}</div>
                ))}
              </div>
              <div>
                <div className="text-sm text-ink font-semibold"><span className="text-teal">2,400+</span> members trust CoFlare</div>
                <div className="flex gap-0.5 mt-0.5">{'★★★★★'.split('').map((s,i)=><span key={i} className="text-yellow-500 text-xs">{s}</span>)}</div>
              </div>
            </div>
          </div>

          <div className="relative opacity-0" style={{animation:'fadeInRight 0.8s ease-out 0.6s forwards'}}>
            <div className="absolute -inset-6 bg-gradient-to-r from-teal/20 via-rust/10 to-purple-500/10 rounded-3xl blur-2xl animate-spin-slow"></div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-ink to-teal-dark shadow-2xl -rotate-1 hover:rotate-0 transition-transform duration-700 group">
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop" alt="Founders" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"></div>
              
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:scale-105 transition-transform border border-white/50 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-cream font-bold shadow-lg">SK</div>
                  <div><div className="text-sm font-semibold text-ink">Sai Kiran</div><div className="text-xs text-muted">Mentor matched ✓</div></div>
                </div>
              </div>

              <div className="absolute bottom-8 left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:scale-105 transition-transform border border-white/50 animate-float-slow">
                <div className="text-sm font-semibold text-ink mb-2">💰 15L Seed Grant</div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal to-teal-dark w-3/4 rounded-full relative"><span className="absolute inset-0 bg-white/30 animate-shimmer"></span></div></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-light to-teal rounded-2xl -z-10 animate-float-slower"></div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative bg-gradient-to-r from-ink via-ink-soft to-ink text-cream -mt-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[{v:'2,400+',l:'Active Founders',i:'🚀'},{v:'480+',l:'Verified Mentors',i:'📚'},{v:'120+',l:'Investors',i:'💎'},{v:'28',l:'States Covered',i:'🗺️'}].map((s,i)=>(
            <div key={s.l} className="text-center group opacity-0" style={{animation:`fadeInUp 0.6s ease-out ${1.6+i*0.2}s forwards`}}>
              <div className="text-3xl mb-3 group-hover:scale-125 transition-transform inline-block">{s.i}</div>
              <div className="font-display text-4xl font-bold mb-1">{s.v}</div>
              <div className="text-xs uppercase tracking-widest text-cream/50">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-16 bg-white border-y border-line/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center text-xs uppercase tracking-[0.3em] text-muted font-semibold mb-10">Trusted by India's top accelerators</div>
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16 opacity-50">
            {['T-Hub','NSRCEL','IIM-B','IIT Madras','Startup India','AIC ICT','CIIE'].map(p=>(
              <div key={p} className="font-display text-xl text-ink-soft hover:text-teal hover:opacity-100 transition-all cursor-default">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION + VISION */}
      <section className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal/3 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-8">
          <div className="group bg-gradient-to-br from-ink to-ink-soft text-cream rounded-3xl p-10 lg:p-14 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] text-cream/50 font-semibold mb-4 flex items-center gap-2">🎯 Our Mission</div>
              <h3 className="font-display text-4xl mb-6 leading-tight">Democratize access to startup networks across India.</h3>
              <p className="text-cream/70 leading-relaxed text-lg">Talent is everywhere. Networks are not. A brilliant founder in Guntur deserves the same access as one in Koramangala.</p>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-teal to-teal-dark text-cream rounded-3xl p-10 lg:p-14 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-2xl">
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cream/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] text-cream/70 font-semibold mb-4 flex items-center gap-2">🔭 Our Vision</div>
              <h3 className="font-display text-4xl mb-6 leading-tight">Power 10,000 Indian startups by 2030.</h3>
              <p className="text-cream/90 leading-relaxed text-lg">Every founder, regardless of city or capital, has the network they need to build something extraordinary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 lg:py-36 bg-white border-y border-line/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>What We Offer</span>
            <h2 className="font-display text-5xl lg:text-7xl text-ink mb-6">Three portals.<br/>One ecosystem.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {t:'Founders Portal',d:'Build your identity, find co-founders, access mentors and investors.',i:'🚀',g:'from-teal to-teal-dark',items:['Public profile','Co-founder search','Mentor matching','Grant tracking']},
              {t:'Mentors Portal',d:'Discover founders, publish courses, earn recognition for your guidance.',i:'📚',g:'from-rust to-rust-dark',items:['Find by domain','Publish courses','Direct messaging','Verified badge']},
              {t:'Investor Portal',d:'Curated deal flow, screen founders, connect beyond metro cities.',i:'💎',g:'from-purple-500 to-indigo-600',items:['National deal flow','Startup screening','Vetted founders','Direct outreach']},
            ].map(p=>(
              <div key={p.t} className="group bg-cream border border-line/30 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.g} flex items-center justify-center text-2xl mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>{p.i}</div>
                <h3 className="font-display text-2xl text-ink mb-3">{p.t}</h3>
                <p className="text-sm text-ink-soft mb-6">{p.d}</p>
                <ul className="space-y-2 text-sm">{p.items.map(i=><li key={i} className="flex gap-2 items-center"><span className="text-teal">✓</span>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal/5"></div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>How It Works</span>
          <h2 className="font-display text-5xl lg:text-7xl text-ink mb-16">Three steps to join.</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[{s:'01',t:'Sign Up',d:'Google or email. Pick your role.',i:'👋'},{s:'02',t:'Build Profile',d:'Quick wizard. Add skills & domain.',i:'📝'},{s:'03',t:'Connect & Grow',d:'Post, message, find mentors.',i:'🚀'}].map(item=>(
              <div key={item.s} className="relative group">
                <div className="bg-white border border-line/30 rounded-2xl p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-3xl mb-6 shadow-2xl group-hover:scale-110 transition-transform">{item.i}</div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-teal text-cream rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{item.s}</div>
                  <h3 className="font-display text-2xl text-ink mb-3">{item.t}</h3>
                  <p className="text-sm text-ink-soft">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/auth/login" className="inline-flex items-center gap-2 mt-12 bg-teal text-cream px-10 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-teal/30 transition-all group">
            Start Now — It's Free <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 lg:py-36 bg-white border-y border-line/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>Pricing</span>
          <h2 className="font-display text-5xl lg:text-7xl text-ink mb-16">Free to start. Grow as you go.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {t:'Free',p:'0',ps:['Public profile','Browse mentors','Post on feed','5 msgs/day'],btn:'Start Free',style:'bg-cream border-line/50'},
              {t:'Builder',p:'299',ps:['All Free features','Unlimited messages','AI matching','Featured badge','Investor intros'],btn:'Start Trial',style:'bg-gradient-to-br from-ink to-ink-soft text-cream scale-105 shadow-2xl',badge:'Most Popular'},
              {t:'Mentor Pro',p:'499',ps:['Verified badge','Publish courses','Premium access','Session bookings','Analytics'],btn:'Become Mentor',style:'bg-cream border-line/50'},
            ].map(plan=>(
              <div key={plan.t} className={`${plan.style} rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative`}>
                {plan.badge && <span className="absolute -top-3 right-6 bg-teal text-cream text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">{plan.badge}</span>}
                <div className="text-sm font-semibold mb-2">{plan.t}</div>
                <div className="font-display text-5xl mb-6">₹{plan.p}<span className="text-sm font-normal opacity-50">/mo</span></div>
                <ul className="space-y-3 text-sm mb-8">{plan.ps.map(i=><li key={i} className="flex gap-2 items-center"><span className="text-teal">✓</span>{i}</li>)}</ul>
                <Link href="/auth/login" className={`block w-full py-3 rounded-xl font-medium transition-all ${plan.t==='Builder'?'bg-teal text-cream hover:shadow-xl':'border-2 border-line hover:border-teal'}`}>{plan.btn}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-28 lg:py-36 bg-ink text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal rounded-full blur-3xl"></div><div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rust rounded-full blur-3xl"></div></div>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cream/50 font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>Stories</span>
          <h2 className="font-display text-5xl lg:text-7xl mb-16">Real founders. Real outcomes.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {q:'Found my technical co-founder in two weeks. Both from tier-2 cities, neither from IIT. The network gave us a fair shot.',n:'Priya Reddy',r:'Founder, AgriPulse',c:'Visakhapatnam'},
              {q:'As a mentor with 15 years in fintech, CoFlare let me give back at scale. 12 founders mentored this year.',n:'Rajesh Iyer',r:'Mentor, Ex-Razorpay',c:'Chennai'},
              {q:'Three of our last five investments came through CoFlare. The verification layer means we trust the deal flow.',n:'Anjali Khanna',r:'Partner, Lumina Ventures',c:'Mumbai'},
            ].map(t=>(
              <div key={t.n} className="bg-cream/5 border border-cream/10 rounded-2xl p-8 backdrop-blur hover:bg-cream/10 hover:-translate-y-2 transition-all duration-500 text-left">
                <p className="text-sm leading-relaxed mb-6 italic">"{t.q}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-cream/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center font-bold">{t.n.split(' ').map(w=>w[0]).join('')}</div>
                  <div><div className="text-sm font-semibold">{t.n}</div><div className="text-xs text-cream/50">{t.r}, {t.c}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-28 lg:py-36">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>Impact</span>
          <h2 className="font-display text-5xl lg:text-7xl text-ink mb-16">Numbers that tell our story.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[{v:'₹84 Cr',l:'Capital Raised',s:'47 startups',i:'💰'},{v:'1,200',l:'Mentor Sessions',s:'4.8/5 rating',i:'🤝'},{v:'320',l:'Co-founder Matches',s:'18 industries',i:'🔗'},{v:'94%',l:'Satisfaction',s:'NPS Survey',i:'⭐'}].map(s=>(
              <div key={s.l} className="bg-white border border-line/30 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="text-3xl mb-3">{s.i}</div>
                <div className="font-display text-4xl text-teal font-bold mb-2">{s.v}</div>
                <div className="text-sm font-semibold text-ink">{s.l}</div>
                <div className="text-xs text-muted">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 lg:py-36 bg-white border-y border-line/30">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal font-semibold mb-4"><span className="w-8 h-0.5 bg-teal rounded-full"></span>FAQ</span>
            <h2 className="font-display text-5xl lg:text-7xl text-ink mb-6">Got questions?</h2>
          </div>
          <div className="space-y-3">
            {[
              {q:'Is CoFlare really free?',a:'Yes! The Free tier gives you full access to your profile, feed, browsing, and basic messaging. No credit card needed.'},
              {q:'Who can join?',a:'Anyone in the Indian startup ecosystem: founders, co-founders, freelancers, mentors, and investors.'},
              {q:'How does mentor matching work?',a:'Our system suggests mentors based on your stage, sector, and challenges. You can also browse and request directly.'},
              {q:'Are mentors verified?',a:'Every mentor is institutionally verified. We check professional history and references before issuing a verified badge.'},
              {q:'Can I cancel anytime?',a:'Absolutely. No lock-in periods. Cancel from settings and keep access until the end of your billing cycle.'},
            ].map((item,i)=>(
              <details key={i} className="group bg-cream border border-line/30 rounded-2xl hover:border-teal/30 transition-all">
                <summary className="flex items-center justify-between cursor-pointer p-6 list-none">
                  <span className="text-sm font-semibold text-ink">{item.q}</span>
                  <span className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center group-open:bg-teal transition-colors">
                    <svg className="w-4 h-4 text-teal group-open:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm text-ink-soft leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 lg:py-36">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <div className="bg-gradient-to-br from-teal to-teal-dark text-cream rounded-3xl p-14 lg:p-20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cream/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h2 className="font-display text-5xl lg:text-7xl mb-6">Ready to build?</h2>
              <p className="text-lg text-cream/80 mb-10 max-w-lg mx-auto">Join 2,400+ founders, mentors, and investors building India's startup future.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/login" className="bg-cream text-teal px-10 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all inline-flex items-center gap-2 group">
                  Join Free <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </Link>
                <a href="mailto:hello@coflare.in" className="border-2 border-cream/30 text-cream px-10 py-4 rounded-xl font-medium hover:bg-cream/10 transition-all">Talk to Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-cream/60 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <Link href="/" className="font-display text-2xl text-cream font-bold flex items-center gap-2 mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> CoFlare
              </Link>
              <p className="text-sm max-w-xs">India's institutional network for founders, mentors, and investors.</p>
            </div>
            {[{t:'Platform',l:['Features','How It Works','Pricing','Sign In']},{t:'Company',l:['About','Stories','Press','Careers']},{t:'Legal',l:['Privacy','Terms','Cookies','Refunds']}].map(col=>(
              <div key={col.t}>
                <div className="text-xs uppercase tracking-wider text-cream/30 font-semibold mb-4">{col.t}</div>
                <ul className="space-y-2 text-sm">{col.l.map(i=><li key={i}><a href="#" className="hover:text-teal transition-colors">{i}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-cream/10 text-xs text-center">© 2026 CoFlare. Made with ❤️ in India. For founders everywhere.</div>
        </div>
      </footer>
    </div>
  )
}