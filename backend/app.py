from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
# IMPORTANT: This allows your Vercel frontend to talk to this Render backend
CORS(app)

# 1. Manual Whitelist for famous safe domains
WHITELIST = [
    "google.com", "microsoft.com", "facebook.com", 
    "github.com", "apple.com", "linkedin.com", "amazon.com"
]

def check_link_security(url):
    # Clean the URL for checking
    clean_url = url.lower().replace("https://", "").replace("http://", "").replace("www.", "")
    
    # Check if the domain starts with a whitelisted name
    is_whitelisted = any(clean_url.startswith(domain) for domain in WHITELIST)
    
    if is_whitelisted:
        return {
            "status": "safe",
            "confidence": 99,
            "risk_score": 0,
            "recommendation": "This is a verified official domain."
        }
    
    # 2. Heuristic Phishing Checks (Example logic)
    # Check for suspicious patterns like 'login', 'verify', or 'update' in unknown domains
    suspicious_keywords = ['login', 'verify', 'update', 'banking', 'secure']
    has_suspicious_word = any(word in clean_url for word in suspicious_keywords)
    
    # If it's not whitelisted and has suspicious words, flag it
    if has_suspicious_word:
        return {
            "status": "phishing",
            "confidence": 85,
            "risk_score": 3,
            "recommendation": "Do not click this link. It contains suspicious keywords."
        }

    # Default fallback for unknown but not explicitly suspicious links
    return {
        "status": "safe",
        "confidence": 75,
        "risk_score": 0,
        "recommendation": "No immediate threats found, but proceed with caution."
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    url = data.get("url", "")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Get results from our security logic
    result = check_link_security(url)
    
    return jsonify(result)

if __name__ == '__main__':
    # Render uses the PORT environment variable
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
