import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "placeholder") {
    console.error("❌ No GEMINI_API_KEY found in env!");
    return;
  }

  console.log("🔑 Using API Key:", apiKey.substring(0, 10) + "...");

  // Method 1: SDK
  try {
    console.log("\n🤖 Testing official SDK with model 'gemini-1.5-flash'...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hola, responde en 5 palabras.");
    console.log("✅ SDK Success! Response:", result.response.text());
  } catch (err: any) {
    console.error("❌ SDK Failed:", err.message);
  }

  // Method 2: Fetch v1
  try {
    console.log("\n🌐 Testing Fetch v1 with model 'gemini-1.5-flash'...");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hola, responde en 5 palabras." }] }] })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Fetch v1 Success! Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.error("❌ Fetch v1 Failed:", data);
    }
  } catch (err: any) {
    console.error("❌ Fetch v1 Error:", err.message);
  }

  // Method 3: Fetch v1beta with 'gemini-1.5-flash'
  try {
    console.log("\n🌐 Testing Fetch v1beta with model 'gemini-1.5-flash'...");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hola, responde en 5 palabras." }] }] })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Fetch v1beta Success! Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.error("❌ Fetch v1beta Failed:", data);
    }
  } catch (err: any) {
    console.error("❌ Fetch v1beta Error:", err.message);
  }
}

testGemini();
