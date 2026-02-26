import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data or "url" not in data:
            return jsonify({"error": "URL is required"}), 400

        url = data["url"]

        # 🔐 Strong structured prompt
        prompt = f"""
You are a cybersecurity phishing detection system.

Analyze the following URL for phishing risk.

URL: {url}

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include explanations outside JSON.

Use this exact schema:

{{
  "isPhishing": boolean,
  "confidence": integer,
  "reasoning": string,
  "threatType": string,
  "recommendation": string
}}

Rules:
- confidence must be an integer between 0 and 100.
- confidence represents the probability that the URL is phishing.
- If isPhishing is true, confidence must be 60 or higher.
- If isPhishing is false, confidence must be 40 or lower.
- Do NOT return decimals.
- Do NOT wrap in code blocks.
"""

        # Force JSON response from Gemini
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )

        # Gemini already returns structured JSON in text
        result_text = response.text.strip()

        # Debug print (optional)
        print("RAW MODEL OUTPUT:", result_text)

        # Parse safely
        parsed = genai.types.content_types.to_dict(response.candidates[0].content.parts[0].text) if False else None
        # Actually safer:
        import json
        parsed = json.loads(result_text)

        return jsonify(parsed)

    except Exception as e:
        print("SERVER ERROR:", str(e))
        return jsonify({"error": "Analysis failed", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
