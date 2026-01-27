
import { MarketingTeam } from '../src/ai/teams/MarketingTeam';
import { DesignTeam } from '../src/ai/teams/DesignTeam';
import { OperationsTeam } from '../src/ai/teams/OperationsTeam';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Mock Data Analysis
const MOCK_GA_DATA = {
    weekly_visits: 1250,
    bounce_rate: "68%",
    top_bounce_page: "/catering-inquiry",
    top_search_keyword: "소규모 케이터링",
    device: "Mobile (80%)"
};

async function runFullCompanyBriefing() {
    console.log("🏢 미닝필 주간 AI 전략 회의 시작...\n");

    const marketing = new MarketingTeam();
    const design = new DesignTeam();
    const ops = new OperationsTeam();

    // 1. Marketing Analysis
    console.log("--- 1. 마케팅 전략 수립 (Marketing Team) ---");
    const marketingReport = await marketing.analyzeAndPlan(MOCK_GA_DATA);

    console.log(`\n📊 [데이터 분석가]:\n${marketingReport.insights.substring(0, 150)}...`);
    console.log(`\n🎯 [마케팅 이사]:\n${marketingReport.strategy.substring(0, 150)}...`);

    // 2. Design Updates
    console.log("\n--- 2. 디자인 및 UI 개선 (Design Team) ---");
    const designReport = await design.designUpdates(marketingReport.strategy);

    console.log(`\n🎨 [크리에이티브 디렉터]:\n${designReport.moodBoard.substring(0, 150)}...`);
    console.log(`\n📱 [UI 디자이너]:\n${designReport.uiComponents.substring(0, 150)}...`);

    // 3. Operations & QA
    console.log("\n--- 3. 기술 검토 및 배포 (Ops Team) ---");
    // Combining content and design for review
    const deploymentPlan = `Content: ${marketingReport.contentDraft}\nDesign: ${designReport.uiComponents}`;
    const opsReport = await ops.reviewDeployment(deploymentPlan);

    console.log(`\n🛡️ [QA 담당자]:\n${opsReport.qaReport.substring(0, 150)}...`);
    console.log(`\n🔧 [테크 리드]:\n${opsReport.signOff}\n`);

    console.log("✅ 회의 종료. 승인된 작업이 작업 큐에 등록되었습니다.");
}

runFullCompanyBriefing();
