import { useEffect, useState } from "react";
import { Server, Zap, Layers } from "lucide-react";
import { api } from "../services/api";
import { SPECIES } from "../constants";

interface HealthResponse {
  status: string;
  demo_mode: boolean;
  species_supported: string[];
  model?: string;
}

export default function Settings() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch(() => setHealth({ status: "error", demo_mode: false, species_supported: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 mb-2">Settings</h1>
          <p className="text-earth-500">Status of your GameCount backend and AI configuration</p>
        </div>

        {/* System status */}
        <div className="gc-card p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-earth-500 mb-6 flex items-center gap-2">
            <Server size={18} />
            System Status
          </h2>

          {loading ? (
            <div className="text-earth-500 py-4">Checking backend...</div>
          ) : health && health.status === "ok" ? (
            <div className="space-y-4">
              <div className="bg-earth-50 border border-earth-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-2 h-2 bg-neutral-950 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-950">Backend Online</p>
                  <p className="text-sm text-earth-500">API server responding normally</p>
                </div>
              </div>

              {health.demo_mode && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                  <Zap size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Demo Mode Active</p>
                    <p className="text-sm text-amber-800">
                      Detections are simulated for demonstration - no trained model is deployed yet. See the
                      README for how to enable real inference.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
                  <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-1">Status</div>
                  <div className="font-bold text-neutral-950 capitalize">{health.status}</div>
                </div>
                {health.model && (
                  <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
                    <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-1">Active Model</div>
                    <div className="font-bold text-neutral-950 break-all">{health.model}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              <p className="font-semibold mb-1">Could Not Reach Backend</p>
              <p>Check that the API server is running and reachable.</p>
            </div>
          )}
        </div>

        {/* AI engine */}
        <div className="gc-card p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-earth-500 mb-6 flex items-center gap-2">
            <Zap size={18} />
            AI Detection Engine
          </h2>

          <div className="space-y-4">
            <div className="border-l-2 border-neutral-950 pl-4 py-1">
              <p className="text-sm font-semibold text-neutral-950">Detection Model</p>
              <p className="text-xs text-earth-500 mt-1">{health?.model || "Configured by the backend"}</p>
            </div>
            <div className="border-l-2 border-accent-500 pl-4 py-1">
              <p className="text-sm font-semibold text-neutral-950">Confidence Threshold</p>
              <p className="text-xs text-earth-500 mt-1">Set by YOLO_CONFIDENCE on the backend</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-earth-50 border border-earth-200 rounded-xl text-xs text-earth-600">
            Confidence reflects the model's certainty, not guaranteed accuracy. Review results before treating
            them as final.
          </div>
        </div>

        {/* Supported species */}
        <div className="gc-card p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-earth-500 mb-6 flex items-center gap-2">
            <Layers size={18} />
            Supported Species
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {SPECIES.map((species) => (
              <div key={species} className="bg-earth-50 rounded-xl p-4 border border-earth-200">
                <p className="font-medium text-neutral-950 capitalize">{species}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-6 pt-6 border-t border-earth-200">
            <div>
              <p className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Max Image Size</p>
              <p className="text-neutral-950 font-medium mt-1">20 MB</p>
            </div>
            <div>
              <p className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Accepted Formats</p>
              <p className="text-neutral-950 font-medium mt-1">JPG, PNG, WEBP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
