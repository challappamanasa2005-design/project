import React, { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeUrl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/analyze", { url });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#0f121d", // Dark background from your pic
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: "white",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#1e2230",
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #3f445e",
    backgroundColor: "#2a2f45",
    color: "white",
    fontSize: "16px",
    marginBottom: "20px",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#5c5cfc", // Vibrant purple/blue from your pic
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  };

  const resultBoxStyle: React.CSSProperties = {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    textAlign: "left",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "36px", marginBottom: "30px", fontWeight: "bold" }}>
          LinkGuard AI
        </h1>

        <input
          type="text"
          placeholder="http://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={inputStyle}
        />

        <button 
          onClick={analyzeUrl} 
          style={buttonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4a4af0")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#5c5cfc")}
        >
          {loading ? "Scanning..." : "Scan Link"}
        </button>

        {result && (
          <div style={resultBoxStyle}>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
               <span style={{ color: result.status === 'safe' ? '#00ff88' : '#ff4d4d', fontSize: '24px', fontWeight: 'bold' }}>
                 {result.status === 'safe' ? "✓ Safe Link" : "⚠ Warning"}
               </span>
               <p style={{ fontSize: '14px', color: '#aaa', marginTop: '10px' }}>
                 Confidence Score: <span style={{ color: '#00ff88' }}>{result.confidence}%</span>
               </p>
            </div>
            
            <hr style={{ border: '0.5px solid #3f445e', margin: '20px 0' }} />
            
            <p><strong>Threat Type:</strong> {result.status}</p>
            <p><strong>Recommendation:</strong> {result.recommendation}</p>
            
            {result.reasons && (
              <ul style={{ paddingLeft: "20px", fontSize: '14px', color: '#ccc' }}>
                {result.reasons.map((reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
