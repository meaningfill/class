import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        console.log("Listing models...");
        const response = await genAI.models.list();
        console.log("Got response keys:", Object.keys(response));

        // Convert to plain object/array for stringify
        const data = response.models ? response.models : response;

        fs.writeFileSync('debug_models.json', JSON.stringify(data, null, 2));
        console.log("Wrote debug_models.json");
    } catch (e) {
        console.error("List failed:", e);
    }
}

listModels();
