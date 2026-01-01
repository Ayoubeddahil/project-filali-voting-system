import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import PollCard from '../components/PollCard'
import CreatePollModal from '../components/CreatePollModal'
import RoomTabs from '../components/RoomTabs'
import GoogleIntegrations from '../components/GoogleIntegrations'
import { PlusCircle, Copy, Check, ArrowLeft, Users, Settings, Trash2, Home, X } from 'lucide-react'

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

  // Toast Notification State
  const [toast, setToast] = useState(null)



  useEffect(() => {
    loadRoom()
    if (socket) {
      socket.emit('join_room', { roomId, user })
      // socket.on('poll_updated', handlePollUpdate) -> Moved to separate effect with notification logic
      socket.on('poll_created', handlePollUpdate) // Re-use update handler (reloads room)

      // Removed duplicate/incorrect 'vote-received' listener as 'poll_updated' should cover it
      // or if we want to be specific we can keep it but mapped to 'poll_updated' logic

      return () => {
        // socket.off('poll_updated') -> Handled in separate effect
        socket.off('poll_created')
      }
    }
  }, [roomId, socket])

  // Refs to access latest state inside socket listener without re-binding
  const roomRef = useRef(room)
  const userRef = useRef(user)

  // Update refs when state changes
  useEffect(() => {
    roomRef.current = room
  }, [room])

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (socket) {
      const onPollUpdate = (data) => {
        const currentRoom = roomRef.current
        const currentUser = userRef.current

        // Admin check using fresh ref data
        const isCreator = currentRoom?.creator === currentUser?.email
        const isAdminMember = currentRoom?.members?.find(m => m.email === currentUser?.email)?.role === 'admin'
        const isUserAdmin = isCreator || isAdminMember

        const voterName = data.voterName || 'Someone'
        const isNotSelf = voterName !== currentUser?.name

        if (isUserAdmin && isNotSelf && data.voterName) { // Only notify if we actually have a voter name (implies it's a vote event)
          showToast(`🗳️ ${voterName} voted on a poll!`)
        }

        // Always reload data
        handlePollUpdate(data)
      }

      socket.on('poll_updated', onPollUpdate)

      return () => {
        socket.off('poll_updated', onPollUpdate)
      }
    }
  }, [roomId, socket]) // Dependencies reduced to stable items

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h2>
            <p className="text-gray-500 mb-6">The room you are looking for does not exist or has been deleted.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </>
    )
  }



  // ... (previous effects)



  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 z-[100] animate-bounce-in">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-800">
            <div className="bg-green-500 rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{toast}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Room Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{room.name}</h1>
                  {user?.role === 'super_admin' && (
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">
                      SUPER ADMIN
                    </span>
                  )}
                  {room.isPrivate && (
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                      Private
                    </span>
                  )}
                </div>
                {room.description && (
                  <p className="text-gray-500 mb-6 text-lg max-w-2xl text-balance">{room.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{room.members?.length || 0}</span>
                    <span className="text-gray-400">members</span>
                  </div>

                  <div className="h-4 w-px bg-gray-200 hidden md:block"></div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Room Code:</span>
                    <button
                      onClick={copyRoomCode}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-mono font-medium text-sm"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          {room.code}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
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
                        className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreatePoll(true)}
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-black transition-colors font-medium shadow-lg shadow-gray-200 text-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
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

          {/* Poll Card Feed - shown below tabs as well for visibility */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Polls</h2>

            </div>

            {polls.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No polls yet</h3>
                <p className="text-gray-500 mb-6">
                  {isAdmin ? 'Create your first poll to get feedback.' : 'Waiting for the admin to create a poll.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="text-sm font-medium text-gray-900 underline hover:no-underline"
                  >
                    Create a poll now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
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

          {/* Sidebar Area (e.g. Google Integrations) */}
          <div className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Integrations & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoogleIntegrations room={room} polls={polls} />
              {/* Future settings panels can go here */}
            </div>
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

