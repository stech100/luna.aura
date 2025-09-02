
import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types';

// Assuming API_KEY is set in the environment, as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const AVAILABLE_MODELS = ['gemini-2.5-flash'];

/**
 * Sends a message to the Gemini model and returns a stream of responses.
 * This function is now stateless and uses the recommended `generateContentStream` method.
 * @param history - The entire conversation history, including the latest user message.
 * @param message - The latest user message text (note: this is redundant as it's in history, but kept for signature compatibility).
 * @param model - The name of the model to use for the request.
 * @returns An async generator that yields response text chunks.
 */
export const sendMessageStream = async (
    history: Message[],
    message: string,
    model: string
): Promise<AsyncGenerator<string, void, unknown>> => {
    
    // The `history` array from ChatView already includes the latest user message.
    // We map it to the format required by the Gemini API.
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const responseStream = await ai.models.generateContentStream({
        model,
        contents,
    });

    async function* streamGenerator(): AsyncGenerator<string, void, unknown> {
        for await (const chunk of responseStream) {
            // Use chunk.text property as per the latest SDK
            yield chunk.text;
        }
    }

    return streamGenerator();
};