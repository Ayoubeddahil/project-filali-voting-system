import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { useSocket } from '../contexts/SocketContext'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Clock, CheckCircle, XCircle, X } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function PollCard({ poll, roomId, isAdmin, onUpdate }) {
  const { user } = useAuth()
  const socket = useSocket()
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [pollData, setPollData] = useState(poll)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPollData(poll)
    checkVoteStatus()
  }, [poll])

  useEffect(() => {
    if (socket) {
      socket.on('vote-received', (data) => {
        if (data.pollId === poll.id) {
          loadPoll()
        }
      })
      return () => socket.off('vote-received')
    }
  }, [socket, poll.id])

  const checkVoteStatus = async () => {
    // In real app, check if user has voted
    // For demo, we'll simulate this
    setHasVoted(false)
  }

  const loadPoll = async () => {
    try {
      const response = await api.getPoll(poll.id)
      setPollData(response.data.poll)
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
        socket.emit('new-vote', { roomId, pollId: poll.id, optionId })
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
        socket.emit('poll-update', { roomId, pollId: poll.id })
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
  const totalVotes = pollData.totalVotes || pollData.options.reduce((sum, opt) => sum + opt.votes, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{pollData.question}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {isActive ? 'Active' : 'Closed'}
            </span>
            <span>{totalVotes} votes</span>
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
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {isActive && !hasVoted ? (
        <div className="space-y-2 mb-4">
          {pollData.options.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={loading}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{option.text}</span>
                <span className="text-sm text-gray-500">Click to vote</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Results */}
          <div className="mb-4">
            {pollData.options.map((option, idx) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
              return (
                <div key={option.id} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{option.text}</span>
                    <span className="text-sm text-gray-600">
                      {option.votes} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          {totalVotes > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pie Chart</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bar Chart</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
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

