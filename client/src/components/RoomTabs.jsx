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
  MessageSquare
} from 'lucide-react'
import PollCard from './PollCard'
import RoomMembers from './RoomMembers'
import ChatPanel from './ChatPanel'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#1a1a1a', '#525252', '#a3a3a3', '#e5e5e5']

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
      <div className="border-b mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'polls', label: 'Polls', icon: BarChart3 },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'activity', label: 'Activity Log', icon: FileText },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
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

      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-900">Description</label>
                  <p className="text-gray-500 mt-1">{room.description || 'No description provided'}</p>
                </div>
                {room.topics && room.topics.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-900">Topics</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {room.topics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Privacy</label>
                    <p className="text-gray-500">{room.isPrivate ? 'Private Room' : 'Public Room'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900">Voting</label>
                    <p className="text-gray-500">{roomSettings.anonymousVoting ? 'Anonymous' : 'Public'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Active Polls ({activePolls.length})</h3>
              {activePolls.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active polls</p>
              ) : (
                <div className="space-y-4">
                  {activePolls.slice(0, 2).map((poll) => (
                    <div key={poll.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{poll.question}</h4>
                        <span className="px-2 py-1 bg-gray-900 text-white rounded-full text-xs">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{poll.totalVotes || 0} votes</span>
                        {poll.endsAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Ends {new Date(poll.endsAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="text-sm text-gray-900 hover:text-black font-medium flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View Live
                        </button>
                        {isAdmin && (
                          <>
                            <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
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
                    className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors font-medium text-sm shadow-sm"
                  >
                    Create New Poll
                  </button>
                )}
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                  <option>All Polls</option>
                  <option>Active</option>
                  <option>Ended</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export All Results
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {polls.map((poll, idx) => (
                    <tr key={poll.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{poll.question}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${poll.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {poll.status === 'active' ? 'Live' : 'Ended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {poll.totalVotes || 0}/{room.members?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button className="text-gray-900 hover:text-black font-medium">View</button>
                          {isAdmin && (
                            <>
                              <button className="text-gray-500 hover:text-gray-900">Edit</button>
                              <button className="text-gray-500 hover:text-gray-900">Export</button>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={async () => {
                    const email = prompt('Enter email to invite:')
                    if (email) {
                      try {
                        await api.inviteToRoom(room.id, email)
                        alert(`User ${email} invited successfully!`)
                        onUpdate()
                      } catch (error) {
                        alert(`Failed to invite: ${error.response?.data?.error || error.message}`)
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-black transition-all shadow-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Members
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Export List
                </button>
              </div>
              {isAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 ml-3 font-medium transition-colors">
                  <Shield className="w-4 h-4" />
                  Permissions
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Last Active</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {room.members?.filter(member =>
                    !memberSearchQuery || member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                  ).map((member, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-900 font-bold">{member.email[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.email === user?.email ? `${member.email} (You)` : member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${member.role === 'admin' || room.creator === member.email
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {member.role === 'admin' || room.creator === member.email ? 'Admin' : 'Voter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idx === 0 ? 'Now' : `${idx + 1} hour${idx > 1 ? 's' : ''} ago`}
                      </td>
                      {isAdmin && member.email !== user?.email && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-700 font-medium">Remove</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Room Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomSettings.name}
                    onChange={(e) => setRoomSettings({ ...roomSettings, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={roomSettings.description || ''}
                    onChange={(e) => setRoomSettings({ ...roomSettings, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Privacy</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!roomSettings.isPrivate}
                        onChange={() => setRoomSettings({ ...roomSettings, isPrivate: false })}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className="ml-3 text-gray-700">Public Room</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={roomSettings.isPrivate}
                        onChange={() => setRoomSettings({ ...roomSettings, isPrivate: true })}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <div className="ml-3">
                        <span className="block text-gray-700">Private Room</span>
                        <span className="block text-xs text-gray-500">Requires approval/invite to join</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">Voting Rules</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.anonymousVoting}
                        onChange={(e) => setRoomSettings({ ...roomSettings, anonymousVoting: e.target.checked })}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="ml-3 text-gray-700">Allow anonymous voting</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.showResultsWhileVoting}
                        onChange={(e) => setRoomSettings({ ...roomSettings, showResultsWhileVoting: e.target.checked })}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="ml-3 text-gray-700">Show live results while voting</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.allowMultipleVotes}
                        onChange={(e) => setRoomSettings({ ...roomSettings, allowMultipleVotes: e.target.checked })}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="ml-3 text-gray-700">Allow multiple votes per poll</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomSettings.autoClosePolls}
                        onChange={(e) => setRoomSettings({ ...roomSettings, autoClosePolls: e.target.checked })}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <span className="ml-3 text-gray-700">Auto-close polls after 24 hours</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors font-medium shadow-sm"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                  <Archive className="w-4 h-4" />
                  Archive Room
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-full hover:bg-red-50 text-red-600 font-medium transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                  <Share2 className="w-4 h-4" />
                  Transfer Ownership
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-end mb-3">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Participation</h4>
                  <span className="text-2xl font-bold text-gray-900">{participationRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(participationRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Based on total possible votes</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Avg. Votes/Poll</h4>
                <p className="text-3xl font-bold text-gray-900">
                  {polls.length > 0 ? (totalVotes / polls.length).toFixed(1) : 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Peak Activity</h4>
                <p className="text-3xl font-bold text-gray-900">10:00-12:00</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Member Activity Timeline</h3>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                      {i < 4 && <div className="w-px h-full bg-gray-200 my-1"></div>}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-gray-900">Member {i} voted on poll {i}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{10 - i}:00 AM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatPanel roomId={room.id} />
            </div>
            <div className="hidden lg:block space-y-4">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Chat Etiquette</h4>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                  <li>Be respectful to others</li>
                  <li>Keep discussions relevant</li>
                  <li>No spamming</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Log</h3>
            <div className="space-y-6">
              {activityLog.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                    {idx < activityLog.length - 1 && <div className="w-px h-full bg-gray-200 my-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-500 mb-0.5">{item.time}</p>
                    <p className="text-gray-900 font-medium">{item.action}</p>
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
