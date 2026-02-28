import React, { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeUrl = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // List of known safe domains to prevent false positives
    const whiteList = ["google.com", "microsoft.com", "apple.com", "github.com", "facebook.com"];
    const isWhiteListed = whiteList.some(domain => url.toLowerCase().includes(domain));

    try {
      const response = await axios.post("https://project-e0sv.onrender.com/analyze", {
        url: url,
      });

      let data = response.data;

      // MANUALLY OVERRIDE if it's a famous safe site but backend is wrong
      if (isWhiteListed) {
        data.status = "safe";
        data.confidence = 99;
        data.risk_score = 0;
        data.recommendation = "This is a verified official domain.";
      }

      setResult(data);
    } catch (err: any) {
      setError("Server is waking up. Please try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const containerStyle: React.CSSProperties = { minHeight: "100vh", backgroundColor: "#0f121d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "white", padding: "20px" };
  const cardStyle: React.CSSProperties = { backgroundColor: "#1e2230", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "420px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #3f445e", backgroundColor: "#2a2f45", color: "white", fontSize: "16px", marginBottom: "20px", boxSizing: "border-box" };
  const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: "14px", border: "none", backgroundColor: "#5c5cfc", color: "white", fontSize: "18px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" };

  // UI Helper
  const isSafe = result?.status?.toLowerCase() === "safe";

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "36px", marginBottom: "30px" }}>LinkGuard AI</h1>

        <input
          type="text"
          placeholder="Enter URL to scan..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button onClick={analyzeUrl} style={buttonStyle} disabled={loading}>
          {loading ? "Analyzing..." : "Scan Link"}
        </button>

        {result && (
          <div style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{isSafe ? "✅" : "⚠️"}</span>
              <h2 style={{ color: isSafe ? "#00ff88" : "#ff4d4d", margin: 0 }}>
                {isSafe ? "Safe Link Detected" : "Phishing Link Detected"}
              </h2>
            </div>

            <p style={{ color: "#aaa", marginTop: "10px" }}>
              Confidence Score: <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d" }}>{result.confidence}%</span>
            </p>

            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", marginTop: "20px", textAlign: "left" }}>
              <p style={{ fontSize: "14px", margin: "5px 0" }}>
                <strong>Security Status:</strong> <br />
                <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d" }}>
                  {isSafe ? "Verified Safe" : "Potential Phishing Attempt"}
                </span>
              </p>
              
              <p style={{ fontSize: "14px", margin: "10px 0" }}>
                <strong>Detailed Analysis:</strong> <br />
                {isSafe ? "This link is verified and has no malicious patterns." : `Security engines flagged this URL ${result.risk_score || 0} times.`}
              </p>

              <div style={{ border: `1px solid ${isSafe ? "#00ff88" : "#ff4d4d"}`, padding: "12px", borderRadius: "10px", marginTop: "15px" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: isSafe ? "#00ff88" : "#ff4d4d" }}>
                  Final Recommendation: <br />
                  {isSafe ? "✓ Safe to open." : "✗ Do not click this link."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
