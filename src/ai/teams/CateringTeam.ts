
import { BaseAgent } from '../core/BaseAgent';

export class CateringTeam {
    private planner: BaseAgent;
    private estimator: BaseAgent;
    private manager: BaseAgent;

    constructor() {
        this.planner = new BaseAgent({
            name: "MenuPlanner",
            role: "Catering Menu Specialist",
            personality: "Creative, detail-oriented, food-loving. Suggests balanced menus."
        });

        this.estimator = new BaseAgent({
            name: "CostEstimator",
            role: "Accountant",
            personality: "Precise, frugal, numbers-focused. Always looks for volume discounts."
        });

        this.manager = new BaseAgent({
            name: "CustomerManager",
            role: "Client Success Manager",
            personality: "Warm, professional, polite, persuasive. summarize information clearly."
        });
    }

    async processInquiry(userRequest: string) {
        console.log("🚀 Catering Team Activated!");

        // 1. Plan Menu
        const menuPlan = await this.planner.think(
            "Create a specific menu proposal (Sandwiches, Sides, Drinks) based on the customer request.",
            `Customer Request: "${userRequest}"`
        );

        // 2. Estimate Cost
        const costEstimate = await this.estimator.think(
            "Calculate the estimated cost for this menu and apply any necessary volume discounts (e.g., 5% off for >500k KRW). Output a simple calculation table.",
            `Menu Proposal: ${menuPlan}`
        );

        // 3. Draft Response
        const finalResponse = await this.manager.think(
            "Draft a polite and professional email response to the customer. Include the Menu highlights and the Price Estimate. Ask for a meeting or confirmation.",
            `Customer Request: "${userRequest}"\n\nMenu Plan: ${menuPlan}\n\nCost Estimate: ${costEstimate}`
        );

        return {
            menu: menuPlan,
            estimate: costEstimate,
            email: finalResponse
        };
    }
}
