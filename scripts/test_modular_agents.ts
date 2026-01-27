
import { CateringTeam } from '../src/ai/teams/CateringTeam';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup Env for Node execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
    const team = new CateringTeam();

    const request = process.argv[2] || "다음 주 금요일 30명 세미나 간식. 예산 30만원. 핑거푸드 위주로.";
    console.log(`Testing with request: ${request}`);

    try {
        const result = await team.processInquiry(request);
        console.log("\n--- Final Result Check ---\n");
        console.log("SANDWICH PLAN:", result.menu.substring(0, 50) + "...");
        console.log("ESTIMATE:", result.estimate.substring(0, 50) + "...");
        console.log("EMAIL:", result.email.substring(0, 100) + "...");
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

run();
