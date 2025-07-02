import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyC0lnDHppWlt3fldHJnx5wxDO73Dvi1ULQ";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the model
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function extractIngredientsAndRecipes(imageFile: File): Promise<string> {
  try {
    const imageData = await fileToGenerativePart(imageFile);
    
    const prompt = `
You are a smart kitchen assistant.

1. First, list all identifiable ingredients from this image.
2. Then, suggest 2–3 easy recipes using those ingredients.
Each recipe should have:
- Title
- Ingredient list  
- Steps (in bullet points)
`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to analyze image and generate recipes');
  }
}

export async function chatWithAI(message: string, imageFile?: File): Promise<string> {
  try {
    let prompt;
    let content: any[];

    if (imageFile) {
      const imageData = await fileToGenerativePart(imageFile);
      prompt = `
You are a helpful cooking assistant. The user said: "${message}"

Please analyze this image and respond to their question. If they're asking about ingredients or recipes, 
provide helpful cooking advice, recipe suggestions, or ingredient information based on what you see in the image.
`;
      content = [prompt, imageData];
    } else {
      prompt = `
You are a helpful cooking assistant. The user said: "${message}"

Please provide helpful cooking advice, recipe suggestions, cooking tips, or answer any culinary questions they might have.
Be friendly and informative in your response.
`;
      content = [prompt];
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw new Error('Failed to get AI response');
  }
}

// Helper function to convert File to GenerativePart
async function fileToGenerativePart(file: File): Promise<any> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64 = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve({
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}