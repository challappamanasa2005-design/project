import { useState } from "react";

type ScanResult = {
  status: "SAFE" | "PHISHING";
  confidence: number;
  threat: string;
  message: string;
};

export default function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    // 🔴 Replace this block with your real API call
    setTimeout(() => {
      const isSafe = !url.toLowerCase().includes("phishing");

      const response: ScanResult = {
        status: isSafe ? "SAFE" : "PHISHING",
        confidence: isSafe ? 95 : 88,
        threat: "General Security Analysis",
        message: isSafe
          ? "No malicious indicators detected."
          : "Suspicious domain patterns detected.",
      };

      setResult(response);
      setLoading(false);
    }, 2000);
  };

  const getResultStyles = () => {
    if (!result) return "";
    return result.status === "SAFE"
      ? "border-green-500 bg-green-900/20"
      : "border-red-500 bg-red-900/20";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">🛡 LinkGuard AI</h1>
          <p className="text-gray-400 text-sm">
            AI-powered URL Threat Detection Engine
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter URL to analyze..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan Link"}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className={`border rounded-xl p-6 space-y-4 ${getResultStyles()}`}>
            <h2
              className={`text-xl font-bold ${
                result.status === "SAFE"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {result.status === "SAFE"
                ? "✅ Safe Link"
                : "⚠ High Risk Detected"}
            </h2>

            {/* Confidence Bar */}
            <div>
              <p className="text-sm text-gray-400 mb-1">
                Confidence: {result.confidence}%
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.status === "SAFE"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Threat Type: {result.threat}
              </p>
              <p className="text-gray-300 mt-2">{result.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
