
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// It's assumed that process.env.API_KEY is set in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a user-friendly message or disable functionality.
  // For this example, we'll throw an error to make the issue clear during development.
  console.error("API_KEY environment variable not set. Please set it in your environment.");
}

// Initialize with a check to avoid errors if API_KEY is missing.
const ai = new GoogleGenAI({ apiKey: API_KEY || '' });
const model = 'gemini-2.5-flash-image';

const generateImageFromPromptAndImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Cannot make API requests.");
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data was found in the Gemini API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a more user-friendly error message
    throw new Error("Failed to generate image due to an API error. Please check the console for more details.");
  }
};

export const editImage = (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  return generateImageFromPromptAndImage(base64Image, mimeType, prompt);
};

export const generateProductShot = (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const productShotPrompt = `Create a detailed, high-quality product image of the clothing in the photo. The image must have a clean, solid white background and be a direct, front-facing view. Remove any distractions, people, or clutter from the background. The lighting should be professional and even, mimicking a studio photoshoot. The final image should be a realistic representation of the original clothing item.`;
  return generateImageFromPromptAndImage(base64Image, mimeType, productShotPrompt);
};
