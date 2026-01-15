import { GoogleGenAI } from "@google/genai";
import { SkinTone } from "../types";

const getClient = () => {
  // Try to get API key from localStorage first (user-provided)
  let apiKey: string | undefined;

  try {
    // Check localStorage for user-provided API key
    const storageKey = localStorage.getItem('gemini_api_key');
    if (storageKey) {
      apiKey = storageKey;
    }

    // Fallback to process.env for development compatibility
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.error("Error accessing API key:", e);
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Please set your Gemini API Key in Settings.");
  }

  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const MODEL_NAME = 'gemini-3-pro-image-preview';
export const TEXT_MODEL_NAME = 'gemini-3-pro-preview';

export const PROMPTS = {
  derivation_describe: "Analyze the provided image and generate a detailed description that captures its key visual elements, including the subject, setting, lighting, color palette, and artistic style. The description should be precise and suitable for recreating the image.",
  derivation_generate: (description: string, intensity: number, skinTone?: SkinTone) => {
    let prompt = `Generate a creative variant based on the following description: "${description}".\nCreativity level: ${intensity}/10.\n`;

    if (skinTone) {
      prompt += `IMPORTANT: The subject in the image must have a ${skinTone} skin tone. Ensure this skin tone is applied naturally. Keep all other features such as hair style, facial structure, clothing, and pose consistent with the original description, only modifying the skin tone.\n`;
    }

    prompt += `Maintain the style, but explore different artistic interpretations. Use photorealistic photography style. Image ratio 3:4. Return only the image.`;
    return prompt;
  },
  avatar: `Create a high-quality, professional character image based on these reference photos.
The style should be clean, with a gray-white background and studio-level natural lighting.
The character's makeup, facial features, body shape, skin tone, hairstyle, and hair color must be consistent with the original images, without any changes.
The character wears a white tight yoga outfit.
Subject centered. Image ratio 3:4.`,
  tryOn: "Generate a realistic image of the person from the first image wearing the clothing from the second image. Ensure the clothing is exactly consistent with the original, while maintaining natural fit, matching the model's pose, lighting, and body shape. The garment silhouette, fabric, and structure must not be altered. Image ratio 3:4.",
  swap: "Compose the person from the first image into the scene provided by the second image. Harmonize lighting, shadows, and color tones so that the character appears to naturally belong in the environment. Keep the pose of the person in the second image unchanged, and choose a full-body or suitable composition according to the scene. Image ratio 3:4."
};

// Utility for Timeout and Retry
type StatusCallback = (status: 'retrying' | 'processing_step1' | 'processing_step2') => void;

async function withTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000, // Default to 30s
  maxRetries: number = 3,
  onStatusUpdate?: (status: 'retrying') => void
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      if (attempt > 0) {
        if (onStatusUpdate) onStatusUpdate('retrying');
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying attempt ${attempt} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      // Race the operation against the timeout
      return await Promise.race([operation(), timeoutPromise]);

    } catch (error) {
      attempt++;
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt > maxRetries) {
        throw error;
      }
      // Continue loop for retry
    }
  }
}

export const generateDerivations = async (
  baseImage: File,
  intensity: number,
  skinTone?: SkinTone,
  onStatusUpdate?: StatusCallback
): Promise<{ images: string[], description: string }> => {
  const ai = getClient();
  const base64Data = await fileToBase64(baseImage);
  
  // Step 1: Image to Text (Description)
  if (onStatusUpdate) onStatusUpdate('processing_step1');

  // Increased timeout to 60s, 2 retries
  const description = await withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: baseImage.type, data: base64Data } },
          { text: PROMPTS.derivation_describe },
        ],
      },
    });
    return response.text || "A creative image.";
  }, 60000, 2, (s) => onStatusUpdate && onStatusUpdate(s));

  // Step 2: Text to Image (Generation)
  if (onStatusUpdate) onStatusUpdate('processing_step2');

  const prompt = PROMPTS.derivation_generate(description, intensity, skinTone);

  // Define the single generation task
  const generateSingle = async () => {
    // Timeout 60s for image generation, 1 retry
    return withTimeoutAndRetry(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            { text: prompt },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
    }, 60000, 1, (s) => onStatusUpdate && onStatusUpdate(s)); 
  };

  // Run sequentially to prevent rate limiting
  const results: string[] = [];
  try {
    results.push(await generateSingle());
    results.push(await generateSingle());
    results.push(await generateSingle());
    results.push(await generateSingle());
  } catch (e) {
    console.error("Some derivations failed", e);
  }
  
  return { images: results, description };
};

export const trainAvatar = async (files: File[], onStatusUpdate?: StatusCallback): Promise<string> => {
  const ai = getClient();
  
  // Timeout 60s, 1 retry
  return withTimeoutAndRetry(async () => {
    const parts: any[] = [];
    for (const file of files) {
      const b64 = await fileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: b64
        }
      });
    }
    
    parts.push({ text: PROMPTS.avatar });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate avatar preview");
  }, 60000, 1, (s) => onStatusUpdate && onStatusUpdate(s));
};

export const generateTryOn = async (modelFile: File, garmentFile: File, onStatusUpdate?: StatusCallback): Promise<string> => {
  const ai = getClient();
  const modelB64 = await fileToBase64(modelFile);
  const garmentB64 = await fileToBase64(garmentFile);

  // Timeout 60s, 1 retry
  return withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: modelFile.type, data: modelB64 } },
          { inlineData: { mimeType: garmentFile.type, data: garmentB64 } },
          { text: PROMPTS.tryOn }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate try-on image");
  }, 60000, 1, (s) => onStatusUpdate && onStatusUpdate(s));
};

export const generateSwap = async (sourceFile: File, sceneFile: File, onStatusUpdate?: StatusCallback): Promise<string> => {
  const ai = getClient();
  const sourceB64 = await fileToBase64(sourceFile);
  const sceneB64 = await fileToBase64(sceneFile);

  // Timeout 60s, 1 retry
  return withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: sourceFile.type, data: sourceB64 } },
          { inlineData: { mimeType: sceneFile.type, data: sceneB64 } },
          { text: PROMPTS.swap }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate swap image");
  }, 60000, 1, (s) => onStatusUpdate && onStatusUpdate(s));
};