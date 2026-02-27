import os
import base64
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
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
        
        # URL encoding for VirusTotal
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": VT_API_KEY}

        response = requests.get(api_url, headers=headers)
        
       # app.py lo analyze function lo ee change cheyandi
if response.status_code == 200:
            stats = response.json()['data']['attributes']['last_analysis_stats']
            malicious = stats['malicious']
            
            if malicious > 0:
                return jsonify({
                    "isPhishing": True,
                    "confidence": min(100, malicious * 25),
                    "reasoning": f"Security engines flagged this URL {malicious} times.",
                    "recommendation": "🚨 DANGER: Do not open this link!"
                })
            elif stats['harmless'] > 0:
                return jsonify({
                    "isPhishing": False,
                    "confidence": 95,
                    "reasoning": "Verified as safe by security databases.",
                    "recommendation": "✅ Safe to open."
                })
            else:
                # Ee part kotha URLs (0 data) ni handle chestundhi
                return jsonify({
                    "isPhishing": False, 
                    "confidence": 0, 
                    "reasoning": "New URL detected. No security history found yet.",
                    "recommendation": "⚠️ Caution: This link is unverified. Be careful!"
                })
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
