import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    // API URL using stable gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

   // 1. First, define the URL
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

// 2. Then, use it in fetch correctly
const response = await fetch(apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: `Analyze this URL for phishing: ${url}. Return ONLY raw JSON. No markdown. Format: { "isPhishing": boolean, "confidence": number, "reasoning": string, "threatType": string, "recommendation": string }`
      }]
    }]
  })
});

    const data = await response.json();

    // ఎర్రర్ వస్తే దాన్ని క్లియర్ గా పంపడం
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data.error || "Gemini API failure" });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) return res.status(500).json({ error: "Empty response from AI" });

    // JSON క్లీనింగ్
    let cleaned = resultText.trim();
    if (cleaned.includes("```json")) {
      cleaned = cleaned.split("```json")[1].split("```")[0];
    } else if (cleaned.includes("```")) {
      cleaned = cleaned.split("```")[1].split("```")[0];
    }

    return res.status(200).json(JSON.parse(cleaned));

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
