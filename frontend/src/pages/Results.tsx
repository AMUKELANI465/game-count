import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, Loader2, ArrowLeft, ShieldCheck, AlertCircle, Zap } from "lucide-react";
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
      <div className="page-shell flex items-center justify-center">
        <div className="gc-card p-8 text-center max-w-lg">
          <AlertCircle className="mx-auto mb-4 text-earth-300" size={48} />
          <h1 className="text-lg font-bold text-neutral-950 mb-2">No Results to Review</h1>
          <p className="text-earth-500 mb-6">Analyze an image to review and save a result.</p>
          <button onClick={() => navigate("/new-survey")} className="gc-button-primary mx-auto">
            <Zap size={18} />
            Analyze an Image
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
      setError(e instanceof Error ? e.message : "Could not save this result.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="gc-card p-8 text-center max-w-lg">
          <CheckCircle2 className="mx-auto mb-4 text-neutral-950" size={52} />
          <h1 className="text-2xl font-bold text-neutral-950 mb-3">Saved</h1>
          <p className="text-earth-500 mb-2">
            <strong className="text-neutral-800">"{survey.survey_name}"</strong> has been added to your history.
          </p>
          <p className="text-sm text-earth-500 mb-8">
            Total animals counted: <strong className="text-neutral-950">{verifiedTotal}</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate("/dashboard")} className="gc-button-primary flex-1">
              View Dashboard
            </button>
            <button onClick={() => navigate("/new-survey")} className="gc-button-secondary flex-1">
              Analyze Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-earth-500 hover:text-neutral-950 mb-6 font-medium">
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="gc-card p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-earth-100 rounded-xl text-neutral-800 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">Review & Save</h1>
              <p className="text-earth-500 mt-1">Correct any counts before saving to your history</p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-accent-600 mb-4">AI Detected</h2>
            <div className="text-4xl font-bold text-accent-600 mb-4">{aiTotal}</div>
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

          <div className="gc-card !border-2 !border-neutral-950 p-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-earth-500 mb-4">Your Verified Count</h2>
            <div className="text-4xl font-bold text-neutral-950 mb-4">{verifiedTotal}</div>

            <div className="space-y-3">
              {Object.entries(result.species_counts)
                .filter(([, count]) => count > 0)
                .map(([species, aiCount]) => (
                  <div key={species} className="bg-earth-50 p-4 rounded-xl border border-earth-200">
                    <label className="text-sm font-semibold text-neutral-800 capitalize flex items-center gap-2 mb-2">
                      {SPECIES_EMOJI[species]} {species}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        aria-label={`Verified count for ${species}`}
                        value={verified[species] ?? aiCount}
                        onChange={(e) => updateCount(species, e.target.value)}
                        className="gc-input !py-2.5 text-lg font-semibold"
                      />
                      <div className="text-xs text-earth-500 text-right min-w-max">AI: {aiCount}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="bg-neutral-950 text-white rounded-2xl p-8 mb-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-earth-400 mb-1">AI Detected</div>
              <div className="text-3xl font-bold">{aiTotal}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-earth-400 mb-1">Verified</div>
              <div className="text-3xl font-bold">{verifiedTotal}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-earth-400 mb-1">Difference</div>
              <div className="text-3xl font-bold">{Math.abs(difference)}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleSave} disabled={saving} className="gc-button-primary flex-1 !py-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Save Result
              </>
            )}
          </button>
          <button onClick={() => navigate("/new-survey")} className="gc-button-secondary flex-1 !py-4">
            Analyze Another Image
          </button>
        </div>
      </div>
    </div>
  );
}
