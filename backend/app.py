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

SUSPICIOUS_TLDS = ["ru", "tk", "ml", "ga", "cf", "xyz", "top"]
PHISHING_KEYWORDS = [
    "login", "verify", "secure", "update",
    "account", "signin", "bank", "auth",
    "wallet", "recovery", "confirm"
]

BRANDS = ["paypal", "google", "facebook", "instagram", "amazon", "microsoft"]


def calculate_risk_score(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()

    risk_score = 0
    reasons = []

    # 1. IP Address instead of domain
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
        risk_score += 30
        reasons.append("Uses IP address instead of domain.")

    # 2. Suspicious TLD
    tld = domain.split(".")[-1]
    if tld in SUSPICIOUS_TLDS:
        risk_score += 20
        reasons.append(f"Suspicious TLD detected (. {tld})")

    # 3. Too many subdomains
    if domain.count(".") > 3:
        risk_score += 15
        reasons.append("Too many subdomains.")

    # 4. Brand impersonation
    for brand in BRANDS:
        if brand in domain and not domain.endswith(f"{brand}.com"):
            risk_score += 25
            reasons.append(f"Possible brand impersonation ({brand}).")

    # 5. Phishing keywords
    if any(keyword in url.lower() for keyword in PHISHING_KEYWORDS):
        risk_score += 15
        reasons.append("Contains phishing-related keywords.")

    # 6. Long URL
    if len(url) > 120:
        risk_score += 10
        reasons.append("Unusually long URL.")

    # 7. @ symbol trick
    if "@" in url:
        risk_score += 25
        reasons.append("Contains '@' redirection trick.")

    return risk_score, reasons


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "URL is required"}), 400

        risk_score, reasons = calculate_risk_score(url)

        # VirusTotal Check
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        response = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers={"x-apikey": VT_API_KEY}
        )

        malicious = 0
        suspicious = 0

        if response.status_code == 200:
            result = response.json()
            stats = result['data']['attributes']['last_analysis_stats']
            malicious = stats.get('malicious', 0)
            suspicious = stats.get('suspicious', 0)

        # Combine VT score
        risk_score += (malicious * 20)
        risk_score += (suspicious * 10)

        # Final classification
        if risk_score >= 60:
            status = "Phishing Detected"
            recommendation = "🚨 Do NOT open this link."
        elif risk_score >= 30:
            status = "Suspicious Link"
            recommendation = "⚠️ High risk. Avoid entering sensitive data."
        else:
            status = "Likely Safe"
            recommendation = "✅ No strong phishing indicators detected."

        confidence = min(100, risk_score + 40)

        return jsonify({
            "status": status,
            "confidence": confidence,
            "risk_score": risk_score,
            "reasons": reasons,
            "recommendation": recommendation
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
