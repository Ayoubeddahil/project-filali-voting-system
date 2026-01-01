import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { BarChart3, Users, FileText, TrendingUp, Shield } from 'lucide-react'

const COLORS = ['#1a1a1a', '#525252', '#a3a3a3', '#e5e5e5']

export default function AdminPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [statsRes, roomsRes, usersRes] = await Promise.all([
        api.getStats(),
        api.getAllRooms(),
        api.getAllUsers()
      ])

      setStats(statsRes.data.stats)
      setRooms(roomsRes.data.rooms)
      setUsers(usersRes.data?.users || usersRes.users || [])
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need super admin privileges to access this panel</p>
          <button onClick={() => window.location.href = '/'} className="mt-4 text-gray-900 hover:text-black font-medium hover:underline">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const roomStatusData = [
    { name: 'Active', value: stats?.roomsByStatus?.active || 0 },
    { name: 'Closed', value: stats?.roomsByStatus?.closed || 0 }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-black">V</div>
            <span className="text-xl font-bold">InVote Admin</span>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'rooms' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <FileText className="w-5 h-5" />
              Rooms Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Users className="w-5 h-5" />
              Users Management
            </button>

            <div className="pt-4 mt-4 border-t border-gray-800">
              <a href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                Back to Dashboard
              </a>
            </div>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-10 h-10 rounded-full bg-gray-800" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-medium">
                {user.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Users className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Rooms</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeRooms || 0}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-700" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Polls</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalPolls || 0}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Room Status Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roomStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {roomStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Rooms', value: stats?.totalRooms || 0 },
                        { name: 'Polls', value: stats?.totalPolls || 0 },
                        { name: 'Users', value: stats?.totalUsers || 0 },
                        { name: 'Votes', value: stats?.totalVotes || 0 }
                      ]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Room Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{room.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{room.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.creator}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure?')) {
                                await api.deleteRoom(room.id)
                                loadData()
                              }
                            }}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                              {u.picture ? (
                                <img src={u.picture} alt="" className="h-8 w-8 rounded-full" />
                              ) : (
                                <span className="text-xs font-medium text-gray-900">{u.name?.[0]}</span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'super_admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {u.role === 'super_admin' ? 'Super Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3">
                            {u.role === 'super_admin' && u.email !== user.email && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove admin privileges from ${u.name}?`)) {
                                    try {
                                      await api.updateUserRole(u.email, 'user')
                                      loadData()
                                    } catch (e) {
                                      alert('Failed to update user role')
                                    }
                                  }
                                }}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Demote
                              </button>
                            )}
                            {u.role !== 'super_admin' && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Make ${u.name} a super admin?`)) {
                                    try {
                                      await api.updateUserRole(u.email, 'super_admin')
                                      loadData()
                                    } catch (e) {
                                      alert('Failed to update user role')
                                    }
                                  }
                                }}
                                className="text-gray-900 hover:text-black font-medium"
                              >
                                Promote
                              </button>
                            )}
                            {u.email !== user.email && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Permanently delete user ${u.name}? This cannot be undone.`)) {
                                    try {
                                      await api.deleteUser(u.email)
                                      loadData()
                                    } catch (e) {
                                      alert('Failed to delete user')
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
