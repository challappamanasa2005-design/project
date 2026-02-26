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
  
      const response = await fetch("/api", { 
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: formattedUrl }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to analyze link");
      }

      setResult(data);
    } catch (err) {
      setError(data.error.message || "Analysis failed")
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

        {/* FORM */}
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

        {/* ERROR */}
       {error && (
  <div className="mt-6 text-red-400 text-center font-medium">
    {typeof error === 'string' ? error : JSON.stringify(error)}
  </div>
)}

        {/* RESULT */}
        {result && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center justify-center gap-3">
              {result.isPhishing ? (
                <>
                  <ShieldAlert className="text-red-400" size={28} />
                  <span className="text-2xl font-bold text-red-400">
                    Phishing Detected
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="text-green-400" size={28} />
                  <span className="text-2xl font-bold text-green-400">
                    Safe Link
                  </span>
                </>
              )}
            </div>
            <div className="text-center text-slate-300">
              Confidence: <span className="font-semibold">{result.confidence}%</span>
            </div>
            <div className="bg-white/5 p-6 rounded-xl space-y-4 text-sm text-slate-300">
              <div>
                <span className="font-semibold text-white">Threat Type:</span>{" "}
                {result.threatType || "None"}
              </div>
              <div>
                <span className="font-semibold text-white">Analysis:</span>
                <p className="mt-2">{result.reasoning}</p>
              </div>
              <div>
                <span className="font-semibold text-white">Recommendation:</span>
                <p className="mt-2">{result.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
