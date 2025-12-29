import { Users, Crown, User } from 'lucide-react'

export default function RoomMembers({ room }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Members ({room.members?.length || 0})
      </h3>
      <div className="space-y-2">
        {room.members?.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              {member.role === 'admin' || room.creator === member.email ? (
                <Crown className="w-4 h-4 text-yellow-500" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-900">{member.email}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {member.role === 'admin' || room.creator === member.email ? 'Admin' : 'Member'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

