import Navbar from '../components/Navbar'
import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
    const testimonials = [
        {
            text: "VoteHub completely transformed our sprint retrospectives. The anonymity features helps us get honest feedback that we never got before.",
            author: "Sarah Jenkins",
            role: "Product Manager at TechFlow",
            initial: "S"
        },
        {
            text: "Finally, a voting tool that doesn't require my students to create accounts. The room code system is brilliant and saves so much classroom time.",
            author: "Prof. David Chen",
            role: "Computer Science Dept.",
            initial: "D"
        },
        {
            text: "We used VoteHub for our HOA board election. Secure, transparent, and incredibly easy to set up. The export feature was a lifesaver.",
            author: "Michael Ross",
            role: "Community Board Director",
            initial: "M"
        },
        {
            text: "Simple, fast, and beautiful. It's the only polling app our design team actually enjoys using.",
            author: "Jessica Wu",
            role: "Creative Director",
            initial: "J"
        },
        {
            text: "The real-time analytics are impressive. Watching the charts update as votes come in adds a layer of excitement to our town halls.",
            author: "Robert Fox",
            role: "HR Director",
            initial: "R"
        },
        {
            text: "Customer support is top-notch, though we rarely need it because the interface is so intuitive.",
            author: "Emily Watson",
            role: "Event Coordinator",
            initial: "E"
        }
    ]

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Teams Everywhere</h1>
                        <p className="text-xl text-gray-600">See what our community has to say about VoteHub.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100" />
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-8 italic leading-relaxed relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-4 border-t pt-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                        {t.initial}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{t.author}</p>
                                        <p className="text-sm text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
