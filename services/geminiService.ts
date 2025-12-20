import { GoogleGenAI } from "@google/genai";

// Analyze an insurance policy document (image or PDF) using Gemini
export const analyzeInsurancePolicy = async (fileBase64: string, mimeType: string): Promise<string> => {
  try {
    // Instantiate GoogleGenAI right before use to ensure correct API key integration
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use gemini-3-flash-preview for text extraction and policy reasoning
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      You are an expert roofing insurance consultant for "The Phoenix Roof". 
      Review this attached document (which may be an image or a PDF of an insurance policy).
      
      Please extract and explain the following details in simple terms for a homeowner:
      1. **Roof Coverage Type**: Is it Replacement Cost Value (RCV) or Actual Cash Value (ACV)? Explain the difference briefly.
      2. **Deductible**: specifically for Wind/Hail.
      3. **Endorsements**: Are there any specific roof-related endorsements (e.g., Code Upgrade/Ordinance or Law)?
      4. **Exclusions**: Any cosmetic damage waivers for metal roofs or other specific exclusions?
      
      Format the response using Markdown with clear headings. 
      If you cannot find specific information in the visible document, state that clearly.
      End with a recommendation on whether they should schedule a professional inspection based on typical policy gaps.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "Could not analyze the document. Please ensure the file is clear.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze policy. Please try again.");
  }
};

// Perform a remote visual assessment of roof condition using user photos and Street View
export const analyzeRoofCondition = async (
  streetViewBase64: string | null, 
  userImages: { data: string, mimeType: string }[]
): Promise<string> => {
  try {
    // Instantiate GoogleGenAI right before use to ensure correct API key integration
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for multi-modal analysis
    const model = 'gemini-3-flash-preview';

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

    const parts: any[] = [{ text: prompt }];

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

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts }
    });

    return response.text || "Analysis failed.";

  } catch (error) {
    console.error("Gemini Roof Analysis Error:", error);
    throw new Error("Failed to analyze roof condition.");
  }
};