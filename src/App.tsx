/**
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

interface LinkAnalysis {
  isPhishing: boolean;
  confidence: number;
  reasoning: string;
  threatType: string;
  recommendation: string;
  status: string; // Backend status field kosam
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
      // ✅ Render URL with /analyze endpoint
      const BACKEND_URL = "https://project-e0sv.onrender.com/analyze";

      const response = await fetch(BACKEND_URL, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to analyze link");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-white">
      <div className="glass-card w-full max-w-2xl p-10 rounded-3xl bg-slate-900/50 border border-white/10 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-10 flex items-center justify-center gap-3">
          <ShieldCheck className="text-indigo-500" size={40} />
          LinkGuard AI
        </h1>

        <form onSubmit={handleAnalyze} className="flex flex-col gap-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan (e.g., google.com)"
            className="w-full px-5 py-4 rounded-xl outline-none bg-white/5 border border-white/10 focus:border-indigo-500 transition"
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
                Scanning Link...
              </>
            ) : (
              "Scan Link"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 text-red-400 text-center font-medium bg-red-400/10 p-4 rounded-xl border border-red-500/20">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center gap-4 text-center">
              
              {/* status display with colors */}
              <h2 className={`text-3xl font-bold flex items-center gap-2 ${
                result.status === "Phishing Detected" ? "text-red-500" : 
                result.status === "Safe Link" ? "text-green-500" : "text-yellow-500"
              }`}>
                {result.status === "Phishing Detected" ? <ShieldAlert size={32} /> : 
                 result.status === "Safe Link" ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
                {result.status}
              </h2>
              
              <p className="text-xl text-slate-300">
                Confidence Score: <span className={result.confidence > 70 || result.status === "Phishing Detected" ? "text-red-400" : "text-green-400"}>
                  {result.confidence}%
                </span>
              </p>

              <div className="w-full mt-4 p-5 bg-slate-950/50 rounded-xl space-y-4">
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Analysis Details</span>
                  <p className="text-slate-300 mt-1 italic">{result.reasoning}</p>
                </div>
                
                <div className={`p-4 rounded-lg font-bold ${
                  result.status === "Phishing Detected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                  result.status === "Safe Link" ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                  "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}>
                  {result.recommendation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
