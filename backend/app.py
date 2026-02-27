import os
import base64
import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask
app = Flask(__name__)
CORS(app)

# VirusTotal API Key (Vercel lo VT_API_KEY ani name pettandi)
VT_API_KEY = os.getenv("VT_API_KEY")

def get_virus_total_report(target_url):
    # VirusTotal v3 requires URL to be base64 encoded
    url_id = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    
    headers = {
        "x-apikey": VT_API_KEY,
        "accept": "application/json"
    }

    response = requests.get(api_url, headers=headers)
    return response

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data or "url" not in data:
            return jsonify({"error": "URL is required"}), 400

        url = data["url"]
        
        # Call VirusTotal API
        response = get_virus_total_report(url)

        if response.status_code == 200:
            vt_data = response.json()
            stats = vt_data['data']['attributes']['last_analysis_stats']
            
            # Logic to determine if it's phishing
            malicious_count = stats['malicious']
            is_phishing = malicious_count > 0
            
            # Confidence calculation (simple logic)
            confidence = min(100, malicious_count * 20) if is_phishing else 10

            # Matching your previous JSON schema exactly
            result = {
                "isPhishing": is_phishing,
                "confidence": confidence,
                "reasoning": f"Found {malicious_count} security engines flagging this URL.",
                "threatType": "Phishing/Malware" if is_phishing else "None",
                "recommendation": "Do NOT visit this site!" if is_phishing else "Site appears safe, but stay cautious."
            }
            return jsonify(result)

        elif response.status_code == 404:
            # If site is not in database
            return jsonify({
                "isPhishing": False,
                "confidence": 0,
                "reasoning": "This URL is not in the security database yet.",
                "threatType": "Unknown",
                "recommendation": "Proceed with extreme caution as this is a new link."
            })
        else:
            return jsonify({"error": "VirusTotal API Error", "details": response.text}), response.status_code

    except Exception as e:
        print("SERVER ERROR:", str(e))
        return jsonify({"error": "Analysis failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
