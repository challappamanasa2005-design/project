import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "API Key missing in Vercel settings" });

    
    // Change v1beta to v1
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Analyze this URL for phishing: ${url}. Return ONLY raw JSON. No markdown. Format: { "isPhishing": boolean, "confidence": number, "reasoning": string, "threatType": string, "recommendation": string }` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean JSON from AI response
    let cleaned = resultText.replace(/```json|```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleaned));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
