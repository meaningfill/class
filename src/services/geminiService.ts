
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
당신은 '미닝필(MeaningFill)'의 케이터링 및 베이킹 클래스 상담사입니다.
편안하고 친근한 말투로 고객의 니즈를 파악하고 적절한 상품이나 클래스를 추천해주세요.

[미닝필 서비스]
1. 케이터링: 기업 행사, 조공 도시락, 단체 주문 등
2. 베이킹 클래스: 창업 준비반, 취미반 등

[상담 가이드라인]
- 고객이 원하는 것(예산, 인원, 목적)을 자연스럽게 물어보세요
- 딱딱한 표현보다는 "~해요", "~드릴게요" 같은 부드러운 말투를 사용하세요
- 전문 용어는 쉽게 풀어서 설명해주세요
- 고객이 급하거나 예산이 부족한 경우 현실적인 대안을 제시해주세요

어조: 친절하지만 과하지 않게, 전문적이지만 부담스럽지 않게
`;


export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI() {
    if (!this.ai) {
      const apiKey = import.meta.env.VITE_API_KEY || '';
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  public async sendMessage(message: string, systemPrompt?: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001', // Upgraded to 2.0
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: systemPrompt || SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      // Robust Text Extraction (as per CLI fix)
      let text = "";
      // @ts-ignore
      if (typeof response.text === 'function') {
        // @ts-ignore
        text = response.text();
      } else if (response.text) {
        text = response.text;
      } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      }

      return text || "죄송합니다. 분석 내용을 생성하지 못했습니다.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "죄송합니다. AI 상담 연결이 지연되고 있습니다. 잠시 후 다시 말씀해 주세요.";
    }
  }

  // Shadow Analyst: Returns parsed JSON
  public async generateJSON(prompt: string): Promise<any> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json", // Force JSON
          temperature: 0.2, // Low temp for deterministic output
        },
      });

      // Robust Text Extraction (JSON)
      let text = "";
      // @ts-ignore
      if (typeof response.text === 'function') {
        // @ts-ignore
        text = response.text();
      } else if (response.text) {
        text = response.text;
      } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      }

      return JSON.parse(text || "{}");
    } catch (error) {
      console.error("Gemini JSON Error:", error);
      return {};
    }
  }
}

export const geminiService = new GeminiService();
