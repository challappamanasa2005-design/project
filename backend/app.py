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

    # 1. Typosquatting
    if re.search(r'[0-9]{2,}', domain) and any(x in domain for x in ['google', 'paypal', 'faceb']):
        return "Typosquatting detected (numbers mimicking brand names)."

    # 2. Phishing Keywords
    keywords = ['login', 'secure', 'verify', 'update', 'banking']
    if any(kw in url.lower() for kw in keywords):
        return "URL contains phishing-related keywords."

    return None


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "URL is required"}), 400

        # Phase 1: Local heuristic
        suspicious_reason = check_suspicious(url)

        # Phase 2: VirusTotal Check
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        response = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers={"x-apikey": VT_API_KEY}
        )

        # If URL not found in VirusTotal database
        if response.status_code == 404:
            return jsonify({
                "status": "Unverified Link",
                "confidence": 50,
                "reasoning": "This URL is not found in VirusTotal database.",
                "recommendation": "⚠️ Proceed with caution. This link is new or unscanned."
            })

        if response.status_code != 200:
            return jsonify({
                "status": "Unverified Link",
                "confidence": 40,
                "reasoning": "VirusTotal API error or no scan data available.",
                "recommendation": "⚠️ Unable to verify this link."
            })

        result = response.json()
        stats = result['data']['attributes']['last_analysis_stats']

        malicious = stats.get('malicious', 0)
        suspicious = stats.get('suspicious', 0)
        harmless = stats.get('harmless', 0)
        total_scans = sum(stats.values())

        # Final Decision Logic
        if malicious > 0:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": 100,
                "reasoning": f"Flagged by {malicious} security engines.",
                "recommendation": "🚨 Do NOT open this link."
            })

        elif suspicious > 2:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": 85,
                "reasoning": f"{suspicious} engines marked it suspicious.",
                "recommendation": "🚨 High risk link."
            })

        elif suspicious_reason:
            return jsonify({
                "status": "Unverified Link",
                "confidence": 70,
                "reasoning": suspicious_reason,
                "recommendation": "⚠️ Looks suspicious but not confirmed malicious."
            })

        elif harmless > 5 and malicious == 0:
            return jsonify({
                "status": "Safe Link",
                "confidence": 95,
                "reasoning": "Multiple security engines marked it harmless.",
                "recommendation": "✅ Safe to open."
            })

        else:
            return jsonify({
                "status": "Unverified Link",
                "confidence": 60,
                "reasoning": "Not enough data to classify this link.",
                "recommendation": "⚠️ Proceed carefully."
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
