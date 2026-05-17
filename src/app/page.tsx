'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form submitted:', formData)
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for reaching out! We\'ll get back to you soon.'
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const faqs = [
    {
      question: 'Is CoFlare really free?',
      answer: 'Yes! The Free tier gives you full access to your profile, feed, browsing, and basic messaging. No credit card needed.'
    },
    {
      question: 'Who can join?',
      answer: 'Anyone in the Indian startup ecosystem: founders, co-founders, freelancers, mentors, and investors.'
    },
    {
      question: 'How does mentor matching work?',
      answer: 'Our system suggests mentors based on your stage, sector, and challenges. You can also browse and request directly.'
    },
    {
      question: 'Are mentors verified?',
      answer: 'Every mentor is institutionally verified. We check professional history and references before issuing a verified badge.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. No lock-in periods. Cancel from settings and keep access until the end of your billing cycle.'
    }
  ]

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-slower { animation: floatSlower 10s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-gradient { background-size: 200% 200%; animation: gradientShift 3s ease infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }
      `}</style>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Custom Logo */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/30 to-orange-500/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-300">
                <img src="/coflare-logo.jpeg" alt="" />
              </div>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">CoFlare</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'About', 'Features', 'How It Works', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                className="text-sm text-gray-600 hover:text-teal-600 transition-all duration-300 relative group py-1"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-teal-600 hidden sm:block transition-all duration-300 font-medium">
              Sign in
            </Link>
            <Link href="/auth/login"
              className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 group">
              <span className="relative z-10">Join Network</span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl animate-float-slower"></div>
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-teal-200 rounded-full px-4 py-2 mb-8 shadow-lg animate-float-slow">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <span className="text-xs text-teal-600 font-semibold tracking-wide">🚀 Live across 28 states in India</span>
              </div>

              <h1 className="font-bold text-5xl lg:text-7xl text-gray-900 leading-tight mb-8">
                <span className="block opacity-0 animate-fade-in-up delay-100">
                  Where
                </span>
                <span className="block mt-3 opacity-0 animate-fade-in-up delay-300">
                  <span className="relative inline-block group">
                    <span className="relative z-10 bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent animate-gradient">
                      Founders
                    </span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-teal-500/30 -z-0 group-hover:w-full transition-all duration-500 rounded"></span>
                  </span>
                  {', '}
                  <span className="relative inline-block group">
                    <span className="relative z-10 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent animate-gradient">
                      Mentors
                    </span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-orange-500/30 -z-0 group-hover:w-full transition-all duration-500 rounded"></span>
                  </span>
                  {', '}
                  <span className="relative inline-block group">
                    <span className="relative z-10 bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                      Investors
                    </span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-purple-500/30 -z-0 group-hover:w-full transition-all duration-500 rounded"></span>
                  </span>
                </span>
                <span className="block mt-4 text-gray-700 opacity-0 animate-fade-in-up delay-500">
                  collaborate to build the next big thing.
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl opacity-0 animate-fade-in-up delay-700">
                CoFlare is India's premier platform connecting startup talent, capital, and expertise across the nation, from 
                <span className="text-teal-600 font-semibold"> Bengaluru</span> to 
                <span className="text-orange-600 font-semibold"> Bhubaneswar</span>.
              </p>

              <div className="flex flex-wrap gap-4 mb-10 opacity-0 animate-fade-in-up delay-800">
                <Link href="/auth/login"
                  className="group relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 flex items-center gap-2">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your Journey
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></span>
                </Link>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="group border-2 border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl text-sm font-medium hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  How It Works
                </button>
              </div>

              <div className="flex items-center gap-5 pt-6 border-t border-gray-200 opacity-0 animate-fade-in-up delay-900">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-3 border-white bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden shadow-lg hover:scale-110 transition-transform hover:z-10 cursor-pointer"
                      style={{ zIndex: 5 - i }}>
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {String.fromCharCode(64 + i)}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm text-gray-900 font-semibold"><span className="text-teal-600">2,400+</span> members trust CoFlare</div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative opacity-0 animate-fade-in-right delay-400">
              <div className="absolute -inset-6 bg-gradient-to-r from-teal-500/20 via-orange-500/10 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-teal-900 shadow-2xl -rotate-1 hover:rotate-0 transition-all duration-700 group">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop" 
                  alt="Team collaboration" 
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                      RK
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Rahul Sharma</div>
                      <div className="text-xs text-gray-500">Founder matched ✓</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 animate-float-slow">
                  <div className="text-sm font-semibold text-gray-900 mb-2">💰 ₹50L Seed Fund Raised</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 w-3/4 rounded-full relative">
                      <span className="absolute inset-0 bg-white/30 animate-shimmer"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl -z-10 animate-float-slower"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION - NEW WITH IMAGES */}
      <section id="about" className="py-28 lg:py-36 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold mb-4">
              <span className="w-8 h-0.5 bg-teal-500 rounded-full"></span>
              About Us
            </span>
            <h2 className="font-bold text-5xl lg:text-7xl text-gray-900 mb-6">More than a network.<br/>A movement.</h2>
            <p className="text-gray-600 text-lg">Bridging the gap between talent and opportunity across India</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Images Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format" 
                    alt="Team meeting" 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Collaborative Culture
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format" 
                    alt="Startup meeting" 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Startup Ecosystem
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format" 
                    alt="Mentorship" 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Expert Mentorship
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group -mt-4">
                  <img 
                    src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format" 
                    alt="Investment" 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Investment Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-8 opacity-0 animate-fade-in-right delay-300">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                  Our Story
                </div>
                <h3 className="font-bold text-3xl text-gray-900 mb-4">Founded in 2023 with a mission to democratize startup success</h3>
                <p className="text-gray-600 leading-relaxed">
                  CoFlare was born from a simple observation: brilliant founders outside major tech hubs lack access to the networks, mentors, and capital they deserve. We're changing that by building India's most inclusive startup ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl flex-shrink-0">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Mission</h4>
                    <p className="text-sm text-gray-600">Democratize access to startup networks across India, ensuring talent meets opportunity regardless of location.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl flex-shrink-0">
                    🔭
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Vision</h4>
                    <p className="text-sm text-gray-600">Power 10,000 Indian startups by 2030, creating a more equitable and innovative entrepreneurial landscape.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sai Kiran, Founder</p>
                    <p className="text-xs text-gray-500">Ex-Google, IIT Madras</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "I built CoFlare because I believe India's next unicorn could come from a small town. We're building the infrastructure to make that happen."
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="font-bold text-2xl text-teal-600">2.4K+</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-teal-600">28</div>
                  <div className="text-xs text-gray-500">States</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-teal-600">₹84Cr</div>
                  <div className="text-xs text-gray-500">Raised</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white -mt-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { v: '2,400+', l: 'Active Founders', i: '🚀' },
              { v: '480+', l: 'Verified Mentors', i: '📚' },
              { v: '120+', l: 'Active Investors', i: '💎' },
              { v: '28', l: 'States Covered', i: '🗺️' }
            ].map((stat, i) => (
              <div key={stat.l} className="text-center group opacity-0 animate-fade-in-up" style={{ animationDelay: `${1 + i * 0.1}s` }}>
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 inline-block">{stat.i}</div>
                <div className="font-bold text-4xl mb-1 bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-300">{stat.v}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-28 lg:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold mb-4">
              <span className="w-8 h-0.5 bg-teal-500 rounded-full"></span>
              What We Offer
            </span>
            <h2 className="font-bold text-5xl lg:text-7xl text-gray-900 mb-6">Three portals.<br/>One ecosystem.</h2>
            <p className="text-gray-600 text-lg">Everything you need to succeed, all in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: 'Founders Portal',
                d: 'Build your identity, find co-founders, access mentors and investors.',
                i: '🚀',
                g: 'from-teal-500 to-teal-600',
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format',
                items: ['Public profile', 'Co-founder search', 'Mentor matching', 'Grant tracking']
              },
              {
                t: 'Mentors Portal',
                d: 'Discover founders, publish courses, earn recognition for your guidance.',
                i: '📚',
                g: 'from-orange-500 to-orange-600',
                image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format',
                items: ['Find by domain', 'Publish courses', 'Direct messaging', 'Verified badge']
              },
              {
                t: 'Investor Portal',
                d: 'Curated deal flow, screen founders, connect beyond metro cities.',
                i: '💎',
                g: 'from-purple-500 to-purple-600',
                image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&auto=format',
                items: ['National deal flow', 'Startup screening', 'Vetted founders', 'Direct outreach']
              }
            ].map((portal) => (
              <div key={portal.t} className="group bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img src={portal.image} alt={portal.t} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${portal.g} flex items-center justify-center text-2xl shadow-lg`}>
                    {portal.i}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{portal.t}</h3>
                  <p className="text-sm text-gray-600 mb-4">{portal.d}</p>
                  <ul className="space-y-2 text-sm">
                    {portal.items.map(item => (
                      <li key={item} className="flex gap-2 items-center text-gray-700">
                        <span className="text-teal-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 lg:py-36 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold mb-4">
            <span className="w-8 h-0.5 bg-teal-500 rounded-full"></span>
            Simple Process
          </span>
          <h2 className="font-bold text-5xl lg:text-7xl text-gray-900 mb-16">Three steps to join.</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { s: '01', t: 'Sign Up', d: 'Google or email. Pick your role.', i: '👋', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format' },
              { s: '02', t: 'Build Profile', d: 'Quick wizard. Add skills & domain.', i: '📝', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format' },
              { s: '03', t: 'Connect & Grow', d: 'Post, message, find mentors.', i: '🚀', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format' }
            ].map((step) => (
              <div key={step.s} className="relative group cursor-pointer">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img src={step.image} alt={step.t} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white text-5xl font-bold opacity-50">{step.s}</div>
                  </div>
                  <div className="p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      {step.i}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{step.t}</h3>
                    <p className="text-sm text-gray-600">{step.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/auth/login" 
            className="inline-flex items-center gap-2 mt-12 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 group">
            Start Now — It's Free 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-28 lg:py-36 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold mb-4">
              <span className="w-8 h-0.5 bg-teal-500 rounded-full"></span>
              FAQ
            </span>
            <h2 className="font-bold text-5xl lg:text-7xl text-gray-900 mb-6">Got questions?</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about CoFlare</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="group bg-gray-50 border border-gray-200 rounded-2xl hover:border-teal-500/30 transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex items-center justify-between w-full p-6 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  <span className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500 transition-colors duration-300">
                    <svg 
                      className={`w-4 h-4 text-teal-600 group-hover:text-white transition-transform duration-300 ${activeFaq === index ? 'rotate-45' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-28 lg:py-36 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold mb-4">
              <span className="w-8 h-0.5 bg-teal-500 rounded-full"></span>
              Get In Touch
            </span>
            <h2 className="font-bold text-5xl lg:text-7xl text-gray-900 mb-6">Let's talk.</h2>
            <p className="text-gray-600 text-lg">Have questions? We'd love to hear from you</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                    <a href="mailto:hello@coflare.in" className="text-gray-600 hover:text-teal-600 transition-colors">hello@coflare.in</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visit Us</h3>
                    <p className="text-gray-600">Bangalore, India</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Response Time</h3>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  {[
                    { icon: 'in', label: 'LinkedIn', color: 'bg-[#0A66C2]' },
                    { icon: 'tw', label: 'Twitter', color: 'bg-[#1DA1F2]' },
                    { icon: 'ig', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
                  ].map(social => (
                    <a
                      key={social.label}
                      href="#"
                      className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300`}
                    >
                      {social.icon === 'in' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      )}
                      {social.icon === 'tw' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.335-11.444 9.88 9.88 0 002.463-2.54z"/>
                        </svg>
                      )}
                      {social.icon === 'ig' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && (
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></span>
                </button>

                {submitStatus && (
                  <div className={`p-4 rounded-xl ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 lg:py-36 bg-gradient-to-br from-teal-500 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center text-white">
          <h2 className="font-bold text-5xl lg:text-7xl mb-6">Ready to build?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join 2,400+ founders, mentors, and investors building India's startup future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/login" 
              className="bg-white text-teal-600 px-10 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2 group">
              Join Free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <Link href="/" className="font-bold text-2xl text-white flex items-center gap-2 mb-4">
                <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/30 to-orange-500/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-300">
                <img src="/coflare-logo.jpeg" alt="" />
              </div>
            </div>
                CoFlare
              </Link>
              <p className="text-sm max-w-xs">India's institutional network for founders, mentors, and investors.</p>
            </div>
            
            {[
              { t: 'Platform', l: ['Features', 'How It Works', 'Pricing', 'Sign In'] },
              { t: 'Company', l: ['About', 'Success Stories', 'Press', 'Careers'] },
              { t: 'Legal', l: ['Privacy', 'Terms', 'Cookies', 'Refunds'] }
            ].map(col => (
              <div key={col.t}>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">{col.t}</div>
                <ul className="space-y-2 text-sm">
                  {col.l.map(item => (
                    <li key={item}>
                      <button onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} className="hover:text-teal-400 transition-colors duration-300">
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-xs text-center">
            © 2026 CoFlare. Made with ❤️ in India. For founders everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}