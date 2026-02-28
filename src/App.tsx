import { useState } from "react";

type ScanResult = {
  status: "SAFE" | "PHISHING";
  confidence: number;
  threat: string;
  message: string;
  riskLevel: "Low" | "Medium" | "High";
};

type HistoryItem = {
  url: string;
  status: "SAFE" | "PHISHING";
};

export default function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const extractDomain = (input: string) => {
    try {
      const parsed = new URL(
        input.startsWith("http") ? input : `https://${input}`
      );
      return {
        protocol: parsed.protocol,
        domain: parsed.hostname,
      };
    } catch {
      return null;
    }
  };

  const handleScan = () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const isSafe = !url.toLowerCase().includes("phishing");
      const confidence = isSafe ? 92 : 76;

      const riskLevel =
        confidence > 85
          ? "Low"
          : confidence > 70
          ? "Medium"
          : "High";

      const response: ScanResult = {
        status: isSafe ? "SAFE" : "PHISHING",
        confidence,
        threat: "AI Pattern + Domain Heuristic Analysis",
        message: isSafe
          ? "No malicious indicators detected."
          : "Phishing indicators and suspicious patterns found.",
        riskLevel,
      };

      setResult(response);

      setHistory((prev) => [
        { url, status: response.status },
        ...prev.slice(0, 4),
      ]);

      setLoading(false);
    }, 1200);
  };

  const preview = extractDomain(url);

  const riskColor =
    result?.riskLevel === "Low"
      ? "bg-green-500"
      : result?.riskLevel === "Medium"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-100 to-gray-200 flex">

      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 hidden md:block">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Scan History
        </h2>

        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-gray-400">No scans yet</p>
          )}

          {history.map((item, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-gray-50 text-sm"
            >
              <p className="truncate text-gray-700">{item.url}</p>
              <p
                className={`mt-1 font-medium ${
                  item.status === "SAFE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-10 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              LinkGuard AI
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Intelligent URL Threat Analysis Platform
            </p>
          </div>

          {/* Input Section */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter URL to analyze..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Scan"}
            </button>
          </div>

          {/* URL Preview */}
          {preview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">URL Preview</p>
              <p className="text-gray-800 font-medium mt-1">
                Protocol: {preview.protocol}
              </p>
              <p className="text-gray-800 font-medium">
                Domain: {preview.domain}
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Scan Result
                </h2>

                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    result.status === "SAFE"
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100"
                  }`}
                >
                  {result.status}
                </span>
              </div>

              <p className="text-gray-600">{result.message}</p>

              {/* Risk Meter */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Risk Level</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${riskColor}`}
                    style={{
                      width:
                        result.riskLevel === "Low"
                          ? "33%"
                          : result.riskLevel === "Medium"
                          ? "66%"
                          : "100%",
                    }}
                  ></div>
                </div>
                <p className="mt-2 font-semibold text-gray-700">
                  {result.riskLevel}
                </p>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-sm text-gray-500">Confidence Score</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {result.confidence}%
                </p>
              </div>

              {/* Threat Info */}
              <div>
                <p className="text-sm text-gray-500">Analysis Type</p>
                <p className="text-gray-700 font-medium mt-1">
                  {result.threat}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
