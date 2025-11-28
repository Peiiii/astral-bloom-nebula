import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FlowerTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const themeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A creative, mystical name for this flower species or garden theme.",
    },
    description: {
      type: Type.STRING,
      description: "A short, poetic haiku or sentence describing the mood of this garden.",
    },
    palette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 5 hex color codes that form a cohesive, beautiful palette.",
    },
    petalShape: {
      type: Type.STRING,
      enum: ["round", "pointed", "heart", "jagged"],
      description: "The geometric style of the petals.",
    },
    centerColor: {
      type: Type.STRING,
      description: "Hex color code for the center of the flowers.",
    },
  },
  required: ["name", "description", "palette", "petalShape", "centerColor"],
};

export const generateGardenTheme = async (mood?: string): Promise<FlowerTheme> => {
  try {
    const prompt = mood 
      ? `Create a unique flower garden theme based on the mood: "${mood}".`
      : "Create a unique, imaginary, and beautiful flower garden theme with exotic colors.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: themeSchema,
        systemInstruction: "You are a master botanist and color theorist. Generate aesthetically pleasing, high-contrast color palettes suitable for digital generative art."
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as FlowerTheme;
  } catch (error) {
    console.error("Failed to generate theme:", error);
    // Fallback theme
    return {
      name: "Neon Midnight",
      description: "Lights flicker in the digital void.",
      palette: ["#ff007f", "#00f7ff", "#7928ca", "#f5d90a", "#ffffff"],
      petalShape: "pointed",
      centerColor: "#ffff00"
    };
  }
};