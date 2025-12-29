import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  Mail
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Redirect if already logged in
  if (user) {
    navigate('/home')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">VoteHub</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</a>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Make decisions together,
            <br />
            <span className="text-blue-600">in real-time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collaborative decision making made easy. Create voting rooms, gather opinions, and analyze results instantly.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Google Authentication</h3>
              <p className="text-gray-600">Enterprise-grade security with Google OAuth integration</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Voting Rooms</h3>
              <p className="text-gray-600">Create rooms, invite members, and vote together instantly</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Analytics Dashboard</h3>
              <p className="text-gray-600">Track participation, view results, and export data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Perfect for Every Use Case</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border hover:border-blue-500 rounded-xl p-6 transition-all hover:shadow-md group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Academic & Education</h3>
              <p className="text-gray-600 text-sm">Engage students with live polls, quizzes, and instant feedback during lectures or seminars.</p>
            </div>
            <div className="bg-white border hover:border-green-500 rounded-xl p-6 transition-all hover:shadow-md group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Corporate Teams</h3>
              <p className="text-gray-600 text-sm">Streamline decision-making in meetings, agile retrospectives, and town halls.</p>
            </div>
            <div className="bg-white border hover:border-purple-500 rounded-xl p-6 transition-all hover:shadow-md group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎮</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Communities & Gaming</h3>
              <p className="text-gray-600 text-sm">Host community votes, tournament brackets, or engaging viewer interactions.</p>
            </div>
            <div className="bg-white border hover:border-orange-500 rounded-xl p-6 transition-all hover:shadow-md group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Market Research</h3>
              <p className="text-gray-600 text-sm">Gather anonymous, unbiased feedback from focus groups or beta testers rapidly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Getting Started is Simple</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10"></div>

            {[
              { step: '1', title: 'Connect', desc: 'One-click sign in with your Google account. No passwords to remember.' },
              { step: '2', title: 'Create Room', desc: 'Launch a secure voting room and share the unique 6-digit code.' },
              { step: '3', title: 'Poll & Chat', desc: 'Create live polls and discuss topics in real-time with your team.' },
              { step: '4', title: 'Analyze', desc: 'Watch votes roll in live and export detailed reports instantly.' }
            ].map((item) => (
              <div key={item.step} className="text-center bg-gray-50 md:bg-transparent p-4 rounded-lg">
                <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: 'VoteHub completely transformed our sprint retrospectives. The anonymity features helps us get honest feedback.', author: 'Sarah J.', role: 'Product Manager at TechFlow' },
              { text: 'Finally, a voting tool that doesn\'t require my students to create accounts. The room code system is brilliant.', author: 'Prof. David Chen', role: 'Computer Science Dept.' },
              { text: 'We used VoteHub for our HOA board election. Secure, transparent, and incredibly easy to set up.', author: 'Michael Ross', role: 'Community Board Director' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of teams making better decisions together</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-white font-bold text-lg">VoteHub</span>
              </div>
              <p className="text-sm">Modern voting platform for collaborative decision making.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p className="text-gray-400">© 2024 VoteHub. All rights reserved. Demo platform for presentation purposes.</p>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}

