import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { Send, MessageSquare, Hash } from 'lucide-react'

export default function ChatPanel({ roomId, pollId = null }) {
    const { user } = useAuth()
    const socket = useSocket()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (!socket) return

        const handleReceiveMessage = (message) => {
            // Filter messages for this specific context (General vs Specific Poll)
            // If pollId is passed prop, only show messages for that pollId
            // If no pollId (General), only show messages with no pollId
            if (message.pollId === pollId) {
                setMessages((prev) => [...prev, message])
            }
        }

        socket.on('receive_message', handleReceiveMessage)

        return () => {
            socket.off('receive_message', handleReceiveMessage)
        }
    }, [socket, pollId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !socket) return

        const messageData = {
            roomId,
            pollId, // Can be null
            text: newMessage,
            user: {
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }

        socket.emit('send_message', messageData)
        setNewMessage('')
    }

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2 rounded-t-lg">
                {pollId ? (
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                ) : (
                    <Hash className="w-5 h-5 text-gray-600" />
                )}
                <span className="font-semibold text-gray-700">
                    {pollId ? 'Poll Discussion' : 'General Chat'}
                </span>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No messages yet.</p>
                        <p className="text-xs">Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user.email === user.email
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    {!isMe && (
                                        <p className="text-xs font-bold mb-1 opacity-70">{msg.user.name}</p>
                                    )}
                                    <p className="text-sm break-words">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={pollId ? "Discuss this poll..." : "Message the room..."}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
