import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Home, PlusCircle, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">VoteHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to={user ? "/home" : "/"} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              {!user && (
                <>
                  <Link to="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Features
                  </Link>
                  <Link to="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    How it Works
                  </Link>
                  <Link to="/testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Testimonials
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role !== 'super_admin' && (
                  <Link
                    to="/create-room"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Room
                  </Link>
                )}
                {user.role === 'super_admin' && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  </div>
                  <img src={user.picture} alt="" className="w-8 h-8 rounded-full bg-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav >
  )
}

