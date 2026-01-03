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
            Extract the following specific data points from the attached insurance policy document. 
            Keep the report concise and factual. Do not provide legal interpretations or long explanations.
            
            1. **Roof Coverage Type**: State clearly if it is RCV (Replacement Cost) or ACV (Actual Cash Value).
            2. **Deductible**: Identify the specific Wind/Hail deductible amount (Percentage or Dollar amount).
            3. **Endorsements**: List any roof-specific endorsements found (e.g. Ordinance or Law, Code Upgrade).
            4. **Exclusions**: Mention if cosmetic damage waivers are present.
            
            Use simple Markdown headings. If a value is not found, stated "Not Found".
            End with a 1-sentence recommendation for a professional inspection to verify these details.
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
        const fullText = response.candidates[0].content.parts[0].text;

        return fullText || "AI could not process the policy. Please ensure the upload is clear.";
    } catch (error) {
        console.error('[AI Service] Vertex AI Error:', error);
        throw new Error('Policy analysis failed. Please try again later.');
    }
};

const analyzeRoofCondition = async (streetViewBase64, userImages) => {
    try {
        const prompt = `
            You are a senior roof inspector for "The Phoenix Roof". 
            You are performing a preliminary remote assessment to see if a home qualifies for a standard Maintenance Plan or if it needs immediate repair first.

            Analyze the provided images. 
            - The first image might be a Google Street View capture (if available).
            - The subsequent images are photos taken by the homeowner (eaves, ground view, etc).

            Look for:
            1. **Structural Integrity**: Any visible sagging, uneven roof lines, or major structural failure?
            2. **Surface Condition**: Visible missing shingles, heavy moss growth, large patches of discoloration, or tarping?
            3. **Age Indicators**: Curling shingle edges or extreme granule loss visible from the photos.

            **Verdict Required**:
            Based on these images, classify the roof into one of two categories:
            
            A) **ELIGIBLE FOR MAINTENANCE**: The roof appears intact, straight, and generally healthy. No immediate heavy repairs needed.
            B) **REQUIRES PROFESSIONAL INSPECTION**: There are signs of damage, age, or issues that need an in-person expert before we can insure/maintain it.

            Format your response in Markdown:
            ## Assessment Result: [Eligible OR Inspection Needed]
            
            ### Observations:
            - [List key observations]

            ### Recommendation:
            - [One sentence advice]
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
        console.error('[AI Service] Vertex AI Roof Analysis Error:', error);
        throw new Error('Roof analysis failed.');
    }
};

const chatWithAssistant = async (userMessage) => {
    try {
        const generativeModel = vertex_ai.getGenerativeModel({
            model: model,
            systemInstruction: `You are a helpful customer service agent for 'The Phoenix Roof', a roofing company.
            You help homeowners with questions about:
            1. Roof maintenance and signs of damage.
            2. Insurance claims (we help with policy reviews).
            3. Our services: Instant quotes, Free Inspections, Maintenance Plans.
            
            Tone: Professional, warm, and reassuring.
            Goal: encourage them to schedule a free inspection if they suspect damage.
            
            If asked about prices, give general ranges but emphasize using the 'Instant Quote' tool on the website for specific numbers.
            `
        });

        const request = {
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        };

        const streamingResp = await generativeModel.generateContentStream(request);
        const response = await streamingResp.response;
        const fullText = response.candidates[0].content.parts[0].text;

        return fullText || "I'm having trouble connecting right now. Please try again.";
    } catch (error) {
        console.error('[AI Service] Chat Error:', error);
        throw new Error('Chat failed.');
    }
};

module.exports = {
    analyzeInsurancePolicy,
    analyzeRoofCondition,
    chatWithAssistant
};
