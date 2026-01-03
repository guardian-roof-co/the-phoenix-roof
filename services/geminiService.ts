import { apiClient } from './apiClient';

// Analyze an insurance policy document (image or PDF) via Backend Vertex AI
export const analyzeInsurancePolicy = async (fileBase64: string, mimeType: string): Promise<string> => {
  try {
    const data = await apiClient.post('/api/analyze-policy', { fileBase64, mimeType });
    return data.analysis || "Could not analyze the document.";
  } catch (error) {
    console.error("Policy Analysis Error:", error);
    throw new Error("Failed to analyze policy. Please try again.");
  }
};

// Perform a remote visual assessment of roof condition via Backend Vertex AI
export const analyzeRoofCondition = async (
  streetViewBase64: string | null,
  userImages: { data: string, mimeType: string }[]
): Promise<string> => {
  try {
    const data = await apiClient.post('/api/analyze-roof', { streetViewBase64, userImages });
    return data.analysis || "Analysis failed.";
  } catch (error) {
    console.error("Roof Analysis Error:", error);
    throw new Error("Failed to analyze roof condition.");
  }
};