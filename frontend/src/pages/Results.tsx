import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, Loader2, ArrowLeft, PawPrint, Shield } from "lucide-react";
import { api, SPECIES_EMOJI } from "../services/api";
import type { AnalyzeResult } from "../types";

interface NavState {
  survey: { survey_name: string; survey_date: string; location: string; notes: string };
  result: AnalyzeResult;
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as NavState | undefined;

  const [verified, setVerified] = useState<Record<string, number>>(
    () => (state ? { ...state.result.species_counts } : {})
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!state) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
        <div className="bg-white border border-earth-200 rounded-xl p-8 text-center max-w-lg">
          <AlertCircle className="mx-auto mb-4 text-earth-300" size={48} />
          <h1 className="text-lg font-bold text-forest-800 mb-2">No Results to Review</h1>
          <p className="text-forest-600 mb-6">
            Complete an analysis to review and verify survey results.
          </p>
          <button
            onClick={() => navigate("/new-survey")}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-lg"
          >
            <PawPrint size={18} />
            New Survey
          </button>
        </div>
      </div>
    );
  }

  const { survey, result } = state;
  const aiTotal = result.total_animals;
  const verifiedTotal = Object.values(verified).reduce((a, b) => a + Number(b || 0), 0);
  const difference = aiTotal - verifiedTotal;

  function updateCount(species: string, value: string) {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setVerified((prev) => ({ ...prev, [species]: num }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await api.createSurvey({
        survey_name: survey.survey_name,
        survey_date: survey.survey_date,
        location: survey.location,
        notes: survey.notes,
        image_path: result.image_path,
        annotated_image_path: result.annotated_image_path,
        ai_total: aiTotal,
        verified_total: verifiedTotal,
        average_confidence: result.average_confidence,
        processing_time: result.processing_time,
        status: "verified",
        species_counts: Object.entries(result.species_counts).map(([species, ai_count]) => ({
          species,
          ai_count,
          verified_count: verified[species] ?? ai_count,
        })),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save survey.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white border border-earth-200 rounded-xl p-8 text-center max-w-lg">
          <CheckCircle2 className="mx-auto mb-4 text-forest-600" size={56} />
          <h1 className="text-2xl font-bold text-forest-800 mb-3">Survey Saved</h1>
          <p className="text-forest-600 mb-2">
            The verified census for <strong>"{survey.survey_name}"</strong> has been recorded.
          </p>
          <p className="text-sm text-forest-500 mb-8">
            Total animals counted: <strong className="text-forest-800">{verifiedTotal}</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-forest-600 hover:bg-forest-700 text-white font-bold px-5 py-3 rounded-lg transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate("/new-survey")}
              className="flex-1 bg-white border border-earth-300 hover:border-forest-400 text-forest-700 font-bold px-5 py-3 rounded-lg transition-colors"
            >
              New Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-forest-500 hover:text-forest-700 mb-6 font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-forest-100 rounded-lg text-forest-700">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800">Ranger Verification</h1>
              <p className="text-forest-500 mt-1">Review and verify the AI-assisted animal count</p>
            </div>
          </div>

          <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-forest-700">
              <strong>Your responsibility as a ranger:</strong> Use your field expertise to review the AI detections and provide the final, verified count for conservation records. Adjust any counts that don't match what you observed.
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* AI Estimate */}
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-accent-700 mb-4 flex items-center gap-2">
              <Zap size={16} />
              AI Estimate
            </h2>
            <div className="text-4xl font-bold text-accent-600 mb-4">{aiTotal}</div>
            <p className="text-xs text-accent-600 mb-5">
              Computer vision detected {aiTotal} animals across all species
            </p>
            <div className="space-y-2">
              {Object.entries(result.species_counts)
                .filter(([, count]) => count > 0)
                .map(([species, count]) => (
                  <div key={species} className="flex justify-between text-sm">
                    <span className="capitalize flex items-center gap-2">
                      {SPECIES_EMOJI[species]} {species}
                    </span>
                    <span className="font-semibold text-accent-700">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Ranger Verification */}
          <div className="bg-forest-50 border-2 border-forest-300 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700 mb-4 flex items-center gap-2">
              <PawPrint size={16} />
              Ranger Verified Count
            </h2>
            <div className="text-4xl font-bold text-forest-800 mb-4">{verifiedTotal}</div>
            <p className="text-xs text-forest-600 mb-5">
              Your verified count for the permanent conservation record
            </p>

            <div className="space-y-3">
              {Object.entries(result.species_counts)
                .filter(([, count]) => count > 0)
                .map(([species, aiCount]) => (
                  <div key={species} className="bg-white p-4 rounded-lg border border-forest-200">
                    <label className="text-sm font-semibold text-forest-700 capitalize flex items-center gap-2 mb-2">
                      {SPECIES_EMOJI[species]} {species}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        aria-label={`Verified count for ${species}`}
                        value={verified[species] ?? aiCount}
                        onChange={(e) => updateCount(species, e.target.value)}
                        className="flex-1 border border-forest-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-forest-400"
                      />
                      <div className="text-xs text-forest-500 text-right min-w-max">
                        AI: {aiCount}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-gradient-to-r from-forest-700 to-forest-900 text-white rounded-xl p-8 mb-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-forest-200 mb-1">AI Estimate</div>
              <div className="text-3xl font-bold">{aiTotal}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-forest-200 mb-1">Ranger Verified</div>
              <div className="text-3xl font-bold text-white">{verifiedTotal}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-forest-200 mb-1">Difference</div>
              <div className={`text-3xl font-bold ${Math.abs(difference) === 0 ? "text-forest-300" : "text-accent-300"}`}>
                {Math.abs(difference)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-forest-600 hover:bg-forest-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving Survey...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Save Verified Census
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/new-survey")}
            className="flex-1 bg-white border border-earth-300 hover:border-forest-400 text-forest-700 font-bold py-4 rounded-lg transition-colors"
          >
            New Survey
          </button>
        </div>
      </div>
    </div>
  );
}

import { AlertCircle, Zap } from "lucide-react";
