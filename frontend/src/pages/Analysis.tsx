import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Zap, ArrowRight, PawPrint, AlertCircle } from "lucide-react";
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
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
        <div className="bg-white border border-earth-200 rounded-xl p-8 text-center max-w-lg">
          <AlertCircle className="mx-auto mb-4 text-earth-300" size={48} />
          <h1 className="text-lg font-bold text-forest-800 mb-2">No Analysis in Progress</h1>
          <p className="text-forest-600 mb-6">
            Start a new survey to begin AI analysis of aerial wildlife imagery.
          </p>
          <button
            onClick={() => navigate("/new-survey")}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-lg"
          >
            <Zap size={18} />
            Create New Survey
          </button>
        </div>
      </div>
    );
  }

  const { survey, result } = state;
  const speciesEntries = Object.entries(result.species_counts).filter(([, c]) => c > 0);

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Demo Banner */}
        {result.demo && (
          <div className="demo-banner text-white text-xs font-bold uppercase tracking-wide text-center py-2 rounded-lg mb-6 px-4">
            ⚠ Demo / Simulated AI Results — Not production data
          </div>
        )}

        {/* Header */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800">Wildlife Detection Analysis</h1>
              <p className="text-forest-500 mt-2">{survey.survey_name || "Untitled survey"}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-forest-700 mb-1">Processing Complete</div>
              <div className="text-2xl font-bold text-accent-500">{result.total_animals} animals</div>
            </div>
          </div>

          {/* Philosophy Banner */}
          <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-forest-700 font-medium italic">
              <span className="font-bold">"AI Assists. Rangers Decide."</span>
              <br />
              <span className="text-forest-600">
                The AI has completed its analysis. Review the results below and use your expertise to verify the final count.
              </span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-earth-200 rounded-xl overflow-hidden">
              <div className="bg-earth-100 px-6 py-3 border-b border-earth-200 flex items-center gap-2">
                <Zap size={18} className="text-forest-700" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-forest-800">AI Detection Results</h2>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <DetectionImage imageUrl={assetUrl(result.image_url)} detections={result.detections} />
              </div>
            </div>

            {/* Warnings */}
            {!result.detections.length && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl mt-6 p-5 flex gap-4">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">No Animals Detected</h3>
                  <p className="text-amber-800 text-sm">
                    {result.message || "The AI did not identify any animals in the imagery. Please review the image manually and proceed with verification."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Panel */}
          <div>
            <div className="bg-white border border-earth-200 rounded-xl p-6 sticky top-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700 mb-4">Analysis Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="border-b border-earth-100 pb-4">
                  <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Total Detections</div>
                  <div className="text-3xl font-bold text-forest-800 mt-1">{result.total_animals}</div>
                </div>

                <div className="border-b border-earth-100 pb-4">
                  <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Species Found</div>
                  <div className="text-3xl font-bold text-forest-800 mt-1">{speciesEntries.length}</div>
                </div>

                <div className="border-b border-earth-100 pb-4">
                  <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Avg Confidence</div>
                  <div className="text-3xl font-bold text-forest-800 mt-1">
                    {Math.round(result.average_confidence * 100)}%
                  </div>
                  <p className="text-[11px] text-forest-500 mt-2">
                    Higher confidence indicates stronger detection certainty
                  </p>
                </div>

                <div>
                  <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Processing Time</div>
                  <div className="text-sm text-forest-700 font-semibold mt-1">{result.processing_time.toFixed(2)}s</div>
                </div>
              </div>

              {/* Species Breakdown */}
              <div className="bg-forest-50 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-forest-600 mb-3">Species Detections</h3>
                <div className="space-y-2">
                  {speciesEntries.length === 0 ? (
                    <p className="text-sm text-forest-500">No species detected</p>
                  ) : (
                    speciesEntries.map(([species, count]) => {
                      const confs = result.detections
                        .filter((d) => d.species === species)
                        .map((d) => d.confidence);
                      const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;

                      return (
                        <div key={species} className="bg-white rounded p-3 border border-earth-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold capitalize flex items-center gap-2">
                              <span className="text-lg">{SPECIES_EMOJI[species]}</span>
                              {species}
                            </span>
                            <span className="text-lg font-bold text-forest-800">{count}</span>
                          </div>
                          <div className="text-xs text-forest-500 mt-2">
                            Confidence: {Math.round(avgConf * 100)}%
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/results", { state })}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold py-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <PawPrint size={20} />
            Proceed to Ranger Verification
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate("/new-survey")}
            className="flex-1 bg-white border border-earth-300 hover:border-forest-400 text-forest-700 font-bold py-4 rounded-lg transition-colors"
          >
            Start New Survey
          </button>
        </div>
      </div>
    </div>
  );
}
