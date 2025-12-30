import React from 'react';

const certifications = [
    {
        name: "BBB Accredited",
        image: "/certifications/bbb-accredited.png",
        description: "A+ Rated for Trust"
    },
    {
        name: "HAAG Certified",
        image: "/certifications/haag-certified.png",
        description: "Roofing Expert"
    },
    {
        name: "BEI Forensic",
        image: "/certifications/bei-forensic.png",
        description: "Damage Expert"
    },
    {
        name: "BEI Repairability",
        image: "/certifications/bei-repairability.png",
        description: "Assessment Expert"
    },
    {
        name: "CertainTeed Master",
        image: "/certifications/certainteed-master.png",
        description: "Master Craftsman"
    }
];

export const Certifications: React.FC = () => {
    return (
        <section className="bg-white py-16 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="h-1 w-12 bg-phoenix-500 rounded-full"></div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Certifications</h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
                    {certifications.map((cert, index) => (
                        <div key={index} className="group flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-1">
                            <div className="relative h-16 md:h-20 w-32 md:w-40 flex items-center justify-center transition-all">
                                <div className="w-full h-full flex flex-col items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={cert.image}
                                        alt={cert.name}
                                        className="max-w-full max-h-full object-contain filter drop-shadow hover:drop-shadow-lg transition-transform duration-300"
                                    />
                                    <span className="mt-4 text-[10px] font-black uppercase text-slate-400 text-center tracking-[0.2em] group-hover:text-slate-900 transition-colors">
                                        {cert.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Trusted by West Michigan Homeowners</p>
                </div>
            </div>
        </section>
    );
};
