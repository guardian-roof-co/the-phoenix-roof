import React from 'react';
import { Star, Quote, ExternalLink } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah J.",
        location: "Grand Rapids, MI",
        text: "Having a team that is so professional to handle something so important is wonderful. Bre is on top of everything and so amazing with communication and the whole team is so knowledgeable and thorough, making it all feel seamless!",
        rating: 5,
        date: "2 months ago"
    },
    {
        name: "Michael R.",
        location: "Rockford, MI",
        text: "Professional, knowledgeable and we felt well taken care of and supported throughout our entire roof replacement. Highly recommend Phoenix Roofing for their attention to detail.",
        rating: 5,
        date: "4 months ago"
    },
    {
        name: "David T.",
        location: "Grand Rapids, MI",
        text: "They said what they were going to do and did an Awesome Job! Honest estimates and reliable craftsmanship. Thanks Phoenix Roofing & Exterior!",
        rating: 5,
        date: "1 month ago"
    },
    {
        name: "Jennifer L.",
        location: "Kentwood, MI",
        text: "The communication was outstanding. From the initial inspection to the final cleanup, they kept us informed and treated our home with respect. Best roofing experience we've had.",
        rating: 5,
        date: "3 weeks ago"
    }
];

export const Testimonials: React.FC = () => {
    return (
        <section className="bg-slate-50 py-24 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-phoenix-50/50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-4">
                        <div className="h-1 w-12 bg-phoenix-500 rounded-full"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-4">
                        Client Testimonials
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        See why homeowners across West Michigan trust Phoenix Roofing & Exteriors with their most valuable asset.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-current" />
                            ))}
                        </div>
                        <span className="font-bold text-slate-900">5.0 Rating</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 text-sm">Based on 13+ Google Reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {testimonials.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative"
                        >
                            <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-50 group-hover:text-blue-50 transition-colors duration-500" />

                            <div className="relative">
                                <div className="flex text-amber-400 mb-4">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>

                                <p className="text-slate-700 leading-relaxed mb-8 italic font-medium">
                                    "{review.text}"
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 group-hover:bg-phoenix-50 group-hover:text-phoenix-600 transition-colors">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{review.name}</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{review.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
                                        {review.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <a
                        href="https://www.google.com/search?q=Phoenix+Roofing+and+Exteriors+LLC+Rockford+MI+reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group shadow-sm bg-blue-500"
                    >
                        Show more reviews on Google
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    );
};
