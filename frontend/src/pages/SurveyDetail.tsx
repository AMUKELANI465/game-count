import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Zap, BarChart3, Clock, AlertCircle } from "lucide-react";
import { api, assetUrl, SPECIES_EMOJI } from "../services/api";
import type { Survey } from "../types";

export default function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getSurvey(Number(id))
      .then(setSurvey)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-earth-500 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-earth-300 border-t-neutral-950 rounded-full mx-auto mb-3" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="page-shell">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/surveys")} className="inline-flex items-center gap-2 text-sm text-earth-500 hover:text-neutral-950 mb-6">
            <ArrowLeft size={16} />
            Back to History
          </button>
          <div className="gc-card p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-earth-300" size={40} />
            <p className="text-neutral-950 font-semibold">{error || "Analysis not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
  const isVerified = survey.status === "verified";
  const speciesTotal = survey.species_counts.reduce((sum, sc) => sum + (sc.verified_count ?? sc.ai_count), 0);

  return (
    <div className="page-shell">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/surveys")} className="inline-flex items-center gap-2 text-sm text-earth-500 hover:text-neutral-950 mb-6 font-medium">
          <ArrowLeft size={16} />
          Back to History
        </button>

        {/* Header */}
        <div className="gc-card p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950">{survey.survey_name}</h1>
              <p className="text-earth-500 mt-2 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={15} />
                  {new Date(surveyDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                {survey.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={15} />
                    {survey.location}
                  </span>
                )}
              </p>
            </div>
            <span className={`status-pill whitespace-nowrap ${isVerified ? "bg-earth-100 text-neutral-800" : "bg-accent-100 text-accent-700"}`}>
              {isVerified ? "Verified" : "Pending Review"}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-2">Animals</div>
            <div className="text-3xl font-bold text-neutral-950">{speciesTotal}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-2">AI Detected</div>
            <div className="text-3xl font-bold text-accent-500">{survey.ai_total}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-2">Verified</div>
            <div className="text-3xl font-bold text-neutral-950">{survey.verified_total}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-2">Avg Confidence</div>
            <div className="text-3xl font-bold text-neutral-950">{Math.round(survey.average_confidence * 100)}%</div>
          </div>
        </div>

        {/* Images + species */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            {survey.image_path && (
              <div className="gc-card overflow-hidden !p-0">
                <div className="bg-earth-50 px-6 py-3 border-b border-earth-200">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-800 flex items-center gap-2">
                    <Zap size={15} />
                    Original Image
                  </h2>
                </div>
                <img src={assetUrl(survey.image_path)} alt="Original uploaded" className="w-full h-auto block" />
              </div>
            )}

            {survey.annotated_image_path && (
              <div className="gc-card overflow-hidden !p-0">
                <div className="bg-earth-50 px-6 py-3 border-b border-earth-200">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-800 flex items-center gap-2">
                    <BarChart3 size={15} />
                    AI Detections
                  </h2>
                </div>
                <img src={assetUrl(survey.annotated_image_path)} alt="Annotated with detections" className="w-full h-auto block" />
              </div>
            )}
          </div>

          <div>
            <div className="gc-card p-6 sticky top-8">
              <h2 className="text-xs font-bold uppercase tracking-wide text-earth-500 mb-4">Species Breakdown</h2>
              {survey.species_counts.length === 0 ? (
                <p className="text-sm text-earth-500">No species data</p>
              ) : (
                <div className="space-y-3">
                  {survey.species_counts.map((sc) => (
                    <div key={sc.species} className="border-b border-earth-100 pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{SPECIES_EMOJI[sc.species]}</span>
                        <span className="font-semibold text-neutral-950 capitalize text-sm">{sc.species}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-earth-500">AI:</span>
                          <span className="text-neutral-950 font-bold ml-1">{sc.ai_count}</span>
                        </div>
                        <div>
                          <span className="text-earth-500">Verified:</span>
                          <span className="text-neutral-950 font-bold ml-1">{sc.verified_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="gc-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-3">Processing Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-earth-400" />
                  <span className="text-earth-500">Processing time:</span>
                  <span className="font-semibold text-neutral-950">{survey.processing_time.toFixed(2)}s</span>
                </div>
                <div className="text-earth-500">
                  <span>Created:</span>
                  <span className="font-semibold text-neutral-950 ml-2">
                    {new Date(survey.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
            {survey.notes && (
              <div>
                <h3 className="text-xs uppercase text-earth-500 font-semibold tracking-wider mb-3">Notes</h3>
                <p className="text-sm text-neutral-800 italic bg-earth-50 p-3 rounded-lg border border-earth-100">"{survey.notes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
