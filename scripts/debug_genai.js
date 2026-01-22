import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    console.log("No API Key");
} else {
    try {
        const client = new GoogleGenAI({ apiKey });
        console.log("Client created.");
        console.log("Keys:", Object.keys(client));
        console.log("Prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
    } catch (e) {
        console.error(e);
    }
}
