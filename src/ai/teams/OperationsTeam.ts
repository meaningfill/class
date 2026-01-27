
import { BaseAgent } from '../core/BaseAgent';

export class OperationsTeam {
    private qa: BaseAgent;
    private techLead: BaseAgent;

    constructor() {
        this.qa = new BaseAgent({
            name: "QAEspecialist",
            role: "Quality Assurance",
            personality: "비판적이고 꼼꼼함. 오타, 버그, 디자인 깨짐을 매의 눈으로 찾아냄. 타협하지 않음."
        });

        this.techLead = new BaseAgent({
            name: "TechLead",
            role: "DevOps & CTO",
            personality: "현실적이고 안정성 중시. 보안과 시스템 안정성을 최우선으로 함. 불필요한 기능 추가를 경계함."
        });
    }

    async reviewDeployment(deployContext: string) {
        console.log("🛡️ Operations Team Activated!");

        // 1. QA Check
        const qaReport = await this.qa.think(
            "Review the proposed content or changes. Are there any logical errors, missing information, or risks?",
            `Deployment Content: ${deployContext}`
        );

        // 2. Tech Sign-off
        const signOff = await this.techLead.think(
            "Evalute technical feasibility and give final Go/No-Go decision.",
            `QA Report: ${qaReport}`
        );

        return {
            qaReport,
            signOff
        };
    }
}
