import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import Navbar from '../components/Navbar'
import SearchDropdown from '../components/SearchDropdown'
import {
  Search,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Star,
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [allPolls, setAllPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all') // 'all', 'rooms', 'polls'
  const [filter, setFilter] = useState('all') // 'all', 'active', 'popular', 'recent'
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      } else {
        loadData()
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchType, filter])

  const loadData = async () => {
    try {
      if (user?.email) {
        // Use the new consolidated search endpoints (empty query = all visible)
        const [roomsRes, pollsRes] = await Promise.all([
          api.searchRooms(''),
          api.searchPolls('')
        ])

        const allRooms = roomsRes.data.rooms || []
        const allPollsData = pollsRes.data.polls || []

        setRooms(allRooms)
        setAllPolls(allPollsData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    // Do not set global loading here to avoid unmounting the input
    try {
      const promises = []

      if (searchType === 'all' || searchType === 'rooms') {
        promises.push(api.searchRooms(searchQuery))
      }
      if (searchType === 'all' || searchType === 'polls') {
        promises.push(api.searchPolls(searchQuery))
      }

      const results = await Promise.all(promises)

      if (searchType === 'all') {
        const roomsRes = results[0]?.data?.rooms || []
        const pollsRes = results[1]?.data?.polls || []
        setRooms(roomsRes)
        setAllPolls(pollsRes)
      } else if (searchType === 'rooms') {
        setRooms(results[0]?.data?.rooms || [])
      } else if (searchType === 'polls') {
        setAllPolls(results[0]?.data?.polls || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  // Filter logic (applied after search)
  const filteredRooms = rooms.filter(room => {
    const matchesType = searchType === 'all' || searchType === 'rooms'

    let matchesFilter = true
    if (filter === 'active') matchesFilter = room.status === 'active'
    if (filter === 'popular') matchesFilter = true // We'll sort by members instead
    if (filter === 'recent') {
      const daysSince = (Date.now() - new Date(room.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      matchesFilter = daysSince < 30 // Increased from 7 to match demo data
    }

    return matchesType && matchesFilter
  })

  const filteredPolls = allPolls.filter(poll => {
    const matchesType = searchType === 'all' || searchType === 'polls'

    let matchesFilter = true
    if (filter === 'active') matchesFilter = poll.status === 'active'
    if (filter === 'popular') matchesFilter = true // We'll sort by totalVotes
    if (filter === 'recent') {
      const daysSince = (Date.now() - new Date(poll.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      matchesFilter = daysSince < 30 // Increased from 7 to match demo data
    }

    return matchesType && matchesFilter
  })

  // Sort logic based on filter
  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (filter === 'popular') return (b.totalVotes || 0) - (a.totalVotes || 0)
    if (filter === 'recent') return new Date(b.createdAt) - new Date(a.createdAt)
    return 0
  })

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (filter === 'popular') return (b.members?.length || 0) - (a.members?.length || 0)
    if (filter === 'recent') return new Date(b.createdAt) - new Date(a.createdAt)
    return 0
  })

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Generative Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 text-center tracking-tight text-balance">
              Find polls & communities
            </h1>
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gray-600 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchDropdown(true)
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search for anything..."
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm bg-gray-50 focus:bg-white"
                />
                {showSearchDropdown && (
                  <SearchDropdown
                    query={searchQuery}
                    onSelect={() => setShowSearchDropdown(false)}
                  />
                )}
              </div>
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilter('popular')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'popular' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'recent' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  New
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'active' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  Live Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Polls Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-gray-900" />
              Trending Polls
            </h2>

            {sortedPolls.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No polls found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPolls.slice(0, 9).map((poll) => {
                  const room = rooms.find(r => r.id === poll.roomId)
                  return (
                    <Link
                      key={poll.id}
                      to={`/room/${poll.roomId}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {poll.status === 'active' ? 'Active' : 'Ended'}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(poll.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-black transition-colors">
                          {poll.question}
                        </h3>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{poll.totalVotes || 0} votes</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 truncate max-w-[150px]">
                          {room?.name || 'Unknown Room'}
                        </span>
                        {room?.creator !== user?.email && !room?.members?.find(m => m.email === user?.email) && (
                          <span className="text-xs font-bold text-gray-900">Join to Vote</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Public Rooms Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-gray-900" />
                Popular Communities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRooms.slice(0, 6).map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="w-24 h-24" />
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-900 font-bold text-xl">
                      {room.name.charAt(0)}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                      {room.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                      {room.description || 'Join this community to participate in polls and discussions.'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Users className="w-4 h-4" />
                        {room.members?.length || 0} Members
                      </span>
                      <span className="text-gray-900 font-semibold text-sm group-hover:underline">
                        View Room
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

