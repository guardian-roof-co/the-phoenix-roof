const OPENPHONE_API_KEY = process.env.QUO_API_KEY;
const FROM_NUMBER = process.env.QUO_FROM_NUMBER;

/**
 * Get SMS template based on lead source
 * @param {string} firstName 
 * @param {string} leadSource 
 * @param {number} [estimatedCost]
 */
const getSMSTemplate = (firstName, leadSource, estimatedCost) => {
    const source = (leadSource || 'Website').toLowerCase();

    // SMS should be concise (keep under 160 chars for best delivery)
    if (source.includes('insurance') || source.includes('analyzer')) {
        return `Hi ${firstName}! Our team is scanning your policy now. Think of us as your project guide—we're here to help navigate any coverage gaps. Feel free to text us photos or questions here!`;
    } else if (source.includes('quote')) {
        const costStr = estimatedCost ? ` is $${estimatedCost.toLocaleString()}` : "";
        return `Hi ${firstName}! Your Phoenix Roof estimate${costStr}. We'll be in touch soon. Feel free to text us photos or questions here! Thanks for choosing Phoenix!`;
    } else if (source.includes('storm')) {
        return `Hi ${firstName}, thanks for checking your property's storm history. A Phoenix Roof expert will call you shortly. Feel free to text us any photos or questions here!`;
    }

    return `Hi ${firstName}, welcome to the Phoenix Roof family! We've received your request and will be in touch shortly. Feel free to text us photos or questions here!`;
};

/**
 * Send an SMS via OpenPhone/Quo API
 * @param {string} to - Recipient number (customer)
 * @param {string} from - Your OpenPhone number
 * @param {string} content - Message text
 */
const sendSMS = async (to, from, content) => {
    if (!OPENPHONE_API_KEY) {
        console.warn('[Quo Service] Missing QUO_API_KEY, cannot send SMS.');
        return false;
    }

    try {
        const response = await fetch('https://api.openphone.com/v1/messages', {
            method: 'POST',
            headers: {
                'Authorization': OPENPHONE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                from: from,
                to: [to]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[Quo Service] SMS sent to ${to}: ${content}`);
            return true;
        } else {
            console.error('[Quo Service] Failed to send SMS:', data);
            return false;
        }
    } catch (error) {
        console.error('[Quo Service] Error sending SMS:', error);
        return false;
    }
};

/**
 * High-level function to send a themed thank you SMS
 * @param {Object} contact 
 * @param {string} contact.phone
 * @param {string} contact.firstName
 * @param {string} contact.leadSource
 * @param {number} [contact.estimatedCost]
 */
const sendThankYouSMS = async (contact) => {
    const content = getSMSTemplate(contact.firstName, contact.leadSource, contact.estimatedCost);
    let to = contact.phone || '';

    // E.164 Normalization (OpenPhone requires +[country][number])
    // 1. Strip all non-numeric characters
    let cleanPhone = to.replace(/\D/g, '');

    // 2. Handle US/Canada logic
    if (cleanPhone.length === 10) {
        // Standard US: 9492649628 -> +19492649628
        to = `+1${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        // Already includes 1: 19492649628 -> +19492649628
        to = `+${cleanPhone}`;
    } else if (cleanPhone.length > 0) {
        // International or already formatted? Ensure it starts with +
        to = to.startsWith('+') ? to : `+${cleanPhone}`;
    }

    if (!OPENPHONE_API_KEY || !FROM_NUMBER) {
        console.warn('[Quo Service] Missing Credentials. Logging simulated SMS.');
        console.log(`--- SIMULATED SMS ---`);
        console.log(`To: ${to}`);
        console.log(`From: ${FROM_NUMBER || 'Phoenix Roof (Mock)'}`);
        console.log(`Content: ${content}`);
        console.log(`---------------------`);
        return true;
    }

    return await sendSMS(to, FROM_NUMBER, content);
};

module.exports = {
    sendSMS,
    sendThankYouSMS
};
