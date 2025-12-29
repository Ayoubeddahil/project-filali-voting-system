import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import PollCard from '../components/PollCard'
import CreatePollModal from '../components/CreatePollModal'
import RoomTabs from '../components/RoomTabs'
import GoogleIntegrations from '../components/GoogleIntegrations'
import { PlusCircle, Copy, Check, ArrowLeft, Users } from 'lucide-react'

export default function RoomDetail() {
  const { roomId } = useParams()
  const { user } = useAuth()
  const socket = useSocket()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    loadRoom()
    if (socket) {
      socket.emit('join-room', roomId)
      socket.on('poll-updated', handlePollUpdate)
      socket.on('vote-received', handleVoteReceived)
      
      return () => {
        socket.off('poll-updated')
        socket.off('vote-received')
      }
    }
  }, [roomId, socket])

  const loadRoom = async () => {
    try {
      const [roomRes, pollsRes] = await Promise.all([
        api.getRoom(roomId),
        api.getRoomPolls(roomId)
      ])
      setRoom(roomRes.data.room)
      setPolls(pollsRes.data.polls)
    } catch (error) {
      console.error('Failed to load room:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePollUpdate = (data) => {
    loadRoom()
  }

  const handleVoteReceived = (data) => {
    loadRoom()
  }

  const handlePollCreated = () => {
    setShowCreatePoll(false)
    loadRoom()
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const isAdmin = room?.creator === user?.email || 
    room?.members?.find(m => m.email === user?.email)?.role === 'admin'

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

  if (!room) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Room not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {/* Room Header */}
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-xl shadow-xl p-6 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{room.name}</h1>
                  {user?.role === 'super_admin' && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      ⚡ SUPER ADMIN
                    </span>
                  )}
                </div>
                {room.description && (
                  <p className="text-white/90 mb-4">{room.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <Users className="w-4 h-4" />
                    <span>{room.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/90">Room Code:</span>
                    <button
                      onClick={copyRoomCode}
                      className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-mono font-semibold"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {room.code}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    {(user?.role === 'super_admin' || room.creator === user?.email) && (
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete room "${room.name}"? This will delete all polls and votes.`)) {
                            try {
                              await api.deleteRoom(room.id)
                              navigate('/dashboard')
                            } catch (error) {
                              alert('Failed to delete room')
                            }
                          }
                        }}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete Room
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreatePoll(true)}
                      className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Create Poll
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Room Tabs Component */}
          <RoomTabs 
            room={room} 
            polls={polls} 
            onUpdate={loadRoom} 
            isAdmin={isAdmin}
            onCreatePoll={() => setShowCreatePoll(true)}
          />

          {/* Poll Cards (shown in Overview tab, but also here for main view) */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Active Polls</h2>
            {polls.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">
                  {isAdmin ? 'Create your first poll to get started' : 'Wait for the admin to create polls'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    roomId={roomId}
                    isAdmin={isAdmin}
                    onUpdate={loadRoom}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-8">
            <GoogleIntegrations room={room} polls={polls} />
          </div>
        </div>
      </div>

      {showCreatePoll && (
        <CreatePollModal
          roomId={roomId}
          onClose={() => setShowCreatePoll(false)}
          onCreated={handlePollCreated}
        />
      )}
    </>
  )
}

