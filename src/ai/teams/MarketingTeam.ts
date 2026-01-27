
import { BaseAgent } from '../core/BaseAgent';

export class MarketingTeam {
    private analyst: BaseAgent;
    private strategist: BaseAgent;
    private contentCreator: BaseAgent;

    constructor() {
        this.analyst = new BaseAgent({
            name: "DataAnalyst",
            role: "GA4 Data Specialist",
            personality: "분석적이고 객관적임. 숫자에 집착하며 전환율을 중요시함. 팩트 기반으로 말함."
        });

        this.strategist = new BaseAgent({
            name: "MarketingDirector",
            role: "Strategy Lead",
            personality: "비전이 있고 대담함. 고객 중심적 사고. '깔때기(Funnel)'와 투자 대비 수익(ROI)을 강조함."
        });

        this.contentCreator = new BaseAgent({
            name: "ContentWriter",
            role: "Copywriter & Blogger",
            personality: "창의적이고 매력적인 글솜씨. SEO 전문가. 클릭을 부르는 헤드라인을 잘 뽑음."
        });
    }

    async analyzeAndPlan(mockGaData: any) {
        console.log("📈 Marketing Team Activated!");

        // 1. Analyze Data
        const insights = await this.analyst.think(
            "Analyze the provided website metrics. Identify 3 key problems or opportunities (e.g., high drop-off, popular keywords).",
            `GA4 Data Summary: ${JSON.stringify(mockGaData)}`
        );

        // 2. Set Strategy
        const strategy = await this.strategist.think(
            "Based on the analyst's insights, propose a marketing campaign or site improvement plan to fix the issues.",
            `Analyst Report: ${insights}`
        );

        // 3. Create Content Draft
        const contentDraft = await this.contentCreator.think(
            "Write a blog post title and outline that aligns with the Director's strategy. Optimize for SEO.",
            `Strategy: ${strategy}`
        );

        return {
            insights,
            strategy,
            contentDraft
        };
    }
}
