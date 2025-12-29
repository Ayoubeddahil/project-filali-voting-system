import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import { PlusCircle, Users, Clock, Copy, Check, LogIn, BarChart3, TrendingUp, Activity, FileSpreadsheet } from 'lucide-react'
import JoinRoomModal from '../components/JoinRoomModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [stats, setStats] = useState({
    activeRooms: 0,
    totalVotes: 0,
    todayVisits: 0,
    roomMembers: 0
  })
  const [activity, setActivity] = useState([])

  useEffect(() => {
    if (user?.email) {
      loadRooms()
      loadStats()
      loadActivity()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadRooms = async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }
    try {
      const response = await api.getUserRooms(user.email)
      setRooms(response.data.rooms || [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      if (user?.email) {
        // Get all polls from user's rooms to calculate real votes
        const pollsPromises = rooms.map(room =>
          api.getRoomPolls(room.id).catch(() => ({ data: { polls: [] } }))
        )
        const pollsResults = await Promise.all(pollsPromises)
        const allPolls = pollsResults.flatMap(res => res.data.polls || [])

        // Calculate total votes
        const totalVotes = allPolls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0)

        // Calculate today's visits (activities today)
        const activitiesRes = await api.getActivities(user.email).catch(() => ({ data: { activities: [] } }))
        const today = new Date().toDateString()
        const todayVisits = (activitiesRes.data.activities || []).filter(act =>
          new Date(act.timestamp).toDateString() === today
        ).length

        const activeRooms = (rooms || []).filter(r => r.status === 'active').length
        const totalMembers = (rooms || []).reduce((sum, r) => sum + (r.members?.length || 0), 0)

        setStats({
          activeRooms,
          totalVotes,
          todayVisits,
          roomMembers: totalMembers
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadActivity = async () => {
    try {
      if (user?.email) {
        const response = await api.getActivities(user.email)
        const activities = response.data.activities || []

        // Format activities for display
        const formatted = activities.map(act => {
          const date = new Date(act.timestamp)
          const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          return {
            time,
            action: act.description,
            type: act.type,
            timestamp: act.timestamp
          }
        })

        setActivity(formatted)
      }
    } catch (error) {
      console.error('Failed to load activity:', error)
      // Fallback to empty array
      setActivity([])
    }
  }

  useEffect(() => {
    if (rooms.length > 0) {
      loadStats()
    }
  }, [rooms])

  const copyRoomCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👋 Welcome, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600">Manage your voting rooms and track activity</p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Rooms</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeRooms}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Votes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalVotes}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.todayVisits}</p>
                </div>
                <Activity className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Members</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.roomMembers}</p>
                </div>
                <Users className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Active Rooms</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
              <Link
                to="/create-room"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Room
              </Link>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
              <p className="text-gray-600 mb-6">Create your first room to start hosting polls!</p>
              <Link
                to="/create-room"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Room
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 card-hover"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {room.status}
                    </span>
                  </div>
                  {room.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{room.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        copyRoomCode(room.code)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      {copiedCode === room.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-xs font-medium">{room.code}</span>
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Activity Timeline */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{item.time}</p>
                    <p className="text-gray-900">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/create-room"
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <PlusCircle className="w-5 h-5" />
                Create New Room
              </Link>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
              <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors font-medium">
                <FileSpreadsheet className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {showJoinModal && (
        <JoinRoomModal onClose={() => setShowJoinModal(false)} />
      )}
    </>
  )
}

