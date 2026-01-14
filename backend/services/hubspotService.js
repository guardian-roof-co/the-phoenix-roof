const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || process.env.VITE_HUBSPOT_PORTAL_ID;
const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID || process.env.VITE_HUBSPOT_FORM_ID;
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

/**
 * Legacy Form Submission API (used by existing website forms)
 */
const syncToHubSpot = async (leadData) => {
    if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_ID) {
        console.warn('[HubSpot] Missing credentials, skipping CRM sync.');
        return false;
    }

    try {
        const fields = [
            { name: 'email', value: leadData.email || 'pending@user.quote' },
            { name: 'firstname', value: leadData.firstName || '' },
            { name: 'lastname', value: leadData.lastName || '' },
            { name: 'mobilephone', value: leadData.phone || '' },
            { name: 'zip', value: leadData.zip || '' },
            { name: 'lead_source', value: leadData.leadSource || 'Website' },
            { name: 'address', value: leadData.address || '' },
            { name: 'preferred_date', value: leadData.date || '' },
            { name: 'time_window', value: leadData.time || '' },
            { name: 'project_notes', value: leadData.notes || '' },
            { name: 'utm_source', value: leadData.utmSource || '' },
            { name: 'utm_medium', value: leadData.utmMedium || '' },
            { name: 'utm_campaign', value: leadData.utmCampaign || '' },
            { name: 'utm_term', value: leadData.utmTerm || '' },
            { name: 'utm_content', value: leadData.utmContent || '' },
            { name: 'insurance_policy_url', value: leadData.policyDocumentUrl || '' },
            { name: 'ai_analysis', value: leadData.aiAnalysis || '' },
        ];

        const payload = {
            submittedAt: Date.now(),
            fields,
            context: {
                pageUri: leadData.pageUri || leadData.referer || 'https://roofbyphoenix.com/form-submission',
                pageName: leadData.pageName || 'Website Interaction',
                ipAddress: leadData.ipAddress,
                hutk: leadData.hutk
            }
        };

        const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('[HubSpot Form Error]', err);
        } else {
            console.log(`[HubSpot] Form Sync successful for: ${leadData.email}`);
        }
        return response.ok;
    } catch (error) {
        console.error('[HubSpot Form Failure]', error);
        return false;
    }
};

/**
 * CRM API: Find or Create Contact by Phone Number
 */
const findOrCreateContactByPhone = async (phone) => {
    if (!HUBSPOT_ACCESS_TOKEN) {
        console.warn('[HubSpot CRM] Missing Access Token, skipping CRM operation.');
        return null;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    try {
        // 1. Search for existing contact
        const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filterGroups: [{
                    filters: [
                        { propertyName: 'phone', operator: 'EQ', value: cleanPhone },
                        { propertyName: 'mobilephone', operator: 'EQ', value: cleanPhone }
                    ]
                }],
                limit: 1
            })
        });

        const searchData = await searchRes.json();
        if (searchData.results && searchData.results.length > 0) {
            console.log(`[HubSpot CRM] Found contact: ${searchData.results[0].id}`);
            return searchData.results[0].id;
        }

        // 2. Create if not found via CRM API
        const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    phone: cleanPhone,
                    firstname: 'Quo',
                    lastname: 'Lead'
                }
            })
        });

        const createData = await createRes.json();
        console.log(`[HubSpot CRM] Created contact: ${createData.id}`);
        return createData.id;
    } catch (error) {
        console.error('[HubSpot CRM Search/Create Failure]', error);
        return null;
    }
};

/**
 * CRM API: Log Communication (SMS/Message)
 */
const logCommunication = async (contactId, message, type = 'SMS') => {
    if (!HUBSPOT_ACCESS_TOKEN) return false;

    try {
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/communications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    hs_communication_channel_type: type,
                    hs_communication_logged_from: 'Quo CRM',
                    hs_communication_body: message,
                    hs_timestamp: Date.now()
                },
                associations: [
                    {
                        to: { id: contactId },
                        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 81 }] // Communication to Contact
                    }
                ]
            })
        });

        return response.ok;
    } catch (error) {
        console.error('[HubSpot CRM Communication Log Failure]', error);
        return false;
    }
};

/**
 * CRM API: Log Call Activity (Missed Call)
 */
const logCall = async (contactId, notes, disposition = 'No answer') => {
    if (!HUBSPOT_ACCESS_TOKEN) return false;

    try {
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/calls', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    hs_call_title: 'Missed Call (Quo)',
                    hs_call_body: notes,
                    hs_call_disposition: disposition,
                    hs_timestamp: Date.now()
                },
                associations: [
                    {
                        to: { id: contactId },
                        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 194 }] // Call to Contact
                    }
                ]
            })
        });

        return response.ok;
    } catch (error) {
        console.error('[HubSpot CRM Call Log Failure]', error);
        return false;
    }
};

module.exports = {
    syncToHubSpot,
    findOrCreateContactByPhone,
    logCommunication,
    logCall
};
