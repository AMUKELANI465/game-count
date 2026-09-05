import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Zap, BarChart3, Clock } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-forest-500 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-forest-300 border-t-forest-600 rounded-full mx-auto mb-3" />
          <p>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/surveys")}
            className="inline-flex items-center gap-2 text-sm text-forest-500 hover:text-forest-700 mb-6"
          >
            <ArrowLeft size={16} />
            Back to Surveys
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error || "Survey not found"}
          </div>
        </div>
      </div>
    );
  }

  const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
  const isVerified = survey.status === "verified";
  const speciesTotals = survey.species_counts.reduce(
    (sum, sc) => sum + (sc.verified_count ?? sc.ai_count),
    0
  );

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/surveys")}
          className="inline-flex items-center gap-2 text-sm text-forest-500 hover:text-forest-700 mb-6 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Surveys
        </button>

        {/* Header */}
        <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800">{survey.survey_name}</h1>
              <p className="text-forest-500 mt-2 flex flex-wrap gap-4">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(surveyDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {survey.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {survey.location}
                  </span>
                )}
              </p>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
                  isVerified
                    ? "bg-forest-100 text-forest-700"
                    : "bg-accent-100 text-accent-700"
                }`}
              >
                {isVerified ? "✓ Verified" : "◆ Pending Review"}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-2">Animals Counted</div>
            <div className="text-3xl font-bold text-forest-800">{speciesTotals}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-2">AI Estimate</div>
            <div className="text-3xl font-bold text-accent-500">{survey.ai_total}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-2">Verified Total</div>
            <div className="text-3xl font-bold text-forest-800">{survey.verified_total}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-2">Avg Confidence</div>
            <div className="text-3xl font-bold text-forest-800">{Math.round(survey.average_confidence * 100)}%</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Images */}
          <div className="lg:col-span-2 space-y-6">
            {survey.image_path && (
              <div className="bg-white border border-earth-200 rounded-xl overflow-hidden">
                <div className="bg-earth-100 px-6 py-3 border-b border-earth-200">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700 flex items-center gap-2">
                    <Zap size={16} />
                    Original Aerial Survey
                  </h2>
                </div>
                <img
                  src={assetUrl(survey.image_path)}
                  alt="Original aerial survey"
                  className="w-full h-auto block"
                />
              </div>
            )}

            {survey.annotated_image_path && (
              <div className="bg-white border border-earth-200 rounded-xl overflow-hidden">
                <div className="bg-earth-100 px-6 py-3 border-b border-earth-200">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700 flex items-center gap-2">
                    <BarChart3 size={16} />
                    AI Detection Analysis
                  </h2>
                </div>
                <img
                  src={assetUrl(survey.annotated_image_path)}
                  alt="Annotated aerial survey with detections"
                  className="w-full h-auto block"
                />
              </div>
            )}
          </div>

          {/* Species Breakdown */}
          <div>
            <div className="bg-white border border-earth-200 rounded-xl p-6 sticky top-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-forest-700 mb-4">Species Breakdown</h2>

              {survey.species_counts.length === 0 ? (
                <p className="text-sm text-forest-500">No species data</p>
              ) : (
                <div className="space-y-3">
                  {survey.species_counts.map((sc) => (
                    <div key={sc.species} className="border-b border-earth-100 pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{SPECIES_EMOJI[sc.species]}</span>
                        <span className="font-semibold text-forest-800 capitalize text-sm">{sc.species}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-forest-500">AI:</span>
                          <span className="text-forest-800 font-bold ml-1">{sc.ai_count}</span>
                        </div>
                        <div>
                          <span className="text-forest-500">Verified:</span>
                          <span className="text-forest-800 font-bold ml-1">{sc.verified_count}</span>
                        </div>
                      </div>
                      {sc.average_confidence > 0 && (
                        <div className="text-xs text-forest-500 mt-2">
                          Confidence: {Math.round(sc.average_confidence * 100)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="bg-white border border-earth-200 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-3">Processing Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-forest-400" />
                  <span className="text-forest-500">Processing time:</span>
                  <span className="font-semibold text-forest-800">{survey.processing_time.toFixed(2)}s</span>
                </div>
                <div className="text-forest-500">
                  <span>Created:</span>
                  <span className="font-semibold text-forest-800 ml-2">
                    {new Date(survey.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            {survey.notes && (
              <div>
                <h3 className="text-xs uppercase text-forest-500 font-semibold tracking-wider mb-3">Ranger Notes</h3>
                <p className="text-sm text-forest-700 italic bg-forest-50 p-3 rounded border border-forest-100">
                  "{survey.notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
