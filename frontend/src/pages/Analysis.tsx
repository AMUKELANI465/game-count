import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Zap, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import DetectionImage from "../components/DetectionImage";
import { assetUrl, SPECIES_EMOJI } from "../services/api";
import type { AnalyzeResult } from "../types";

interface NavState {
  survey: { survey_name: string; survey_date: string; location: string; notes: string };
  result: AnalyzeResult;
}

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as NavState | undefined;

  if (!state) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="gc-card p-8 text-center max-w-lg">
          <AlertCircle className="mx-auto mb-4 text-earth-300" size={48} />
          <h1 className="text-lg font-bold text-neutral-950 mb-2">No Analysis in Progress</h1>
          <p className="text-earth-500 mb-6">Upload a wildlife image to run a new AI analysis.</p>
          <button onClick={() => navigate("/new-survey")} className="gc-button-primary mx-auto">
            <Zap size={18} />
            Upload an Image
          </button>
        </div>
      </div>
    );
  }

  const { survey, result } = state;
  const speciesEntries = Object.entries(result.species_counts).filter(([, c]) => c > 0);

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto">
        {result.demo && (
          <div className="demo-banner text-xs uppercase tracking-wide py-1.5 rounded-full mb-6 px-3">
            Simulated result - no trained model deployed yet
          </div>
        )}

        {/* Header */}
        <div className="gc-card p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">{result.total_animals} Animals Detected</h1>
              <p className="text-earth-500 mt-1">{survey.survey_name}</p>
            </div>
          </div>

          <div className="bg-earth-50 border border-earth-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-earth-600">
              <span className="font-semibold text-neutral-800">AI assists. Humans decide.</span> Review the
              detections below - confidence reflects the model's certainty, not guaranteed accuracy.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="gc-card overflow-hidden !p-0">
              <div className="bg-earth-50 px-6 py-3 border-b border-earth-200 flex items-center gap-2">
                <Zap size={16} className="text-neutral-700" />
                <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-800">Detections</h2>
              </div>
              <div className="bg-neutral-950 flex items-center justify-center">
                <DetectionImage imageUrl={assetUrl(result.image_url)} detections={result.detections} />
              </div>
            </div>

            {!result.detections.length && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl mt-6 p-5 flex gap-4">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">No Animals Detected</h3>
                  <p className="text-amber-800 text-sm">
                    {result.message || "The AI did not identify any supported animals in this image."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div>
            <div className="gc-card p-6 sticky top-8">
              <h2 className="text-xs font-bold uppercase tracking-wide text-earth-500 mb-4">Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="border-b border-earth-100 pb-4">
                  <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Total</div>
                  <div className="text-3xl font-bold text-neutral-950 mt-1">{result.total_animals}</div>
                </div>
                <div className="border-b border-earth-100 pb-4">
                  <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Species Found</div>
                  <div className="text-3xl font-bold text-neutral-950 mt-1">{speciesEntries.length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Avg Confidence</div>
                  <div className="text-3xl font-bold text-neutral-950 mt-1">{Math.round(result.average_confidence * 100)}%</div>
                  <p className="text-[11px] text-earth-500 mt-1">Model confidence, not accuracy</p>
                </div>
              </div>

              <div className="bg-earth-50 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-earth-500 mb-3">By Species</h3>
                <div className="space-y-2">
                  {speciesEntries.length === 0 ? (
                    <p className="text-sm text-earth-500">No species detected</p>
                  ) : (
                    speciesEntries.map(([species, count]) => {
                      const confs = result.detections.filter((d) => d.species === species).map((d) => d.confidence);
                      const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;
                      return (
                        <div key={species} className="bg-white rounded-lg p-3 border border-earth-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold capitalize flex items-center gap-2">
                              <span className="text-lg">{SPECIES_EMOJI[species]}</span>
                              {species}
                            </span>
                            <span className="text-lg font-bold text-neutral-950">{count}</span>
                          </div>
                          <div className="text-xs text-earth-500 mt-1.5">{Math.round(avgConf * 100)}% avg confidence</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate("/results", { state })} className="gc-button-primary flex-1 !py-4">
            <CheckCircle2 size={18} />
            Review &amp; Save
            <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate("/new-survey")} className="gc-button-secondary flex-1 !py-4">
            Analyze Another Image
          </button>
        </div>
      </div>
    </div>
  );
}
