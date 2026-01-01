import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import { ArrowLeft, Save } from 'lucide-react'

export default function CreateRoom() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login')
      } else if (user.role === 'student') {
        navigate('/dashboard')
      }
    }
  }, [user, authLoading, navigate])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topics: '',
    isPrivate: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)

    try {
      const topics = formData.topics.split(',').map(t => t.trim()).filter(Boolean)
      const response = await api.createRoom({
        ...formData,
        topics
      })

      navigate(`/room/${response.data.room.id}`)
    } catch (error) {
      console.error('Failed to create room:', error)
      alert('Failed to create room: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Room</h1>
            <p className="text-gray-500 mb-8">Set up a space for your team to vote and discuss.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="e.g., Q4 Planning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="What's this room for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="e.g., Marketing, Budget, Design"
                />
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                />
                <label htmlFor="isPrivate" className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                  Private room
                  <span className="block text-gray-500 text-xs font-normal mt-0.5">Only people with the link can request to join.</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors disabled:opacity-50 font-medium shadow-lg shadow-gray-200"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}


