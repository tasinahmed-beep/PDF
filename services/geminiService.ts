
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

/**
 * Uses Gemini to suggest a creative and relevant file name for the merged PDF based on input file names
 * and optional user-provided context.
 */
export const suggestPdfName = async (fileNames: string[], context?: string): Promise<string> => {
  if (!apiKey) return 'merged_document.pdf';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contextPrompt = context ? `\n\nAdditional User Context/Keywords: "${context}"` : '';
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the following file names, suggest a single concise and professional name for a merged PDF document (e.g., 'Project_Invoices_2024'). 
      ${contextPrompt}
      
      Respond ONLY with the suggested file name (without extension) and no other text or explanation. 
      
      Files:
      ${fileNames.join('\n')}`,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const suggestion = response.text?.trim().replace(/['"]/g, '');
    return suggestion || 'merged_document';
  } catch (error) {
    console.error('Gemini naming error:', error);
    return 'merged_document';
  }
};
