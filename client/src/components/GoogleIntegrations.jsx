import { useState } from 'react'
import { api } from '../utils/api'
import { FileSpreadsheet, Calendar, HardDrive, Users, Loader, Check } from 'lucide-react'

export default function GoogleIntegrations({ room, polls }) {
  const [loading, setLoading] = useState({})
  const [success, setSuccess] = useState({})

  const handleAction = async (action, data) => {
    setLoading({ ...loading, [action]: true })
    setSuccess({ ...success, [action]: false })

    try {
      let response
      switch (action) {
        case 'sheets':
          response = await api.saveToSheets({ room, polls })
          if (response.data.success) {
            if (response.data.downloadUrl) {
              // Download the file
              window.open(`http://localhost:3001${response.data.downloadUrl}`, '_blank')
            }
            alert(`✅ ${response.data.message}\n${response.data.filename ? `File: ${response.data.filename}` : ''}`)
          }
          break
        case 'calendar':
          response = await api.shareToCalendar({ room, polls })
          if (response.data.success) {
            if (response.data.calendarUrl) {
              // Open calendar
              window.open(response.data.calendarUrl, '_blank')
            }
            alert(`✅ ${response.data.message}`)
          }
          break
        case 'drive':
          response = await api.exportToDrive({ room, polls })
          if (response.data.success) {
            if (response.data.downloadUrl) {
              // Download the file
              window.open(`http://localhost:3001${response.data.downloadUrl}`, '_blank')
            }
            alert(`✅ ${response.data.message}\n${response.data.filename ? `File: ${response.data.filename}` : ''}\n${response.data.dataSize ? `Size: ${(response.data.dataSize / 1024).toFixed(2)} KB` : ''}`)
          }
          break
        case 'contacts':
          response = await api.getContacts()
          if (response.data.contacts && response.data.contacts.length > 0) {
            // Show contacts in a better format
            const contactsList = response.data.contacts.slice(0, 10).map(c => 
              `• ${c.name} (${c.email})${c.rooms?.length > 0 ? ` - ${c.rooms.length} room(s)` : ''}`
            ).join('\n')
            const more = response.data.contacts.length > 10 ? `\n... and ${response.data.contacts.length - 10} more` : ''
            alert(`📇 Found ${response.data.contacts.length} contact(s):\n\n${contactsList}${more}`)
          } else {
            alert('No contacts found in your rooms')
          }
          break
        default:
          return
      }

      setSuccess({ ...success, [action]: true })
      setTimeout(() => setSuccess({ ...success, [action]: false }), 3000)
    } catch (error) {
      console.error(`Failed ${action}:`, error)
      alert(`Failed to ${action}: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading({ ...loading, [action]: false })
    }
  }

  const integrations = [
    {
      id: 'sheets',
      name: 'Save to Google Sheets',
      icon: FileSpreadsheet,
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      action: () => handleAction('sheets')
    },
    {
      id: 'calendar',
      name: 'Share via Google Calendar',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      action: () => handleAction('calendar')
    },
    {
      id: 'drive',
      name: 'Export to Google Drive',
      icon: HardDrive,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      action: () => handleAction('drive')
    },
    {
      id: 'contacts',
      name: 'Import Google Contacts',
      icon: Users,
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      action: () => handleAction('contacts')
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Integrations</h3>
      <div className="space-y-2">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isLoading = loading[integration.id]
          const isSuccess = success[integration.id]

          return (
            <button
              key={integration.id}
              onClick={integration.action}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${integration.color} disabled:opacity-50`}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : isSuccess ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{integration.name}</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        Simulated Google integrations for demo
      </p>
    </div>
  )
}

