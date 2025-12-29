import Navbar from '../components/Navbar'
import { Shield, Users, BarChart3, Cloud, Lock, Zap } from 'lucide-react'

export default function Features() {
    const features = [
        {
            icon: Shield,
            title: "Enterprise-Grade Security",
            description: "Secure Google OAuth authentication and encrypted data transmission ensure your votes are safe and verifiable."
        },
        {
            icon: Users,
            title: "Unlimited Participants",
            description: "Host rooms with hundreds of active voters. Perfect for classrooms, conferences, and large communities."
        },
        {
            icon: BarChart3,
            title: "Real-Time Analytics",
            description: "Watch results stream in live. Visualize data with interactive bar charts, pie charts, and participation heatmaps."
        },
        {
            icon: Cloud,
            title: "Cloud Sync",
            description: "Access your polls and results from any device. Your data is automatically synchronized across the platform."
        },
        {
            icon: Lock,
            title: "Private Rooms",
            description: "Create invite-only rooms for sensitive voting. Manage member access with granular permissions."
        },
        {
            icon: Zap,
            title: "Instant Setup",
            description: "No complex configuration. Create a room, share the code, and start voting in seconds."
        }
    ]

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Teams</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to make better decisions together, faster.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon
                            return (
                                <div key={idx} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
