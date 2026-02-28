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
      const response = await axios.post("http://localhost:5000/analyze", {
        url,
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Advanced Phishing Detection Tool</h2>

      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "10px" }}
      />

      <button onClick={analyzeUrl} style={{ marginLeft: "10px", padding: "10px" }}>
        Analyze
      </button>

      {loading && <p>Analyzing...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Status: {result.status}</h3>
          <p>Confidence: {result.confidence}%</p>
          <p>Risk Score: {result.risk_score}</p>
          <p>Recommendation: {result.recommendation}</p>

          <h4>Reasons:</h4>
          <ul>
            {result.reasons?.map((reason: string, index: number) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
