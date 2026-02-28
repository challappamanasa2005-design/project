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
      console.error("Analysis Error:", err);
      setError("Server is waking up. Please wait 30 seconds and try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#0f121d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    color: "white",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#1e2230",
    padding: "40px",
    borderRadius: "28px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #3f445e",
    backgroundColor: "#2a2f45",
    color: "white",
    fontSize: "16px",
    marginBottom: "20px",
    boxSizing: "border-box",
    outline: "none",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#5c5cfc",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  };

  // UI Logic Helper
  const isSafe = result?.status === "safe" || result?.risk_score === 0;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "38px", marginBottom: "32px", fontWeight: "bold" }}>
          LinkGuard AI
        </h1>

        <input
          type="text"
          placeholder="Enter URL (e.g., http://google.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button onClick={analyzeUrl} style={buttonStyle} disabled={loading}>
          {loading ? "Scanning..." : "Scan Link"}
        </button>

        {error && <p style={{ color: "#ff4d4d", marginTop: "20px" }}>{error}</p>}

        {result && (
          <div style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{isSafe ? "✅" : "⚠️"}</span>
              <h2 style={{ color: isSafe ? "#00ff88" : "#ff4d4d", margin: 0 }}>
                {isSafe ? "Safe Link" : "Phishing Link Detected"}
              </h2>
            </div>

            <p style={{ color: "#aaa", marginTop: "12px" }}>
              Confidence Score: <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d", fontWeight: "bold" }}>{result.confidence}%</span>
            </p>

            <div style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.03)", 
              padding: "20px", 
              borderRadius: "20px", 
              marginTop: "20px", 
              textAlign: "left" 
            }}>
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong style={{ color: "#888" }}>Security Status:</strong> <br />
                <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d", fontWeight: "bold" }}>
                   {isSafe ? "Verified Safe" : "Potential Phishing Attempt"}
                </span>
              </p>
              
              <p style={{ margin: "15px 0 8px 0", fontSize: "14px" }}>
                <strong style={{ color: "#888" }}>Detailed Analysis:</strong> <br />
                {isSafe 
                  ? "This URL matches known safe patterns and has 0 security flags." 
                  : `Security engines flagged this URL ${result.risk_score} times.`}
              </p>

              <div style={{ 
                marginTop: "20px", 
                padding: "12px", 
                borderRadius: "10px", 
                backgroundColor: isSafe ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 77, 77, 0.1)",
                border: `1px solid ${isSafe ? "#00ff88" : "#ff4d4d"}`
              }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                  Final Recommendation: <br />
                  <span style={{ color: isSafe ? "#00ff88" : "#ff4d4d" }}>
                    {isSafe ? "✓ This link is safe to open." : "✗ Do not click this link."}
                  </span>
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
