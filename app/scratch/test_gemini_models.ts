import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModel(modelName: string, apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
    });
    const resp = await model.generateContent("Hola, responde con la palabra 'OK'");
    console.log(`✅ Model ${modelName} succeeded! Response: "${resp.response.text().trim()}"`);
    return true;
  } catch (err: any) {
    console.log(`❌ Model ${modelName} failed. Error: ${err.message}`);
    return false;
  }
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");

  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
  ];

  for (const m of models) {
    await testModel(m, apiKey);
  }
}

run();
