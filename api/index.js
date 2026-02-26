import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
  // 1. Setup CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { url } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel" });
    }

    // 2. Stable API Endpoint (v1 is most reliable for 1.5-flash)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    // 3. Handle API Errors (like Quota Exceeded)
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      const errorMessage = data.error?.message || "Gemini API failure";
      return res.status(response.status).json({ error: errorMessage });
    }

    // 4. Extract and Clean JSON Response
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let cleaned = resultText.replace(/```json|```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", resultText);
      return res.status(500).json({ error: "AI returned invalid JSON format" });
    }

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
