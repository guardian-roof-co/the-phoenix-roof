
import { User } from '../types';

const GATEWAY_URL = 'https://guardian-api-gateway-1ir2baa.uc.gateway.dev/property';
const LOCAL_API_URL = 'http://localhost:3001/api/leads';

const DB_USER = 'postgres';
const DB_PASS = 'postgres123';

// Fallback Mock Data to ensure CRM is usable even if API connections fail (CORS/Network)
const MOCK_DB_DATA = [
    { id: 'import-m1', owner_name: "James Wilson", address: "4521 Oak St, Grand Rapids, MI", email: "james.w@example.com", phone: "616-555-0199", latitude: 42.9634, longitude: -85.6681 },
    { id: 'import-m2', owner_name: "Linda Martinez", address: "889 Pine Ave, Ada, MI", email: "linda.m@example.com", phone: "616-555-0200", latitude: 42.9600, longitude: -85.4900 },
    { id: 'import-m3', owner_name: "Robert Ford", address: "1200 Lake Dr, Holland, MI", email: "bob.ford@example.com", phone: "616-555-0355", latitude: 42.7875, longitude: -86.1089 },
    { id: 'import-m4', owner_name: "Sarah Chen", address: "3342 Maple Rd, Kentwood, MI", email: "sarah.c@example.com", phone: "616-555-9988", latitude: 42.8694, longitude: -85.6447 },
    { id: 'import-m5', owner_name: "Mike Ross", address: "5500 Division Ave, Wyoming, MI", email: "mike.r@example.com", phone: "616-555-1122", latitude: 42.8827, longitude: -85.6906 },
];

// Helper to generate a deterministic pseudo-random coordinate
const getRandomLocation = (seedInput: any) => {
    const baseLat = 42.9634; // Grand Rapids
    const baseLng = -85.6681;
    const seed = String(seedInput).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randLat = ((seed * 9301 + 49297) % 233280) / 233280;
    const randLng = ((seed * 49297 + 9301) % 233280) / 233280;
    
    return {
        lat: baseLat + (randLat - 0.5) * 0.15,
        lng: baseLng + (randLng - 0.5) * 0.15
    };
};

const mapRecordToUser = (record: any, index: number): User => ({
    id: String(record.id || `import-${index}-${Date.now()}`),
    name: record.owner_name || record.OwnerName || record.name || `Homeowner ${record.id || index}`,
    email: record.email || record.Email || `lead-${record.id || index}@guardian-import.com`,
    role: 'homeowner',
    referralCode: 'PENDING',
    referralCount: 0,
    rewardsEarned: 0,
    crmStage: 'New', 
    phone: record.phone || record.Phone || '',
    address: record.address || record.formatted_address || record.PropertyAddress || 'Address Pending',
    lastContact: 'Imported via API',
    location: (record.latitude && record.longitude) 
        ? { lat: Number(record.latitude), lng: Number(record.longitude) }
        : (record.lat && record.lng)
            ? { lat: Number(record.lat), lng: Number(record.lat) }
            : getRandomLocation(record.id || index)
});

export const fetchGuardianLeads = async (): Promise<User[]> => {
    let rawRecords: any[] = [];

    // --- ATTEMPT 1: Gateway URL ---
    try {
        console.log(`[Guardian API] Connecting to Gateway...`);
        const credentials = btoa(`${DB_USER}:${DB_PASS}`);
        const response = await fetch(GATEWAY_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            rawRecords = Array.isArray(data) ? data : (data.results || data.data || []);
            console.log(`[Guardian API] Gateway Success: ${rawRecords.length} records.`);
        } else {
            // Silently fail to try next method
        }

    } catch (gatewayError) {
        // --- ATTEMPT 2: Local Node Server ---
        try {
            const response = await fetch(LOCAL_API_URL, { method: 'GET' });
            if (response.ok) {
                rawRecords = await response.json();
                console.log(`[Guardian API] Local Server Success: ${rawRecords.length} records.`);
            } 
        } catch (localError) {
             console.warn("[Guardian API] Connection failed. Using Fallback Mock Data.");
             // --- ATTEMPT 3: Mock Data Fallback ---
             rawRecords = MOCK_DB_DATA;
        }
    }

    // Process whatever records we got (Gateway, Local, or Mock)
    try {
        if (!rawRecords || rawRecords.length === 0) {
             rawRecords = MOCK_DB_DATA; // Force mock if everything else returned empty array
        }
        
        const mappedUsers = rawRecords.map((r, i) => mapRecordToUser(r, i));
        return mappedUsers;
    } catch (mapError) {
        console.error("[Guardian API] Mapping Error:", mapError);
        return [];
    }
};
