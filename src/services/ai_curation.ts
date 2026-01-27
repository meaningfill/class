import { supabase } from './supabase';
import { geminiService } from './geminiService';
// Local JSON removed in favor of Supabase 'rag_knowledge_base'
// import dataset from '../data/synthetic_qa.json';

export type AIMessage = {
    role: 'user' | 'model' | 'system';
    content: string;
    type?: 'text' | 'image' | 'product_card';
    metadata?: any;
};

const TONE_RULES = `
[Tone & Personality]
1.  **Identity**: "MeaningFill" (미닝필) AI Consultant.
2.  **Greetings**: Start with "안녕하세요" ONLY in the very first response of the conversation. Do NOT repeat it in subsequent turns.
3.  **Affirmation**: Use "네" only when directly answering Yes/No questions or acknowledging a complex request. Do NOT start every single sentence with "네".
4.  **Endings**: Use periods ("."). No tildes ("~").
5.  **Phrasing**: Be professional but friendly. Use explicit subjects.
6.  **Completeness**: When listing menu items or options, list ALL of them explicitly.
7.  **Formatting**: Use bullet points ("- ") and newlines for every item in a list to improve readability. Do NOT write lists in a single paragraph.

[Format]
- Keep answers concise (under 200 characters if possible), EXCEPT when listing items (then use as much space as needed for readability).
- If the Context suggests a "Manager Handoff", politely suggest connecting to a manager.
`;

class AICurationService {
    private sessionId: string;
    private productsCache: any[] = [];
    private classesCache: any[] = [];
    // private ragDataset: any[] = dataset || [];

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

    // RAG Logic: Fetch from Supabase
    private async findRelevantContext(query: string) {
        if (!query) return [];

        // Simple keyword extraction
        const keywords = query.split(' ').filter(w => w.length > 1);
        if (keywords.length === 0) return [];

        // Construct OR query for Supabase: question.ilike.%k1%, answer.ilike.%k1%, ...
        // Note: For too many keywords, this might get long. Limiting to top 3 keywords for query.
        const searchTerms = keywords.slice(0, 3).map(k => `question.ilike.%${k}%,answer.ilike.%${k}%`).join(',');

        const { data, error } = await supabase
            .from('rag_knowledge_base')
            .select('*')
            .or(searchTerms)
            .limit(20);

        if (error || !data) {
            console.warn('RAG Search failed:', error);
            return [];
        }

        // Re-score in memory (Client-side re-ranking) to match original logic
        const scored = data.map((item: any) => {
            let score = 0;
            keywords.forEach(k => {
                if (item.question.includes(k)) score += 2;
                if (item.answer.includes(k)) score += 1;
            });
            return { item, score };
        });

        // Sort by score and take top 5
        scored.sort((a: any, b: any) => b.score - a.score);
        return scored.slice(0, 5).map((s: any) => s.item);
    }

    async sendMessage(history: AIMessage[], userText: string): Promise<AIMessage> {
        // 1. Log User Message
        await this.logMessage('user', userText);

        // 2. Prepare Context (RAG + Catalog)

        // A. Knowledge Base RAG
        const relevantItems = await this.findRelevantContext(userText);
        const qaContext = relevantItems.map((i: any) => `Q: ${i.question}\nA: ${i.answer}`).join('\n---\n');

        // B. Database Context (Catalog)
        const productContext = this.productsCache
            .map(p => `PRODUCT:${p.id} | ${p.name} | ${p.price}원 | ${p.description}`)
            .join('\n');
        const classContext = this.classesCache
            .map(c => `CLASS:${c.id} | ${c.title} | ${c.price}원 | ${c.level} | ${c.description}`)
            .join('\n');

        // 3. Construct System Prompt with Rules
        const systemPrompt = `
${TONE_RULES}

[Reference Knowledge (Similar Past Q&A)]
${qaContext}

[Product Catalog]
${productContext}

[Class Catalog]
${classContext}

[Instructions]
1. Answer the user's question based on the Reference Knowledge and Catalogs.
2. If vague, ask clarifying questions.
3. Apply TONE_RULES strictly (No repeated greetings).
`;

        // 4. Call Gemini
        // We inject the system prompt. Note: GeminiService now handles this.
        // We just pass the user text because GeminiService doesn't support full history array yet,
        // BUT wait, we need history for context.
        // The implementation in geminiService.ts handles explicit message history via 'contents' array if we used startChat, 
        // but currently it does single-turn 'generateContent' with just one user message.
        // TO FIX: We manually append history to the prompt for now, OR better, we rely on the client maintaining history 
        // and we simply pass the logic.
        // Given 'geminiService.sendMessage(message, systemPrompt)' signature:

        // Let's format history into the prompt to "simulate" memory since 'sendMessage' is stateless in current geminiService implementation.
        // Ideally we should refactor geminiService to take history, but minimal change is safer.

        const historyText = history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');

        const fullPrompt = `
[Conversation History]
${historyText}

[User Query]
${userText}
`;

        let aiResponseText = await geminiService.sendMessage(fullPrompt, systemPrompt);

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
