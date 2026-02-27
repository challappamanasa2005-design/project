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

    if response.status_code == 200:
        data = response.json()
        # Look at the 'malicious' flag count from 70+ security engines
        stats = data['data']['attributes']['last_analysis_stats']
        malicious_hits = stats['malicious']
        
        print(f"\n--- Results for: {target_url} ---")
        print(f"Malicious Detections: {malicious_hits}")
        
        if malicious_hits > 0:
            print("Verdict: 🚨 DANGER! This looks like a phishing site.")
        else:
            print("Verdict: ✅ Safe. No security engines flagged this site.")
    elif response.status_code == 404:
        print("\nThis URL hasn't been scanned yet. Try submitting it for a scan first.")
    else:
        print(f"Error {response.status_code}: {response.text}")

# 3. Ask user for a URL to check
user_input = input("Enter a website URL to analyze: ")
check_url_safety(user_input)
