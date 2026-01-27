
import { BaseAgent } from '../core/BaseAgent';

export class DesignTeam {
    private creativeDirector: BaseAgent;
    private uiDesigner: BaseAgent;

    constructor() {
        this.creativeDirector = new BaseAgent({
            name: "CreativeDirector",
            role: "Head of Design",
            personality: "예술적이고 감각적임. 브랜드 톤앤매너를 중요하게 생각함. 미닝필의 따뜻한 감성을 강조." // Korean Persona
        });

        this.uiDesigner = new BaseAgent({
            name: "UIDesigner",
            role: "Web Interface Designer",
            personality: "사용자 경험(UX) 중심. 모바일 편의성을 최우선으로 고려함. 깔끔하고 직관적인 디자인 선호."
        });
    }

    async designUpdates(strategyLog: string) {
        console.log("🎨 Design Team Activated! (디자인 팀 투입)");

        // 1. Creative Direction
        const moodBoard = await this.creativeDirector.think(
            "마케팅 전략을 바탕으로 웹사이트 디자인 방향성(컬러, 분위기, 이미지 스타일)을 잡아주세요.",
            `Marketing Strategy: ${strategyLog}`
        );

        // 2. UI Sketch
        const uiComponents = await this.uiDesigner.think(
            "디렉터의 방향성에 맞춰 구체적인 UI 컴포넌트(배너, 버튼, 레이아웃) 변경안을 제안해주세요.",
            `Direction: ${moodBoard}`
        );

        return {
            moodBoard,
            uiComponents
        };
    }
}
