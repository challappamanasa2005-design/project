import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Vercel serverless function handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).send("");
  }

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Analyze this URL for phishing: " + url + ". Return ONLY raw JSON. Do NOT wrap in markdown. Response must start with { and end with }. Format: { \"isPhishing\": boolean, \"confidence\": number, \"reasoning\": string, \"threatType\": string, \"recommendation\": string }"
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json(data);
    }

    const resultText = data.candidates[0].content.parts[0].text;

    if (!resultText) {
      console.error("Empty AI response:", data);
      return res.status(500).json({ error: "Empty AI response" });
    }

    // Clean markdown using simple string operations
    let cleaned = resultText;
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("RAW AI RESPONSE:", resultText);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
