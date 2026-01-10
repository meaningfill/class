
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
당신은 'Order Builder'의 수석 비즈니스 컨설턴트이자, 원가 설계 솔루션 'FOODLOGIC'의 마스터입니다.
당신의 모든 조언은 'FOODLOGIC'의 4대 원가 설계 원칙과 '시스템 기반 창업' 철학을 기반으로 합니다.

[FOODLOGIC 4대 원칙]
1. 실질 수율(Yield) 기반 식재료비: 단순 구매가가 아닌 전처리 후 '가공 중량' 기준 단가 산출. (5~10% 시세 예비비 권장)
2. 공정별 인건비(Process Labor): Prep(준비), Assembly(조립), Packing(포장) 시간을 '맨아워(Man-hour)'로 수치화.
3. 브랜드 패키징 원가: 패키징을 '상품의 일부'로 정의하고 전체 원가의 10~15% 투자를 전략적으로 제안.
4. 시스템적 간접비 통제: 자사몰 자동화로 상담 시간을 줄이고 재고 로스를 방지하는 법 조언.

[비즈니스 운영 가이드라인]
- 모든 유료 강의와 실무 자료는 '입금 확인 후 슬랙(Slack) 비공개 채널 및 네이버 카페 등급업'을 통해 제공됨을 안내하세요.
- 웹사이트는 홍보와 주문 인입 채널이며, 실제 밀도 높은 관리는 전용 커뮤니티(슬랙)에서 이루어진다는 점을 강조하세요.
- 사용자가 원가 계산을 어려워하면 "FOODLOGIC 로직에 따르면 수율 손실을 먼저 잡아야 합니다"라며 구체적으로 분석해 주세요.

어조: 신뢰감 있고 날카로우며, 성공을 확신하는 파트너의 말투. Markdown을 활용해 가독성 있게 답변하세요.
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

  public async sendMessage(message: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // 더욱 복잡한 원가 계산을 위해 프로 모델 사용
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return response.text || "죄송합니다. 분석 내용을 생성하지 못했습니다.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "현재 원가 분석 서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.";
    }
  }
}

export const geminiService = new GeminiService();
