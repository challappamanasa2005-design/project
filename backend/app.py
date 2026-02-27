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

def perform_heuristic_check(url):
    """URL loni suspicious patterns ni scan chestundi."""
    domain = urlparse(url).netloc.lower()
    
    # 1. Typosquatting Check (e.g., g000gle, paypa1)
    if re.search(r'[0-9]{3,}', domain) or '0' in domain or '1' in domain:
        if any(brand in domain for brand in ['google', 'paypal', 'microsoft', 'facebook', 'apple']):
             return "Suspicious: Potential typosquatting (using numbers to mimic famous brands)."

    # 2. Suspicious Keywords Check
    keywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'signin']
    if any(kw in url.lower() for kw in keywords):
        return "Suspicious: Phishing-related keywords found in the URL."

    # 3. Excessive Subdomains Check
    if domain.count('.') > 3:
        return "Suspicious: Too many subdomains, often used to hide the real source."

    return None

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")
        if not url:
            return jsonify({"error": "URL is required"}), 400

        # --- Phase 1: Local Heuristic Scan ---
        heuristic_result = perform_heuristic_check(url)

        # --- Phase 2: VirusTotal API Scan ---
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": VT_API_KEY}
        
        response = requests.get(api_url, headers=headers)
        malicious = 0
        if response.status_code == 200:
            stats = response.json()['data']['attributes']['last_analysis_stats']
            malicious = stats.get('malicious', 0)

        # --- Phase 3: Final Decision Engine ---
        
        # Scenario 1: VirusTotal confirmed it is malicious
        if malicious > 0:
            return jsonify({
                "isPhishing": True,
                "confidence": min(100, malicious * 25),
                "status": "Phishing Detected",
                "reasoning": f"Confirmed by {malicious} security engines.",
                "recommendation": "🚨 DO NOT OPEN: Dangerous link!"
            })

        # Scenario 2: VirusTotal results lekapoyina, mana Heuristic check flag chesthe
        elif heuristic_result:
            return jsonify({
                "isPhishing": True,
                "confidence": 85,
                "status": "Phishing Detected",
                "reasoning": heuristic_result,
                "recommendation": "🚨 WARNING: Suspicious patterns detected. Likely Phishing!"
            })

        # Scenario 3: Verified Safe
        else:
            return jsonify({
                "isPhishing": False,
                "confidence": 95,
                "status": "Safe Link",
                "reasoning": "No suspicious patterns or security flags found.",
                "recommendation": "✅ Safe to open."
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
