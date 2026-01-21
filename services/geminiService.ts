import { apiClient } from './apiClient';

// Analyze an insurance policy document (image or PDF) via Backend Vertex AI
export const analyzeInsurancePolicy = async (fileBase64: string, mimeType: string, email?: string): Promise<{ analysis: string, fileUrl?: string }> => {
  try {
    const data = await apiClient.post('/api/analyze-policy', { fileBase64, mimeType, email });
    return {
      analysis: data.analysis || "Could not analyze the document.",
      fileUrl: data.fileUrl
    };
  } catch (error) {
    throw error;
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
  } catch (error: any) {
    console.error("Roof Analysis Error:", error);
    // Propagate the actual error message if available
    throw new Error(error.message || "Failed to analyze roof condition.");
  }
};