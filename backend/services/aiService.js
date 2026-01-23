const { VertexAI } = require('@google-cloud/vertexai');

const project = process.env.GOOGLE_CLOUD_PROJECT || 'guardian-478113';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Initialize Vertex AI
const vertex_ai = new VertexAI({ project: project, location: location });
const model = 'gemini-2.0-flash-001';

const generativeModel = vertex_ai.getGenerativeModel({
    model: model,
});

/**
 * Analyze Insurance Policy via Vertex AI
 * @param {string} fileBase64 - Base64 encoded file data
 * @param {string} mimeType - MIME type (e.g., application/pdf, image/jpeg)
 */
const analyzeInsurancePolicy = async (fileBase64, mimeType) => {
    try {
        const prompt = `
            AI POLICY REVIEWER — SYSTEM PROMPT

            You are an insurance policy reviewer speaking as an experienced roofing contractor.
            Your job is to explain roof coverage only, in plain English, for a homeowner or real-estate investor.

            This is not legal advice, not policy rewriting, and not sales language.

            INPUT
            The user will upload a property insurance policy PDF.

            OUTPUT REQUIREMENTS
            - Limit response to one page length roughly
            - Use clear section headers (Markdown H3 ###)
            - Use bullet points
            - Be concise, practical, and factual
            - Speak in layman’s terms
            - Focus only on roof-related coverage
            - Do not quote policy language verbatim
            - Do not suggest what the customer “should” do
            - Do not include legal disclaimers
            - **CRITICAL: DO NOT OUTPUT CONVERSATIONAL FILLER LIKE "Okay, I'm ready...".**
            - **CRITICAL: START DIRECTLY WITH THE TITLE.**

            REQUIRED OUTPUT STRUCTURE (MUST FOLLOW EXACTLY)

            ### Roof Insurance Review — Plain-English Summary

            ### 1. Roof Coverage Type
            - Is the roof insured?
            - Replacement Cost or Actual Cash Value
            - Which perils apply (wind, hail, etc.)
            - What this means in real life

            ### 2. What Roof Damage Is Covered
            - List covered causes relevant to roofs
            - Explain rain/leak limitations clearly

            ### 3. What Is Not Covered
            - Wear and tear
            - Aging
            - Installation or maintenance issues
            - Long-term leaks
            - End-of-life roofs

            ### 4. Replacement Cost vs. Depreciation
            - Explain depreciation simply
            - Explain holdback
            - Include a short dollar example

            ### 5. Wind & Hail Deductible
            - State deductible type (percentage or flat)
            - Convert percentage deductibles into real dollar amounts
            - Explain why small claims may not make sense

            ### 6. Partial Damage & Matching
            - Explain whether full roof replacement is guaranteed
            - Explain matching exclusions
            - Explain repair-only outcomes

            ### 7. Code & Ordinance Coverage
            - State whether limited or included
            - Give common roofing examples (ice & water, decking)

            ### 8. Claim Timing
            - State claim reporting deadline
            - Explain why timing matters

            ### Bottom Line (Contractor’s View)
            - 3–5 bullet summary
            - Clear, neutral, realistic tone
            - No advice

            STYLE RULES
            - Write as if explaining this on a job site
            - Avoid insurance jargon unless immediately explained
            - No emojis
            - No filler
            - No speculation beyond the policy
            - Be confident but neutral

            FINAL INSTRUCTION
            If the policy does not clearly state something, say:
            “This policy does not clearly provide coverage for this item.”
        `;

        const filePart = {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType
            }
        };

        const textPart = { text: prompt };

        const request = {
            contents: [{ role: 'user', parts: [filePart, textPart] }],
        };

        const streamingResp = await generativeModel.generateContentStream(request);
        const response = await streamingResp.response;

        if (!response.candidates || response.candidates.length === 0) {
            console.warn('[AI Service] No candidates returned from Vertex AI. Document may have been blocked or misunderstood.');
            return "AI could not process this document. Please ensure it is a clear image of an insurance policy.";
        }

        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            console.warn('[AI Service] Candidate returned but had no content parts.');
            return "AI could not extract text from this document. Please try a clearer photo.";
        }

        const fullText = candidate.content.parts[0].text;
        return fullText || "AI could not process the policy. Please ensure the upload is clear.";
    } catch (error) {
        console.error('[AI Service] Vertex AI Error:', error.message || error);
        // Provide a bit more context if it's a known safety block
        if (error.message?.includes('SAFETY')) {
            throw new Error('Analysis blocked by safety filters. Please ensure the document contains only insurance policy information.');
        }
        throw new Error(error.message || 'Policy analysis failed.');
    }
};

