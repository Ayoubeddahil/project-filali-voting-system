import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { useSocket } from '../contexts/SocketContext'
import { X, Clock, Eye, Edit3, Palette } from 'lucide-react'

export default function CreatePollModal({ roomId, onClose, onCreated }) {
  const { user } = useAuth()
  const socket = useSocket()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    duration: '',
    durationType: 'none',
    endDate: '',
    anonymousVoting: false,
    showResultsWhileVoting: true,
    allowChangeVote: false,
    chartType: 'pie'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validOptions = formData.options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options')
      return
    }

    setLoading(true)
    try {
      let duration = null
      if (formData.durationType === 'hours' && formData.duration) {
        duration = parseInt(formData.duration) * 3600 // Convert hours to seconds
      } else if (formData.durationType === 'date' && formData.endDate) {
        const endDate = new Date(formData.endDate)
        duration = Math.floor((endDate.getTime() - Date.now()) / 1000)
      }

      const response = await api.createPoll({
        roomId,
        question: formData.question,
        description: formData.description,
        options: validOptions,
        duration
      })

      if (socket) {
        socket.emit('poll-update', { roomId, pollId: response.data.poll.id })
      }

      onCreated()
    } catch (error) {
      console.error('Failed to create poll:', error)
      alert('Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (formData.options.length < 4) {
      setFormData({ ...formData, options: [...formData.options, ''] })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Poll</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="What would you like to ask?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Add more context about this poll..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options (2-4 options) *
            </label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options]
                      newOptions[index] = e.target.value
                      setFormData({ ...formData, options: newOptions })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm text-gray-900 hover:text-black font-medium"
              >
                + Add Option
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration Settings
            </label>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="durationType"
                    value="none"
                    checked={formData.durationType === 'none'}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="mr-2"
                  />
                  No end date
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="durationType"
                    value="hours"
                    checked={formData.durationType === 'hours'}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="mr-2"
                  />
                  End after:
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded"
                    placeholder="24"
                    disabled={formData.durationType !== 'hours'}
                  />
                  hours
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="durationType"
                    value="date"
                    checked={formData.durationType === 'date'}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="mr-2"
                  />
                  End at specific date:
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded"
                    disabled={formData.durationType !== 'date'}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Privacy Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.anonymousVoting}
                  onChange={(e) => setFormData({ ...formData, anonymousVoting: e.target.checked })}
                  className="mr-2"
                />
                Allow anonymous voting
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.showResultsWhileVoting}
                  onChange={(e) => setFormData({ ...formData, showResultsWhileVoting: e.target.checked })}
                  className="mr-2"
                />
                Show live results while voting
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowChangeVote}
                  onChange={(e) => setFormData({ ...formData, allowChangeVote: e.target.checked })}
                  className="mr-2"
                />
                Allow voters to change their vote
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Display Options
            </label>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Result chart type:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="chartType"
                    value="pie"
                    checked={formData.chartType === 'pie'}
                    onChange={(e) => setFormData({ ...formData, chartType: e.target.value })}
                    className="mr-2"
                  />
                  Pie Chart
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="chartType"
                    value="bar"
                    checked={formData.chartType === 'bar'}
                    onChange={(e) => setFormData({ ...formData, chartType: e.target.value })}
                    className="mr-2"
                  />
                  Bar Chart
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="chartType"
                    value="donut"
                    checked={formData.chartType === 'donut'}
                    onChange={(e) => setFormData({ ...formData, chartType: e.target.value })}
                    className="mr-2"
                  />
                  Donut Chart
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

