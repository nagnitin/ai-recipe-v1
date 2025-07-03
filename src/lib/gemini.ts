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
You are a smart kitchen assistant. Please analyze this image and provide:

## 🥕 Ingredients Identified:
List all identifiable ingredients from this image with bullet points.

## 🍽️ Recipe Suggestions:
Suggest 2-3 easy recipes using those ingredients. Format each recipe as:

### Recipe Name
**Ingredients:**
- ingredient 1
- ingredient 2

**Steps:**
1. step one
2. step two

Keep responses clean, organized, and easy to read.
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
You are a helpful cooking assistant. You must only answer questions related to cooking, recipes, food, ingredients, or kitchen topics. If the user asks about anything else, politely reply: 'Sorry, I can only answer questions about cooking, food, or recipes.'

The user said: "${message}"

Please analyze this image and respond to their question. Provide helpful, well-organized responses using:
- Clear headings with emojis (##)
- Bullet points for lists
- Numbered steps for instructions
- Keep responses concise and practical

Focus on ingredients or recipes based on what you see in the image.
`;
      content = [prompt, imageData];
    } else {
      prompt = `
You are a helpful cooking assistant. You must only answer questions related to cooking, recipes, food, ingredients, or kitchen topics. If the user asks about anything else, politely reply: 'Sorry, I can only answer questions about cooking, food, or recipes.'

The user said: "${message}"

Please provide helpful cooking advice using clear formatting:
- Use headings with emojis (##)
- Bullet points for ingredient lists
- Numbered steps for instructions
- Keep responses concise and practical

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