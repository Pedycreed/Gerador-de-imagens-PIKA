import { GoogleGenAI, Modality, Part, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { ImageSize, UploadedImage } from '../App';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const MODELS = {
    'gemini-2.5-flash-image': { name: 'Gemini Flash', capabilities: { edit: true } },
    'imagen-4.0-generate-001': { name: 'Imagen 4', capabilities: { edit: false } },
};

export type ModelId = keyof typeof MODELS;


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const generateWithNanoBanana = async (prompt: string, size: ImageSize, uploadedImage: UploadedImage | null): Promise<string> => {
    let dimensionInstruction = '';
    if (size === 'YouTube (16:9)') {
      dimensionInstruction = 'suitable for a YouTube thumbnail. The desired dimension is a 16:9 aspect ratio image of approximately 1280x720 pixels.';
    } else {
      dimensionInstruction = `The desired dimension is a square image of approximately ${size.split('x')[0]} pixels.`;
    }

    const enhancedPrompt = uploadedImage
      ? prompt
      : `Generate a high-quality, detailed image ${dimensionInstruction} Prompt: ${prompt}`;

    const parts: Part[] = [];

    if (uploadedImage) {
      parts.push({
        inlineData: {
          data: uploadedImage.base64,
          mimeType: uploadedImage.mimeType,
        },
      });
    }

    if (enhancedPrompt.trim()) {
        parts.push({ text: enhancedPrompt });
    }
    
    if (parts.length === 0) {
        throw new Error("Cannot generate image without a prompt or an uploaded image.");
    }

    // FIX: Object literal may only specify known properties, and 'safetySettings' does not exist in type 'GenerateContentParameters'. Moved safetySettings into the config object.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
        safetySettings,
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data found in Nano Banana response.");
};

const generateWithImagen4 = async (prompt: string, size: ImageSize): Promise<string> => {
    const aspectRatio = size === 'YouTube (16:9)' ? '16:9' : '1:1';

    // FIX: Object literal may only specify known properties, and 'safetySettings' does not exist in type 'GenerateImagesParameters'. Moved safetySettings into the config object.
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
            safetySettings,
        },
    });

    const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
    if (base64ImageBytes) {
        return base64ImageBytes;
    }
    
    throw new Error("No image data found in Imagen 4 response.");
};


export const generateImage = async (prompt: string, size: ImageSize, uploadedImage: UploadedImage | null, modelId: ModelId): Promise<string> => {
  try {
    switch(modelId) {
        case 'gemini-2.5-flash-image':
            return await generateWithNanoBanana(prompt, size, uploadedImage);
        case 'imagen-4.0-generate-001':
            if (uploadedImage) {
                throw new Error("Imagen 4 does not support image editing. Please clear the uploaded image.");
            }
            return await generateWithImagen4(prompt, size);
        default:
            throw new Error(`Unsupported model selected: ${modelId}`);
    }
  } catch (error) {
    console.error(`Error generating image with ${modelId}:`, error);
    if (error instanceof Error) {
        throw new Error(`API Error (${MODELS[modelId].name}): ${error.message}`);
    }
    throw new Error("An unexpected error occurred while calling the API.");
  }
};

export const refinePrompt = async (prompt: string): Promise<string[]> => {
  try {
    // FIX: Object literal may only specify known properties, and 'safetySettings' does not exist in type 'GenerateContentParameters'. Moved safetySettings into the config object.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following user prompt, provide 3 more descriptive and creative alternatives that would generate a better image. User Prompt: "${prompt}"`,
      config: {
        systemInstruction: "You are a prompt engineering expert for generative AI image models. Your goal is to help users enhance their initial ideas. You will be given a user's prompt and you must return 3 improved suggestions in a JSON object format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: 'An array of exactly 3 refined prompt suggestions.'
            }
          },
          required: ['suggestions']
        },
        safetySettings,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions;
    }

    throw new Error("Received invalid data structure from prompt refinement API.");

  } catch (error) {
    console.error(`Error refining prompt:`, error);
    if (error instanceof Error) {
        throw new Error(`API Error (Refine): ${error.message}`);
    }
    throw new Error("An unexpected error occurred while refining the prompt.");
  }
};

export const translateToEnglish = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    return prompt;
  }

  try {
    // FIX: Object literal may only specify known properties, and 'safetySettings' does not exist in type 'GenerateContentParameters'. Moved safetySettings into the config object.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
         systemInstruction: "You are a highly efficient translation engine. Translate the user's text to English. Do not add any extra text, explanations, or labels like 'English:'. Only return the translated text itself.",
         safetySettings,
      },
    });
    
    return response.text.trim();

  } catch (error) {
    console.error(`Error translating prompt:`, error);
    if (error instanceof Error) {
        throw new Error(`API Error (Translate): ${error.message}`);
    }
    throw new Error("An unexpected error occurred while translating the prompt.");
  }
};
