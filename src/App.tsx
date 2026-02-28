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
      // Pointing to your live Render backend
      const response = await axios.post("https://project-e0sv.onrender.com/analyze", {
        url: url,
      });
      setResult(response.data);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError("Server is waking up or unreachable. Please try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles to match your 'LinkGuard AI' UI ---
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#0f121d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    transition: "background 0.3s",
    opacity: loading ? 0.7 : 1,
  };

  const resultCardStyle: React.CSSProperties = {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    textAlign: "left",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "38px", marginBottom: "32px", fontWeight: "bold", letterSpacing: "-1px" }}>
          LinkGuard AI
        </h1>

        <input
          type="text"
          placeholder="http://microsoft.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button 
          onClick={analyzeUrl} 
          style={buttonStyle} 
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan Link"}
        </button>

        {error && (
          <p style={{ color: "#ff4d4d", marginTop: "20px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {result && (
          <div style={{ marginTop: "30px" }}>
            {/* Dynamic Status Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{result.status === "safe" ? "✅" : "⚠️"}</span>
              <h2 style={{ color: result.status === "safe" ? "#00ff88" : "#ff4d4d", margin: 0 }}>
                {result.status === "safe" ? "Safe Link" : "Threat Detected"}
              </h2>
            </div>

            <p style={{ color: "#aaa", marginTop: "12px", textAlign: "center" }}>
              Confidence Score: <span style={{ color: "#00ff88", fontWeight: "bold" }}>{result.confidence}%</span>
            </p>

            {/* Detailed Info Box */}
            <div style={resultCardStyle}>
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong style={{ color: "#888" }}>Threat Type:</strong> <br />
                <span style={{ color: "#5c5cfc" }}>General Security Analysis</span>
              </p>
              
              <p style={{ margin: "15px 0 8px 0", fontSize: "14px" }}>
                <strong style={{ color: "#888" }}>Detailed Analysis:</strong> <br />
                Security engines flagged this URL {result.risk_score || 0} times.
              </p>

              <div style={{ 
                marginTop: "20px", 
                padding: "12px", 
                borderRadius: "10px", 
                backgroundColor: result.status === "safe" ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 77, 77, 0.1)",
                border: `1px solid ${result.status === "safe" ? "#00ff88" : "#ff4d4d"}`
              }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                  Final Recommendation: <br />
                  <span style={{ color: result.status === "safe" ? "#00ff88" : "#ff4d4d" }}>
                    {result.status === "safe" ? "✓ Safe to open." : "✗ Do not open."}
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
