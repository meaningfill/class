import { supabase } from './supabase';
import { geminiService } from './geminiService';

export type AIMessage = {
    role: 'user' | 'model' | 'system';
    content: string;
    type?: 'text' | 'image' | 'product_card';
    metadata?: any;
};

class AICurationService {
    private sessionId: string;
    private productsCache: any[] = [];
    private classesCache: any[] = [];

    constructor() {
        this.sessionId = crypto.randomUUID();
        this.loadData();
    }

    // Preload products AND classes for RAG context
    private async loadData() {
        // Parallel fetch
        const [products, classes] = await Promise.all([
            supabase.from('products').select('id, name, price, description, components'),
            supabase.from('classes').select('id, title, price, level, description')
        ]);

        if (products.data) this.productsCache = products.data;
        if (classes.data) this.classesCache = classes.data;
    }

    async sendMessage(history: AIMessage[], userText: string): Promise<AIMessage> {
        // 1. Log User Message
        await this.logMessage('user', userText);

        // 2. Prepare Context (Lite RAG)
        const productContext = this.productsCache
            .map(p => `PRODUCT:${p.id} | ${p.name} | ${p.price}원 | ${p.description}`)
            .join('\n');

        const classContext = this.classesCache
            .map(c => `CLASS:${c.id} | ${c.title} | ${c.price}원 | ${c.level} | ${c.description}`)
            .join('\n');

        const systemPrompt = `
      You are the "MeaningFill Sommelier", an expert Consultant for Catering and Baking Classes.
      
      [Role]
      - For Catering: Recommend products, ask budget/people count.
      - For Classes: Explain curriculum, difficulty, and price. Suggest the 'Business/Startup' class for entrepreneurs.
      
      [Product Catalog]
      ${productContext}

      [Class Catalog]
      ${classContext}

      [Instructions]
      1. Analyze if the user wants CATERING (Food) or LEARNING (Class).
      2. If vague, ask clarifying questions.
      3. For "Tribute/Support Lunchbox" (조공 도시락), recommend premium sets with fruits/desserts.
      4. Speak in Korean (Natural, Polite).
    `;

        // 3. Call Gemini (Using generic service for now, injecting system prompt)
        const fullPrompt = `${systemPrompt}\n\nUser History:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\nUser: ${userText}\nSommelier:`;

        // Ensure geminiService.sendMessage supports systemPrompt or we bake it in. 
        // Here we baked it into fullPrompt as per previous design.
        let aiResponseText = await geminiService.sendMessage(fullPrompt);

        // 4. Log AI Response
        await this.logMessage('assistant', aiResponseText);

        // 5. [Shadow Logic] Analyze Intent & Sentiment (Async - Fire & Forget)
        this.analyzeIntent(userText, aiResponseText).catch(console.error);

        return {
            role: 'model',
            content: aiResponseText,
            type: 'text'
        };
    }

    // Shadow Analyst: Extracts metadata from the interaction
    private async analyzeIntent(userText: string, aiText: string) {
        const analysisPrompt = `
        Analyze this interaction between User and AI Sommelier.
        
        [User]: ${userText}
        [AI]: ${aiText}
        
        Extract the following JSON properties:
        {
            "intent": "inquiry" | "purchase" | "complaint" | "greeting",
            "topic": "catering" | "class" | "other",
            "sentiment_score": 1 (Negative) to 5 (Positive),
            "key_needs": ["budget_low", "vegan", "urgent", etc...],
            "purchase_probability": 0-100 (Integer)
        }
        `;

        const result = await geminiService.generateJSON(analysisPrompt);
        if (result && Object.keys(result).length > 0) {
            console.log('[AI Shadow Analyst] Intent Extracted:', result);

            // Update the consultation record with the latest intent
            // We assume this.sessionId is valid
            await supabase.from('ai_consultations')
                .update({
                    extracted_intent: result,
                    // Auto-tag 'hot_lead' if probability is high
                    conversion_status: (result.purchase_probability > 70) ? 'hot_lead' : 'active'
                })
                .eq('session_id', this.sessionId);
        }
    }

    private async logMessage(role: string, content: string) {
        try {
            await supabase.from('ai_messages').insert({
                consultation_id: this.sessionId, // We might need to create consultation parent first
                role,
                content
            });
        } catch (e) {
            console.warn('Logging failed (table might be missing):', e);
        }
    }

    // Create Parent Session
    async startSession(userInfo?: { email?: string }) {
        try {
            const { data, error } = await supabase.from('ai_consultations').insert({
                session_id: this.sessionId,
                user_email: userInfo?.email
            }).select().single();

            if (data) this.sessionId = data.id; // Use DB ID if available
        } catch (e) {
            console.warn('Session start failed:', e);
        }
    }
}

export const aiCurationService = new AICurationService();
