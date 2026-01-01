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
        const pollsPromises = rooms.map(room =>
          api.getRoomPolls(room.id).catch(() => ({ data: { polls: [] } }))
        )
        const pollsResults = await Promise.all(pollsPromises)
        const allPolls = pollsResults.flatMap(res => res.data.polls || [])

        const totalVotes = allPolls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0)

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-lg text-gray-500">Manage your voting rooms and track activity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Active Rooms", value: stats.activeRooms, icon: BarChart3 },
              { label: "Total Votes", value: stats.totalVotes, icon: TrendingUp },
              { label: "Today's Visits", value: stats.todayVisits, icon: Activity },
              { label: "Room Members", value: stats.roomMembers, icon: Users }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Rooms</h2>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                Join Room
              </button>
              {(user?.role === 'super_admin' || user?.role === 'teacher' || user?.role === 'manager') && (
                <Link
                  to="/create-room"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-black transition-colors font-medium shadow-lg shadow-gray-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Room
                </Link>
              )}
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No rooms yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create your first room to start hosting polls and gathering feedback.</p>
              {(user?.role === 'super_admin' || user?.role === 'teacher' || user?.role === 'manager') && (
                <Link
                  to="/create-room"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-black transition-colors font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Room
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">{room.name}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                    {room.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{room.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        copyRoomCode(room.code)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors group-hover:bg-gray-100"
                    >
                      {copiedCode === room.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs font-mono">{room.code}</span>
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Recent Activity
              </h3>
              <div className="space-y-0">
                {activity.length > 0 ? activity.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 ring-4 ring-white"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm py-4">No recent activity.</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Quick Tips</h3>
              <p className="text-gray-400 text-sm mb-6">Maximize your voting engagement.</p>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</div>
                  <span>Share room codes directly in chat for faster joining.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</div>
                  <span>Keep poll questions short and precise.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</div>
                  <span>Export results to CSV for deeper analysis.</span>
                </li>
              </ul>
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
