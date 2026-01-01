const OPENPHONE_API_KEY = process.env.QUO_API_KEY;

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

module.exports = {
    sendSMS
};
