/**
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

interface LinkAnalysis {
  isPhishing: boolean;
  confidence: number;
  reasoning: string;
  threatType: string;
  recommendation: string;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<LinkAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // ⚠️ IMPORTANT: Ikkada "/api" badulu mee Codespaces URL/analyze pettali
      // Example: "https://turbo-fiesta...app.github.dev/analyze"
      const BACKEND_URL = "https://fuzzy-train-xrv4j9w476w24q7-5000.app.github.dev/analyze";

      const response = await fetch(BACKEND_URL, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.details || "Failed to analyze link");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-2xl p-10 rounded-3xl">
        <h1 className="text-4xl font-bold text-center mb-10">
          LinkGuard AI
        </h1>

        <form onSubmit={handleAnalyze} className="flex flex-col gap-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan..."
            className="glass-input w-full px-5 py-4 rounded-xl outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Scanning...
              </>
            ) : (
              "Scan Link"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-red-400 text-center font-medium bg-red-400/10 p-4 rounded-xl">
            {typeof error === 'string' ? error : "Error connecting to backend"}
          </div>
        )}
{/* App.tsx lo Result Display Section */}
{result && (
  <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
    <div className="flex flex-col items-center gap-4">
      {/* Dynamic Status & Color Logic */}
      <h2 className={`text-3xl font-bold flex items-center gap-2 ${
        result.status === "Phishing Detected" ? "text-red-500" : 
        result.status === "Safe Link" ? "text-green-500" : "text-yellow-500"
      }`}>
        {result.status === "Phishing Detected" ? "🚨" : result.status === "Safe Link" ? "✅" : "⚠️"}
        {result.status}
      </h2>
      
      <p className="text-xl text-slate-300">
        Confidence Score: <span className={result.confidence > 70 ? "text-red-400" : "text-green-400"}>
          {result.confidence}%
        </span>
      </p>

      <div className="w-full mt-4 p-4 bg-slate-900 rounded-lg">
        <p className="text-slate-400 text-sm italic">{result.reasoning}</p>
        <div className={`mt-3 p-3 rounded-md font-semibold text-center ${
          result.status === "Phishing Detected" ? "bg-red-900/30 text-red-200" : 
          result.status === "Safe Link" ? "bg-green-900/30 text-green-200" : "bg-yellow-900/30 text-yellow-200"
        }`}>
          {result.recommendation}
        </div>
      </div>
    </div>
  </div>
)}
            
            <div className="text-center text-slate-300">
              Confidence Score: <span className={`font-bold ${result.isPhishing ? 'text-red-400' : 'text-green-400'}`}>{result.confidence}%</span>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4 text-sm text-slate-300">
              <div>
                <span className="font-semibold text-white block mb-1">Threat Type:</span>
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">
                  {result.threatType || "General Security Analysis"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-white block mb-1">Detailed Analysis:</span>
                <p className="leading-relaxed">{result.reasoning}</p>
              </div>
              <div className={`p-4 rounded-lg ${result.isPhishing ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                <span className="font-semibold text-white block mb-1">Final Recommendation:</span>
                <p className="font-medium">{result.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
