import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scenario, JewelryAnalysis, ShotType } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeJewelry = async (base64Image: string): Promise<JewelryAnalysis> => {
  const ai = getAIClient();
  
  // Extract MIME type from base64 string if present, default to png
  const mimeMatch = base64Image.match(/^data:(.*?);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        imagePart,
        { text: "Analyze this jewelry piece for a luxury fashion app. Identify type, material, style, and a high-fashion description. Output in JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          material: { type: Type.STRING },
          style: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["type", "material", "style", "description"],
      }
    }
  });

  return JSON.parse(response.text || "{}") as JewelryAnalysis;
};

export const generateVisualization = async (
  jewelryBase64: string,
  analysis: JewelryAnalysis,
  scenario: Scenario,
  shotType: ShotType = ShotType.MIDLENGTH
): Promise<string> => {
  const ai = getAIClient();
  
  // Extract MIME type from base64 string if present, default to png
  const mimeMatch = jewelryBase64.match(/^data:(.*?);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  
  const scenarioContexts = {
    [Scenario.TRADITIONAL]: `A graceful Indian model in heritage attire (like a Kanjeevaram Saree or Anarkali). Setting: A royal palace courtyard in Rajasthan.`,
    [Scenario.CASUAL]: `A modern Indian woman in contemporary Indo-western fusion (like a chic linen tunic). Setting: An upscale modern art gallery.`,
    [Scenario.FESTIVE]: `A radiant Indian model in grand celebratory wear (like a heavy embroidered Lehenga). Setting: A Diwali celebration with twinkling lights.`
  };

  const shotSpecifics = {
    [ShotType.CLOSEUP]: "A high-fashion beauty portrait. Focus on the model's face and upper chest to highlight the jewelry and facial expressions. Professional studio lighting mixed with ambient setting colors.",
    [ShotType.MIDLENGTH]: "A mid-length editorial shot. Show the model from waist up to reveal the jewelry in context with the full upper-body outfit and environment.",
    [ShotType.EXTREME_CLOSEUP]: "A macro photography shot. Extreme focus on the jewelry piece itself as worn on the model's skin. The model's features are softly blurred in the background (bokeh effect). Showcase the intricate details of the gems and metalwork."
  };

  const prompt = `A high-end, ultra-realistic fashion magazine editorial photo. 
  A beautiful Indian model is wearing the jewelry from the reference image.
  
  PERSPECTIVE: ${shotSpecifics[shotType]}
  
  JEWELRY TO RENDER: ${analysis.type} made of ${analysis.material} in ${analysis.style} style.
  DESCRIPTION: ${analysis.description}.
  
  SCENARIO: ${scenarioContexts[scenario]}
  
  TECHNICAL: Cinematic lighting, sharp focus on the jewelry. The jewelry must look exactly like the reference provided.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: jewelryBase64.split(',')[1] || jewelryBase64,
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: { aspectRatio: "3:4" }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Generation failed.");
};