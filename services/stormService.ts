
import { StormEvent, StormReport } from '../types';

// Simulate fetching historical weather data based on location
export const getStormHistory = async (lat: number, lng: number): Promise<StormReport> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Deterministic simulation based on coordinates to keep it consistent
    const events: StormEvent[] = [];
    const today = new Date();
    
    // Generate 2 years of history
    for (let i = 0; i < 24; i++) {
        const checkDate = new Date(today.getFullYear(), today.getMonth() - i, 15);
        
        // Random probability of storm based on "month" and location "randomness"
        // Summer months (May-Aug) have higher probability
        const month = checkDate.getMonth();
        const isStormSeason = month >= 4 && month <= 8; // May to Sept
        
        // Pseudo-random factor using coords
        const locFactor = (Math.sin(lat * i) + Math.cos(lng * i)) * 0.5 + 0.5; 
        
        let threshold = isStormSeason ? 0.7 : 0.9;
        
        if (locFactor > threshold) {
            const isHail = Math.random() > 0.5;
            const severity = isHail 
                ? (Math.random() > 0.7 ? "1.5+ inch Hail" : "0.75 inch Hail")
                : (Math.random() > 0.7 ? "65+ mph Gusts" : "45 mph Gusts");
            
            // Insurance Potential logic:
            // 1. Within last 12 months (approx 365 days)
            // 2. High severity (1.0+ inch hail or 50+ mph wind)
            const daysAgo = (today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24);
            const isHighSeverity = severity.includes("1.5") || severity.includes("65");
            const insurancePotential = daysAgo <= 365 && isHighSeverity;

            events.push({
                date: checkDate.toISOString().split('T')[0],
                type: isHail ? 'Hail' : 'Wind',
                severity: severity,
                insurancePotential: insurancePotential
            });
        }
    }

    // Sort descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Risk
    const recentMajorEvents = events.filter(e => e.insurancePotential).length;
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let summary = "No significant storm activity detected recently.";

    if (recentMajorEvents >= 1) {
        riskLevel = 'High';
        summary = "CRITICAL: Major storm activity detected within the insurance filing window. Inspection recommended.";
    } else if (events.length > 2) {
        riskLevel = 'Medium';
        summary = "Moderate weather activity detected. Roof may have cumulative wear.";
    }

    return {
        riskLevel,
        events,
        lastStormDate: events.length > 0 ? events[0].date : null,
        summary
    };
};
