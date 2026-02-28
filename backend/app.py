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
    "wallet", "recovery", "confirm", "security"
]

BRANDS = ["paypal", "google", "facebook", "instagram", "amazon", "microsoft"]


def analyze_structure(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    risk = 0
    reasons = []

    # 1. HTTP instead of HTTPS
    if parsed.scheme != "https":
        risk += 15
        reasons.append("Uses insecure HTTP protocol.")

    # 2. Brand impersonation
    for brand in BRANDS:
        if brand in domain and not domain.endswith(f"{brand}.com"):
            risk += 40
            reasons.append(f"Brand impersonation detected ({brand}).")

    # 3. Phishing keywords
    if any(k in url.lower() for k in PHISHING_KEYWORDS):
        risk += 20
        reasons.append("Contains phishing-related keywords.")

    # 4. Suspicious TLD
    tld = domain.split(".")[-1]
    if tld in SUSPICIOUS_TLDS:
        risk += 20
        reasons.append(f"Suspicious top-level domain (.{tld}).")

    # 5. Too many subdomains
    if domain.count(".") > 3:
        risk += 15
        reasons.append("Excessive subdomains detected.")

    # 6. @ trick
    if "@" in url:
        risk += 30
        reasons.append("Contains '@' redirection trick.")

    # 7. IP address usage
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
        risk += 30
        reasons.append("Uses IP address instead of domain.")

    return risk, reasons


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "URL required"}), 400

        risk_score, reasons = analyze_structure(url)

        # VirusTotal Check
        malicious = 0
        suspicious = 0
        vt_found = False

        try:
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

            response = requests.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers={"x-apikey": VT_API_KEY},
                timeout=10
            )

            if response.status_code == 200:
                vt_found = True
                result = response.json()
                stats = result['data']['attributes']['last_analysis_stats']
                malicious = stats.get('malicious', 0)
                suspicious = stats.get('suspicious', 0)

        except Exception:
            pass

        # ---- FINAL CLASSIFICATION LOGIC ---- #

        # 1. If VT confirms malicious
        if malicious > 0:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": 98,
                "reasons": reasons + [f"VirusTotal flagged by {malicious} engines."],
                "risk_score": risk_score
            })

        # 2. If strong structural phishing (brand + keywords)
        if risk_score >= 50:
            return jsonify({
                "status": "Phishing Detected",
                "confidence": min(95, risk_score + 20),
                "reasons": reasons,
                "risk_score": risk_score
            })

        # 3. If moderate suspicion
        if risk_score >= 25 or suspicious > 2:
            return jsonify({
                "status": "Unverified",
                "confidence": 70,
                "reasons": reasons,
                "risk_score": risk_score
            })

        # 4. Only mark Safe if:
        # - Low structural risk
        # - AND VT has data
        # - AND no suspicious flags
        if risk_score < 25 and vt_found and malicious == 0 and suspicious == 0:
            return jsonify({
                "status": "Safe",
                "confidence": 90,
                "reasons": ["No structural risk and no VT flags."],
                "risk_score": risk_score
            })

        # 5. Otherwise Unverified
        return jsonify({
            "status": "Unverified",
            "confidence": 60,
            "reasons": reasons if reasons else ["Insufficient data to classify."],
            "risk_score": risk_score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
