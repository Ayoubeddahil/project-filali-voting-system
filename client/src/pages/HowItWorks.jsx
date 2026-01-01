import Navbar from '../components/Navbar'

export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Create Your Account",
            description: "Sign in with your Google account. No passwords to remember, just secure, instant access."
        },
        {
            id: 2,
            title: "Set Up a Room",
            description: "Create a dedicated space for your group. Choose between public transparency or private security."
        },
        {
            id: 3,
            title: "Launch Polls",
            description: "Create questions on the fly. Support for multiple choice, ranking, and open-ended feedback."
        },
        {
            id: 4,
            title: "Share Code",
            description: "Participants join using a simple 6-digit code. No app download required for voters."
        },
        {
            id: 5,
            title: "Analyze & Act",
            description: "See votes in real-time. Export data to CSV/PDF for meetings and reports."
        }
    ]

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">How invote Works</h1>
                        <p className="text-xl text-gray-600">From question to decision in five simple steps.</p>
                    </div>

                    <div className="space-y-12">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex gap-6 md:gap-10 items-start">
                                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl md:text-2xl font-bold font-mono shadow-lg">
                                    {step.id}
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-8 bg-blue-50 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to try it out?</h3>
                        <button
                            onClick={() => window.location.href = '/create-room'}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Start Your First Poll
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
