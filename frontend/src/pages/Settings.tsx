import { useEffect, useState } from "react";
import { Server, Layers, Zap, PawPrint } from "lucide-react";
import { api } from "../services/api";
import { SPECIES } from "../constants";

interface HealthResponse {
  status: string;
  demo?: boolean;
  [key: string]: any;
}

export default function Settings() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .health()
      .then((data) => {
        setHealth(data);
      })
      .catch(() => {
        setHealth({ status: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-2">Settings & Configuration</h1>
          <p className="text-forest-500">
            Application status and monitoring configuration for your GAME COUNT instance
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
            <Server size={20} />
            System Status
          </h2>

          {loading ? (
            <div className="text-forest-500 py-8">Loading system status...</div>
          ) : health ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-green-900">Backend Online</p>
                  <p className="text-sm text-green-700">API server responding normally</p>
                </div>
              </div>

              {health.demo && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
                  <Zap size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Demo Mode Active</p>
                    <p className="text-sm text-amber-800">
                      AI results are simulated for demonstration. Use with real data for production analysis.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-forest-50 rounded-lg p-4 border border-forest-200">
                  <div className="text-xs uppercase text-forest-600 font-semibold tracking-wider mb-1">Status</div>
                  <div className="font-bold text-forest-800 capitalize">{health.status}</div>
                </div>
                {health.version && (
                  <div className="bg-forest-50 rounded-lg p-4 border border-forest-200">
                    <div className="text-xs uppercase text-forest-600 font-semibold tracking-wider mb-1">API Version</div>
                    <div className="font-bold text-forest-800">{health.version}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              <p className="font-semibold mb-1">Error Connecting to Backend</p>
              <p>Unable to reach the API server. Please check your connection and server status.</p>
            </div>
          )}
        </div>

        {/* AI Model Configuration */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
            <Zap size={20} />
            AI Detection Engine
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-forest-600 pl-4 py-2">
              <p className="text-sm font-semibold text-forest-800">Detection Model</p>
              <p className="text-xs text-forest-600 mt-1">Custom YOLOv8 variant trained on African wildlife dataset</p>
            </div>

            <div className="border-l-4 border-accent-500 pl-4 py-2">
              <p className="text-sm font-semibold text-forest-800">Confidence Threshold</p>
              <p className="text-xs text-forest-600 mt-1">0.45 (detections below this are filtered)</p>
            </div>

            <div className="border-l-4 border-earth-500 pl-4 py-2">
              <p className="text-sm font-semibold text-forest-800">Processing</p>
              <p className="text-xs text-forest-600 mt-1">Bounding box annotations in COCO format with species classification</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <strong>Note:</strong> The AI engine provides detections with confidence scores. All results must be reviewed and verified by qualified rangers before approval.
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
            <Layers size={20} />
            Monitoring Configuration
          </h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-forest-800 mb-3">Supported Species</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {SPECIES.map((species) => (
                  <div key={species} className="bg-forest-50 rounded-lg p-4 border border-forest-200">
                    <p className="font-medium text-forest-800 capitalize">{species}</p>
                    <p className="text-xs text-forest-600 mt-1">Active monitoring enabled</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-earth-200">
              <h3 className="text-sm font-semibold text-forest-800 mb-3">Survey Recording</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Max Image Size</p>
                  <p className="text-forest-800 font-medium mt-1">20 MB</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Accepted Formats</p>
                  <p className="text-forest-800 font-medium mt-1">JPG, PNG, WEBP</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Data Retention</p>
                  <p className="text-forest-800 font-medium mt-1">Permanent archive</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Verification Mode</p>
                  <p className="text-forest-800 font-medium mt-1">Manual ranger review required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account & Reserve Info */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
            <PawPrint size={20} />
            Reserve Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Reserve Name</p>
              <p className="text-forest-800 font-semibold mt-2">Welgevonden Game Reserve</p>
              <p className="text-sm text-forest-600 mt-1">South Africa, Limpopo Province</p>
            </div>

            <div className="pt-4 border-t border-earth-200">
              <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider">Monitoring Program</p>
              <p className="text-forest-800 font-semibold mt-2">AI-Assisted Wildlife Conservation</p>
              <p className="text-sm text-forest-600 mt-1">Aerial survey analysis with ranger verification</p>
            </div>

            <div className="pt-4 border-t border-earth-200 bg-forest-50 rounded-lg p-4">
              <p className="text-xs uppercase text-forest-600 font-semibold tracking-wider mb-2">Data Privacy</p>
              <p className="text-xs text-forest-700">
                All wildlife survey data and imagery are treated as confidential reserve management information. Access is restricted to authorized personnel only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