const analyzeRoofCondition = async (streetViewBase64, userImages) => {
    try {
        const prompt = `
            You are a senior roof inspector for "The Phoenix Roof". 
            You are performing a preliminary remote assessment to see if a home qualifies for a standard Maintenance Plan or if it needs immediate repair first.

            Analyze the provided images. 
            - The first image might be a Google Street View capture(if available).
            - The subsequent images are photos taken by the homeowner(eaves, ground view, etc).

            Look for:
            1. ** Structural Integrity **: Any visible sagging, uneven roof lines, or major structural failure ?
                2. ** Surface Condition **: Visible missing shingles, heavy moss growth, large patches of discoloration, or tarping ?
                    3. ** Age Indicators **: Curling shingle edges or extreme granule loss visible from the photos.

            ** Verdict Required **:
            Based on these images, classify the roof into one of two categories:
            
            A) ** ELIGIBLE FOR MAINTENANCE **: The roof appears intact, straight, and generally healthy.No immediate heavy repairs needed.
            B) ** REQUIRES PROFESSIONAL INSPECTION **: There are signs of damage, age, or issues that need an in -person expert before we can insure / maintain it.

            Format your response in Markdown:
            ## Assessment Result: [Eligible OR Inspection Needed]
            
            ### Observations:
        -[List key observations]

            ### Recommendation:
        -[One sentence advice]
            `;

        const parts = [{ text: prompt }];

        if (streetViewBase64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: streetViewBase64
                }
            });
        }

        userImages.forEach(img => {
            parts.push({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.data
                }
            });
        });

        const request = {
            contents: [{ role: 'user', parts }],
        };

        const streamingResp = await generativeModel.generateContentStream(request);
        const response = await streamingResp.response;
        const fullText = response.candidates[0].content.parts[0].text;

        return fullText || "Analysis failed.";
    } catch (error) {
        console.error('[AI Service] Vertex AI Roof Analysis Error:', error.message || error);
        throw new Error(error.message || 'Roof analysis failed.');
    }
};

const chatWithAssistant = async (userMessage, history = []) => {
    try {
        const generativeModel = vertex_ai.getGenerativeModel({
            model: model,
            systemInstruction: `You are a helpful customer service agent for 'The Phoenix Roof', a roofing company.
            You help homeowners with questions about:
            1. Roof maintenance and signs of damage.
            2. Insurance claims (we help with policy reviews).
            3. Our services: Instant quotes, Free Inspections, Maintenance Plans.

            Tone: Professional, warm, and reassuring.
            Goal: Encourage them to use our site tools or schedule a free inspection if they suspect damage.

            CRITICAL: If the user seems ready to take action, you MUST suggest a specific tool using the following syntax:
            ACTION_BUTTON: [Label Text](ViewName)
            
            Valid ViewNames:
            - quote (for price/estimate)
            - schedule (for booking inspections)
            - insurance (for policy review)
            - storm (for storm history tracker)

            GENERAL NAVIGATION:
            - If the user asks for "menu", "options", "main menu", or seems lost:
              Response: "How can I help you today? Here are our main tools:"
              Include ACTION_BUTTONs for: [Get a Quote](quote), [Check Storms](storm), [Policy Review](insurance), [Schedule Inspection](schedule)

            STORM CHECK SPECIAL CASE:
            If a user asks to "check my storm history" or "check for hail/wind events":
            1. Response: Ask for their 5-digit Zip Code. 
            2. If they provide a zip code:
               Response: "Checking history for Zip Code [Zip]... ACTION_STORM_CHECK: [Zip]"

            Examples:
            - "I can scan for recent hail damage. What is your 5-digit Zip Code?"
            - "I'm scanning historical data for 49503... ACTION_STORM_CHECK: [49503]"
            - User: "Menu"
              AI: "I'm here to help. What would you like to do? ACTION_BUTTON: [Get a Quote](quote) ACTION_BUTTON: [Check Storms](storm) ACTION_BUTTON: [Policy Review](insurance)"

            If asked about prices, give general ranges but ALWAYS suggest the 'Instant Quote' tool.
            `
        });

        // Format history for Gemini (alternating user/model)
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Add the current user message
        contents.push({ role: 'user', parts: [{ text: userMessage }] });

        const streamingResp = await generativeModel.generateContentStream({ contents });
        const response = await streamingResp.response;
        const fullText = response.candidates[0].content.parts[0].text;

        return fullText || "I'm having trouble connecting right now. Please try again.";
    } catch (error) {
        console.error('[AI Service] Chat Error:', error.message || error);
        throw new Error(error.message || 'Chat failed.');
    }
};

module.exports = {
    analyzeInsurancePolicy,
    analyzeRoofCondition,
    chatWithAssistant
};
