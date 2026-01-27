
import { MarketingTeam } from '../src/ai/teams/MarketingTeam';
import { OperationsTeam } from '../src/ai/teams/OperationsTeam';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Mock Data (In reality, this comes from GA4 API)
const MOCK_GA_DATA = {
    weekly_visits: 1250,
    bounce_rate: "65%",
    top_bounce_page: "/catering-inquiry",
    top_search_keyword: "단체 샌드위치",
    conversion_rate: "2.1%"
};

async function runMondayBriefing() {
    console.log("🏢 MeaningFill Weekly AI Briefing...\n");

    const marketing = new MarketingTeam();
    const ops = new OperationsTeam();

    // 1. Marketing Analysis
    console.log("--- Phase 1: Marketing Strategy ---");
    const marketingReport = await marketing.analyzeAndPlan(MOCK_GA_DATA);

    console.log(`\n📊 [Analyst]:\n${marketingReport.insights.substring(0, 100)}...`);
    console.log(`\n🎯 [Strategist]:\n${marketingReport.strategy.substring(0, 100)}...`);
    console.log(`\n✍️ [Content]:\n${marketingReport.contentDraft.substring(0, 100)}...`);

    // 2. QA & Tech Review
    console.log("\n--- Phase 2: Operations Review ---");
    const opsReport = await ops.reviewDeployment(marketingReport.contentDraft);

    console.log(`\n🐛 [QA]:\n${opsReport.qaReport.substring(0, 100)}...`);
    console.log(`\n✅ [Tech Lead]:\n${opsReport.signOff}\n`);
}

runMondayBriefing();
