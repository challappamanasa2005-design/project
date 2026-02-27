import base64
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

VT_API_KEY = os.getenv("VT_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")
        if not url:
            return jsonify({"error": "URL is required"}), 400

        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": VT_API_KEY}

        response = requests.get(api_url, headers=headers)
        
        if response.status_code == 200:
            stats = response.json()['data']['attributes']['last_analysis_stats']
            malicious = stats.get('malicious', 0)
            harmless = stats.get('harmless', 0)
            
            # 1. Phishing Case (Red)
            if malicious > 0:
                return jsonify({
                    "isPhishing": True,
                    "confidence": min(100, malicious * 25),
                    "status": "Phishing Detected",
                    "reasoning": f"Flagged by {malicious} security engines.",
                    "recommendation": "🚨 DO NOT OPEN: Dangerous link!"
                })
            # 2. Safe Case (Green)
            elif harmless > 0:
                return jsonify({
                    "isPhishing": False,
                    "confidence": 95,
                    "status": "Safe Link",
                    "reasoning": "Verified safe by security engines.",
                    "recommendation": "✅ Safe to open."
                })
            # 3. New/Unverified Case (Yellow)
            else:
                return jsonify({
                    "isPhishing": False,
                    "confidence": 0,
                    "status": "Unverified Link",
                    "reasoning": "New URL, no data yet.",
                    "recommendation": "⚠️ Caution: Link is unknown."
                })
        return jsonify({"error": "API Error"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
