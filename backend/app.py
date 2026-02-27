import base64
import requests
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

VT_API_KEY = os.getenv("VT_API_KEY")

def check_suspicious(url):
    domain = urlparse(url).netloc.lower()
    # 1. Typosquatting (numbers in brand names like g000gle)
    if re.search(r'[0-9]{2,}', domain) and any(x in domain for x in ['google', 'paypal', 'faceb']):
        return "🚨 Suspicious Pattern: Typosquatting detected (using numbers to mimic brands)."
    # 2. Phishing Keywords
    keywords = ['login', 'secure', 'verify', 'update', 'banking']
    if any(kw in url.lower() for kw in keywords):
        return "⚠️ Caution: URL contains phishing-related keywords."
    return None

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")
        
        # Phase 1: Local Heuristic Check
        suspicious_reason = check_suspicious(url)

        # Phase 2: VirusTotal API Check
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        response = requests.get(f"https://www.virustotal.com/api/v3/urls/{url_id}", 
                                headers={"x-apikey": VT_API_KEY})
        
        malicious = 0
        if response.status_code == 200:
            malicious = response.json()['data']['attributes']['last_analysis_stats'].get('malicious', 0)

        # Final Decision
        if malicious > 0:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": 100,
                "reasoning": f"Flagged by {malicious} security engines.",
                "recommendation": "🚨 DANGER: Do not open this link!"
            })
        elif suspicious_reason:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": 85,
                "reasoning": suspicious_reason,
                "recommendation": "🚨 WARNING: This link mimics a real site."
            })
        else:
            return jsonify({
                "status": "Safe Link",
                "confidence": 95,
                "reasoning": "No suspicious patterns found.",
                "recommendation": "✅ Safe to open."
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
