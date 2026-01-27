
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../services/supabase'; // Access to DB tools


export interface AgentConfig {
    name: string;
    role: string;
    personality: string;
    model?: string;
}

export class BaseAgent {
    private modelName = 'gemini-2.0-flash-001';

    public config: AgentConfig;

    constructor(config: AgentConfig) {
        this.config = config;
        if (config.model) this.modelName = config.model;
    }

    async think(task: string, context: string = ""): Promise<string> {
        console.log(`\n🤖 [${this.config.name}] (${this.config.role}) is thinking...`);

        // Lazy load API Key to ensure dotenv is loaded
        const apiKey = process.env.VITE_API_KEY || (import.meta as any).env?.VITE_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing VITE_API_KEY");
            throw new Error("Missing VITE_API_KEY. Ensure .env is loaded.");
        }

        const genAI = new GoogleGenAI({ apiKey });

        const systemPrompt = `
        IDENTITY:
        You are ${this.config.name}, a ${this.config.role}.
        Personality: ${this.config.personality}
        
        YOUR GOAL:
        Execute the assigned task efficiently.
        
        CRITICAL RULE:
        ALWAYS respond in KOREAN (한국어). Even if the input is English, translate and respond in Korean.
        
        CONTEXT:
        ${context}
        `;

        try {
            const result = await genAI.models.generateContent({
                model: this.modelName,
                contents: [{ role: 'user', parts: [{ text: `System: ${systemPrompt}\n\nTask: ${task}` }] }]
            });

            let responseText = "";
            if (result.text) {
                // @ts-ignore: Handle potential function/property mismatch
                responseText = typeof result.text === 'function' ? result.text() : result.text;
            } else if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                responseText = result.candidates[0].content.parts[0].text;
            }

            console.log(`✅ [${this.config.name}] Task complete.`);
            return responseText;
        } catch (error) {
            console.error(`❌ [${this.config.name}] Failed:`, error);
            throw error;
        }
    }
}
