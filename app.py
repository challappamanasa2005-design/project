import os
import base64
import requests
from dotenv import load_dotenv

# 1. Securely load your API key from the .env file
load_dotenv()
API_KEY = os.getenv("VT_API_KEY")

def check_url_safety(target_url):
    # VirusTotal v3 requires URLs to be Base64 encoded before sending
    url_id = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
    
    # API Endpoint for fetching existing URL reports
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    headers = {
        "x-apikey": API_KEY,
        "accept": "application/json"
    }

    # 2. Send the request to VirusTotal
    response = requests.get(api_url, headers=headers)

   # app.py lo analyze function lo ee change cheyandi
if response.status_code == 200:
    stats = response.json()['data']['attributes']['last_analysis_stats']
    malicious = stats['malicious']
    suspicious = stats['suspicious']
    total_flags = malicious + suspicious
    
    if total_flags > 0:
        is_phishing = True
        confidence = min(100, total_flags * 20)
        reasoning = f"Security engines flagged this URL {total_flags} times."
        recommendation = "🚨 DANGER: Do not open this link!"
    elif stats['harmless'] == 0 and malicious == 0:
        # Idhi kotha URL ithe (No data case)
        is_phishing = False
        confidence = 0
        reasoning = "New URL detected. No security data available yet."
        recommendation = "⚠️ Use caution: This link is unverified."
    else:
        is_phishing = False
        confidence = 95
        reasoning = "Verified safe by security engines."
        recommendation = "✅ Safe to open."
# 3. Ask user for a URL to check
user_input = input("Enter a website URL to analyze: ")
check_url_safety(user_input)
