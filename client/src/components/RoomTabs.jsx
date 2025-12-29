import { useState } from 'react'
import { api } from '../utils/api'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  FileText,
  Eye,
  Edit,
  XCircle,
  Download,
  Share2,
  Trash2,
  Archive,
  UserPlus,
  Shield,
  Clock,
  CheckCircle,
  Search,
  MessageSquare // Added import
} from 'lucide-react'
import PollCard from './PollCard'
import RoomMembers from './RoomMembers'
import ChatPanel from './ChatPanel' // Added import
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function RoomTabs({ room, polls, onUpdate, isAdmin, onCreatePoll }) {
  const { user } = useAuth()
  const socket = useSocket()
  const [activeTab, setActiveTab] = useState('overview')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [roomSettings, setRoomSettings] = useState({
    name: room?.name || '',
    description: room?.description || '',
    isPrivate: room?.isPrivate || false,
    anonymousVoting: false,
    showResultsWhileVoting: true,
    allowMultipleVotes: false,
    autoClosePolls: true
  })

  const activePolls = polls.filter(p => p.status === 'active')
  const endedPolls = polls.filter(p => p.status === 'closed')
  const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0)
  const participationRate = room.members?.length > 0
    ? Math.round((totalVotes / (room.members.length * polls.length)) * 100) || 0
    : 0

  const handleSaveSettings = async () => {
    try {
      await api.updateRoom(room.id, roomSettings)
      onUpdate()
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
  }

  const analyticsData = polls.map(poll => ({
    name: poll.question.substring(0, 20) + '...',
    votes: poll.totalVotes || 0
  }))

  const activityLog = [
    { time: '10:45', action: `Poll "${polls[0]?.question || 'New poll'}" created by ${user?.name}`, type: 'poll' },
    { time: '10:30', action: 'Sarah voted on "Homework difficulty"', type: 'vote' },
    { time: '10:15', action: 'Mike joined the room', type: 'join' },
    { time: '09:50', action: 'Room settings updated', type: 'settings' }
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'polls', label: 'Polls', icon: BarChart3 },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'activity', label: 'Activity Log', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600 mt-1">{room.description || 'No description provided'}</p>
                </div>
                {room.topics && room.topics.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Topics</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {room.topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Privacy</label>
                    <p className="text-gray-600">{room.isPrivate ? 'Private Room' : 'Public Room'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Voting</label>
                    <p className="text-gray-600">{roomSettings.anonymousVoting ? 'Anonymous' : 'Public'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Active Polls ({activePolls.length})</h3>
              {activePolls.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No active polls</p>
              ) : (
                <div className="space-y-4">
                  {activePolls.slice(0, 2).map((poll) => (
                    <div key={poll.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{poll.question}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{poll.totalVotes || 0} votes</span>
                        {poll.endsAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Ends {new Date(poll.endsAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View Live
                        </button>
                        {isAdmin && (
                          <>
                            <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              End Early
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                {isAdmin && (
                  <button
                    onClick={onCreatePoll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create New Poll
                  </button>
                )}
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Polls</option>
                  <option>Active</option>
                  <option>Ended</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export All Results
              </button>
            </div>

            {/* Polls Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {polls.map((poll, idx) => (
                    <tr key={poll.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{poll.question}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {poll.status === 'active' ? '🟢 Live' : '🔴 Ended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {poll.totalVotes || 0}/{room.members?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700">View</button>
                          {isAdmin && (
                            <>
                              <button className="text-gray-600 hover:text-gray-700">Edit</button>
                              <button className="text-gray-600 hover:text-gray-700">Export</button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm(`Are you sure you want to delete poll "${poll.question}"?`)) {
                                    try {
                                      await api.deletePoll(poll.id)
                                      onUpdate()
                                    } catch (error) {
                                      alert('Failed to delete poll')
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </>
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

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 flex-1">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={async () => {
                    const email = prompt('Enter email to invite:')
                    if (email) {
                      try {
                        await api.inviteToRoom(room.id, email)
                        alert(`✅ User ${email} invited successfully!`)
                        onUpdate()
                      } catch (error) {
                        alert(`Failed to invite: ${error.response?.data?.error || error.message}`)
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Members
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export List
                </button>
              </div>
              {isAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Shield className="w-4 h-4" />
                  Manage Permissions
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {room.members?.filter(member =>
                    !memberSearchQuery || member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                  ).map((member, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium">{member.email[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.email === user?.email ? `${member.email} (You)` : member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${member.role === 'admin' || room.creator === member.email
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {member.role === 'admin' || room.creator === member.email ? '👑 Admin' : '👤 Voter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {idx === 0 ? 'Now' : `${idx + 1} hour${idx > 1 ? 's' : ''} ago`}
                      </td>
                      {isAdmin && member.email !== user?.email && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-700">Remove</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomSettings.name}
                    onChange={(e) => setRoomSettings({ ...roomSettings, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={roomSettings.description || ''}
                    onChange={(e) => setRoomSettings({ ...roomSettings, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!roomSettings.isPrivate}
                        onChange={() => setRoomSettings({ ...roomSettings, isPrivate: false })}
                        className="mr-2"
                      />
                      Public Room
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="privacy"
                        checked={roomSettings.isPrivate}
                        onChange={() => setRoomSettings({ ...roomSettings, isPrivate: true })}
                        className="mr-2"
                      />
                      Private Room (requires approval)
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Voting Rules</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.anonymousVoting}
                        onChange={(e) => setRoomSettings({ ...roomSettings, anonymousVoting: e.target.checked })}
                        className="mr-2"
                      />
                      Allow anonymous voting
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.showResultsWhileVoting}
                        onChange={(e) => setRoomSettings({ ...roomSettings, showResultsWhileVoting: e.target.checked })}
                        className="mr-2"
                      />
                      Show live results while voting
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.allowMultipleVotes}
                        onChange={(e) => setRoomSettings({ ...roomSettings, allowMultipleVotes: e.target.checked })}
                        className="mr-2"
                      />
                      Allow multiple votes per poll
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.autoClosePolls}
                        onChange={(e) => setRoomSettings({ ...roomSettings, autoClosePolls: e.target.checked })}
                        className="mr-2"
                      />
                      Auto-close polls after 24 hours
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div className="space-y-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Archive className="w-4 h-4" />
                  Archive Room
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-700">
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Share2 className="w-4 h-4" />
                  Transfer Ownership
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Participation Rate</h4>
                  <span className="text-2xl font-bold text-gray-900">{participationRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(participationRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Based on total possible votes</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Avg. Votes per Poll</h4>
                <p className="text-3xl font-bold text-gray-900">
                  {polls.length > 0 ? (totalVotes / polls.length).toFixed(1) : 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Most Active Time</h4>
                <p className="text-3xl font-bold text-gray-900">10:00-12:00</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Activity Timeline</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Member {i} voted on poll {i}</p>
                      <p className="text-xs text-gray-500">{10 - i}:00 AM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatPanel roomId={room.id} />
            </div>
            <div className="hidden lg:block space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">Chat Etiquette</h4>
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Be respectful to others</li>
                  <li>Keep discussions relevant</li>
                  <li>No spamming</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
            <div className="space-y-4">
              {activityLog.map((item, idx) => (
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
        )}
      </div>
    </div>
  )
}

