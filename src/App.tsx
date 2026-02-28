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

    try {
      const response = await axios.post("https://project-e0sv.onrender.com/analyze", {
        url: url,
      });
      setResult(response.data);
    } catch (err: any) {
      setError("Server error. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES (Keep existing styles) ---
  const containerStyle: React.CSSProperties = { minHeight: "100vh", backgroundColor: "#0f121d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "white", padding: "20px" };
  const cardStyle: React.CSSProperties = { backgroundColor: "#1e2230", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "420px", textAlign: "center" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #3f445e", backgroundColor: "#2a2f45", color: "white", marginBottom: "20px" };
  const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: "14px", border: "none", backgroundColor: "#5c5cfc", color: "white", fontWeight: "bold", cursor: "pointer" };

  // --- FIXED LOGIC ---
  // We trust the 'status' from your backend. 
  // If status is 'safe', it's safe. If it's 'malicious' or 'phishing', it's a threat.
  const isSafe = result?.status?.toLowerCase() === "safe";
  const riskCount = result?.risk_score ?? 0; // Use 0 if risk_score is missing

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "32px", marginBottom: "30px" }}>LinkGuard AI</h1>

        <input
          type="text"
          placeholder="https://www.google.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button onClick={analyzeUrl} style={buttonStyle} disabled={loading}>
          {loading ? "Scanning..." : "Scan Link"}
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

            <div style={{ backgroundColor: "#2a2f45", padding: "20px", borderRadius: "16px", marginTop: "20px", textAlign: "left" }}>
              <p style={{ fontSize: "14px", margin: "5px 0" }}>
                <strong>Security Status:</strong> <br />
                <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d" }}>
                  {isSafe ? "Official Verified Link" : "Potential Phishing Attempt"}
                </span>
              </p>
              
              <p style={{ fontSize: "14px", margin: "10px 0" }}>
                <strong>Detailed Analysis:</strong> <br />
                {isSafe 
                  ? "No malicious patterns found." 
                  : `Security engines flagged this URL ${riskCount} times.`}
              </p>

              <div style={{ border: `1px solid ${isSafe ? "#00ff88" : "#ff4d4d"}`, padding: "10px", borderRadius: "8px", marginTop: "15px" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: isSafe ? "#00ff88" : "#ff4d4d" }}>
                  Final Recommendation: {isSafe ? "Safe to open." : "Do not click this link."}
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
