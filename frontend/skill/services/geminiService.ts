
import { GoogleGenAI } from "@google/genai";

// Initialize AI client. For text tasks, we use 'gemini-3-flash-preview'.
// We instantiate it inside the method to ensure it picks up the latest environment variables.

export const geminiService = {
  /**
   * General AI Assistant for Teachify
   */
  chat: async (userMessage: string, context: string = "Dashboard") => {
    try {
      // Must use named parameter: { apiKey: string }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const model = 'gemini-3-flash-preview';
      const systemInstruction = `You are 'Teachify Assistant', the professional AI companion for the Teachify LMS platform.
Tone: Academic, professional, clear, and direct.
Brand Goal: Clarity > Trust > Simplicity.
Current Context: ${context}.

Guidelines:
1. Provide structured, accurate, and supportive answers.
2. Help the user navigate the platform features (Courses, Exams, Certifications).
3. Use professional terminology and maintain a supportive educator's voice.
4. Be concise.`;

      // Use systemInstruction within the config object as per coding guidelines
      const response = await ai.models.generateContent({
        model: model,
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      // Directly access .text property, do not call as a function
      return response.text;
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "I encountered a synchronization error. Please try again shortly.";
    }
  },

  /**
   * Specific tutor for course content
   */
  askTutor: async (lessonTitle: string, question: string) => {
     return geminiService.chat(question, `Learning Course Lesson: ${lessonTitle}`);
  }
};
