import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { useSocket } from '../contexts/SocketContext'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Clock, CheckCircle, XCircle, X } from 'lucide-react'

const COLORS = ['#1a1a1a', '#525252', '#a3a3a3', '#e5e5e5']

export default function PollCard({ poll, roomId, isAdmin, onUpdate }) {
  const { user } = useAuth()
  const socket = useSocket()
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [pollData, setPollData] = useState(poll)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPollData(poll)
    updateLocalVoteStatus(poll)
  }, [poll])

  useEffect(() => {
    if (socket) {
      const onPollUpdate = (data) => {
        if (data.pollId === poll.id) {
          if (data.voterName !== user?.name) {
            loadPoll()
          }
        }
      }
      socket.on('poll_updated', onPollUpdate)
      return () => socket.off('poll_updated', onPollUpdate)
    }
  }, [socket, poll.id, user?.name])

  const updateLocalVoteStatus = (data) => {
    if (data.hasVoted) {
      setHasVoted(true)
      setSelectedOption(data.userVote)
    } else {
      setHasVoted(false)
      setSelectedOption(null)
    }
  }

  const loadPoll = async () => {
    try {
      const response = await api.getPoll(poll.id)
      setPollData(response.data.poll)
      updateLocalVoteStatus(response.data.poll)
    } catch (error) {
      console.error('Failed to load poll:', error)
    }
  }

  const handleVote = async (optionId) => {
    if (hasVoted || pollData.status !== 'active') return

    setLoading(true)
    try {
      await api.vote(poll.id, optionId)
      setSelectedOption(optionId)
      setHasVoted(true)

      if (socket) {
        socket.emit('vote_update', {
          roomId,
          pollId: poll.id,
          optionId,
          voterName: user.name
        })
      }

      loadPoll()
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePoll = async () => {
    if (!isAdmin) return

    try {
      await api.closePoll(poll.id)
      if (socket) {
        socket.emit('vote_update', { roomId, pollId: poll.id })
      }
      onUpdate()
    } catch (error) {
      console.error('Failed to close poll:', error)
    }
  }

  const chartData = pollData.options.map((opt, idx) => ({
    name: opt.text,
    value: opt.votes,
    color: COLORS[idx % COLORS.length]
  }))

  const isActive = pollData.status === 'active'
  const calculatedTotal = pollData.options.reduce((sum, opt) => sum + opt.votes, 0)
  const displayTotal = calculatedTotal || pollData.totalVotes || 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pollData.question}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className={`px-2.5 py-0.5 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
              {isActive ? 'Active' : 'Closed'}
            </span>
            <span>{displayTotal} people voted</span>
            {pollData.endsAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Ends {new Date(pollData.endsAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        {isAdmin && isActive && (
          <button
            onClick={handleClosePoll}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="End Poll"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {isActive && !hasVoted ? (
        <div className="space-y-3 mb-4">
          {pollData.options.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={loading}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 group-hover:text-black">{option.text}</span>
                <span className="text-sm text-gray-400 group-hover:text-gray-600">Click to vote</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-4">
            {pollData.options.map((option, idx) => {
              const percentage = displayTotal > 0 ? (option.votes / displayTotal) * 100 : 0
              return (
                <div key={option.id} className="relative">
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-sm font-medium text-gray-900">{option.text}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {option.votes} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full transition-all duration-500 ease-out opacity-20"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: '#000000'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {displayTotal > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Results</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
