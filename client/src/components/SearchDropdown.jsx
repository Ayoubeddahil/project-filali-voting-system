import React from 'react'
import { Link } from 'react-router-dom'
import { Users, BarChart3, Clock, ChevronRight, Search } from 'lucide-react'
import { api } from '../utils/api'

export default function SearchDropdown({ query, onSelect }) {
    const [results, setResults] = React.useState({ rooms: [], polls: [] })
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const search = async () => {
            if (!query || query.trim().length < 2) {
                setResults({ rooms: [], polls: [] })
                return
            }

            setLoading(true)
            try {
                const [roomsRes, pollsRes] = await Promise.all([
                    api.searchRooms(query),
                    api.searchPolls(query)
                ])
                setResults({
                    rooms: roomsRes.data.rooms || [],
                    polls: pollsRes.data.polls || []
                })
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(search, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    if (!query) return null

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {loading ? (
                <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    Searching...
                </div>
            ) : results.rooms.length === 0 && results.polls.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No results found for "{query}"</p>
                </div>
            ) : (
                <div className="py-2">
                    {results.rooms.length > 0 && (
                        <div className="px-2">
                            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-3 h-3" /> Rooms
                            </h3>
                            {results.rooms.map(room => (
                                <Link
                                    key={room.id}
                                    to={`/room/${room.id}`}
                                    onClick={onSelect}
                                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900 group-hover:text-black">{room.name}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-1">{room.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.rooms.length > 0 && results.polls.length > 0 && (
                        <div className="my-2 border-t border-gray-100"></div>
                    )}

                    {results.polls.length > 0 && (
                        <div className="px-2">
                            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" /> Polls
                            </h3>
                            {results.polls.map(poll => (
                                <Link
                                    key={poll.id}
                                    to={`/room/${poll.roomId}`}
                                    onClick={onSelect}
                                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900 line-clamp-1 group-hover:text-black">{poll.question}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                <span className={`px-1.5 py-0.5 rounded font-medium ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {poll.status}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {poll.totalVotes || 0} votes
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


