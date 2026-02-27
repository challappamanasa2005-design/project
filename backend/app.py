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
        
        if response.status_code == 200:
            stats = response.json()['data']['attributes']['last_analysis_stats']
            malicious = stats['malicious']
            
            # Phishing Logic
            is_phishing = malicious > 0
            # Confidence Calculation
            confidence = min(100, malicious * 25) if is_phishing else 95
            
            return jsonify({
                "isPhishing": is_phishing,
                "confidence": confidence,
                "reasoning": f"Security engines flagged this URL {malicious} times.",
                "recommendation": "⚠️ DANGER: Do not open this link!" if is_phishing else "✅ Safe to open."
            })
        else:
            return jsonify({"isPhishing": False, "confidence": 0, "reasoning": "New URL, no data yet."})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
