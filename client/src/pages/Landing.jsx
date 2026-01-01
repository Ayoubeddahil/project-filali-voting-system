import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import AuthModal from '../components/AuthModal'
import {
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  Star,
  Github,
  Twitter,
  Linkedin,
  Mail,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [featuredPolls, setFeaturedPolls] = useState([])
  const [popularRooms, setPopularRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPublicData()
  }, [])

  const loadPublicData = async () => {
    try {
      const [roomsRes, pollsRes] = await Promise.all([
        api.searchRooms(''),
        api.searchPolls('')
      ])
      setPopularRooms((roomsRes.data.rooms || []).slice(0, 3))
      setFeaturedPolls((pollsRes.data.polls || []).sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 3))
    } catch (error) {
      console.error('Failed to load public data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    navigate('/home')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">InVote</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How It Works</a>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black transition-all hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight text-balance">
            Decision making, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">simplified.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create minimalist voting rooms, gather instant feedback, and visualize results with zero friction. No clutter, just clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="group flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              Start Voting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 text-gray-600 px-8 py-4 rounded-full text-lg font-medium hover:text-gray-900 transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security with Google OAuth and encrypted sessions." },
              { icon: Zap, title: "Lightning Fast", desc: "Real-time updates via WebSockets for instant result visualization." },
              { icon: BarChart3, title: "Data Driven", desc: "Clean analytics and one-click export to CSV or PDF." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Designed for modern teams</h2>
            <p className="text-gray-500">Flexible enough for any context, simple enough for anyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Education", desc: "Instant feedback for lectures and seminars." },
              { title: "Enterprise", desc: "Agile retrospectives and team alignment." },
              { title: "Gaming", desc: "Community tournaments and viewer votes." },
              { title: "Research", desc: "Unbiased data collection from focus groups." }
            ].map((item, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Workflow that just<br />makes sense.</h2>
              <p className="text-gray-400 text-lg mb-8">No complex setups. Just Create, Share, and Vote.</p>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Connect', desc: 'Sign in instantly with Google.' },
                  { step: '02', title: 'Create Room', desc: 'Get a unique 6-digit code.' },
                  { step: '03', title: 'Analyze', desc: 'Real-time charts and insights.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <span className="text-2xl font-mono text-gray-600">{item.step}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20 rounded-full"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {[100, 75, 50].map((w, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-8 bg-blue-500 rounded-md" style={{ width: `${w}%`, opacity: 0.5 + (i * 0.2) }}></div>
                      <div className="h-4 w-8 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore what's happening</h2>
              <p className="text-gray-500 text-lg">Join thousands of users participating in public polls and communities across diverse topics.</p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="group flex items-center gap-2 text-gray-900 font-bold hover:gap-3 transition-all"
            >
              View all polls <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {featuredPolls.length > 0 ? featuredPolls.map((poll) => (
              <div
                key={poll.id}
                onClick={() => setShowAuthModal(true)}
                className="group cursor-pointer bg-gray-50 rounded-3xl p-8 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-400">Trending</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {poll.totalVotes} votes
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-black line-clamp-2 leading-snug">
                  {poll.question}
                </h3>
                <div className="space-y-3 mb-8">
                  {poll.options.slice(0, 2).map((opt, i) => (
                    <div key={i} className="relative h-10 bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gray-900/5 transition-all duration-1000"
                        style={{ width: `${(opt.votes / (poll.totalVotes || 1)) * 100}%` }}
                      ></div>
                      <div className="relative h-full flex items-center justify-between px-4 text-sm font-medium text-gray-600">
                        <span className="truncate pr-2">{opt.text}</span>
                        <span>{Math.round((opt.votes / (poll.totalVotes || 1)) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 group-hover:underline">Join to Vote</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )) : (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[300px] bg-gray-50 rounded-3xl animate-pulse"></div>
              ))
            )}
          </div>

          <div className="bg-gray-900 rounded-[40px] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Join active communities</h2>
                <p className="text-gray-400 text-lg mb-10">Connect with like-minded individuals in dedicated rooms. Discussion, debate, and discovery.</p>
                <div className="space-y-4">
                  {popularRooms.map(room => (
                    <div key={room.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setShowAuthModal(true)}>
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white">
                        {room.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{room.name}</h4>
                        <p className="text-sm text-gray-400">{room.members?.length || 0} members • {room.topics?.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-40 bg-white/5 rounded-3xl border border-white/10 p-6">
                      <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
                      <div className="h-2 w-16 bg-white/20 rounded-full mb-2"></div>
                      <div className="h-2 w-10 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-60 bg-white/5 rounded-3xl border border-white/10 p-6">
                      <Users className="w-8 h-8 text-purple-400 mb-4" />
                      <div className="h-2 w-20 bg-white/20 rounded-full mb-2"></div>
                      <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="h-60 bg-white/5 rounded-3xl border border-white/10 p-6">
                      <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
                      <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                      <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-40 bg-white/5 rounded-3xl border border-white/10 p-6">
                      <Clock className="w-8 h-8 text-orange-400 mb-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to simplify?</h2>
          <p className="text-gray-500 text-lg mb-8">Join the platform that gets out of your way.</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all"
          >
            Start Free Now
          </button>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-bold text-gray-900">InVote</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Twitter</a>
          </div>
          <p className="text-sm text-gray-400">© 2024 InVote.</p>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
