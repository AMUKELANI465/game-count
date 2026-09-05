import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin, Filter, ChevronRight } from "lucide-react";
import { api, SPECIES_EMOJI } from "../services/api";
import type { Survey } from "../types";

export default function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "draft">("all");

  useEffect(() => {
    api
      .listSurveys()
      .then(setSurveys)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSurveys = surveys.filter((s) => {
    if (filterStatus === "verified") return s.status === "verified";
    if (filterStatus === "draft") return s.status !== "verified";
    return true;
  });

  const stats = {
    total: surveys.length,
    verified: surveys.filter((s) => s.status === "verified").length,
    totalAnimals: surveys.reduce((sum, s) => sum + (s.verified_total || s.ai_total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800">Survey Operations</h1>
              <p className="text-forest-500 mt-2">Review aerial wildlife surveys and their verification status</p>
            </div>
            <Link
              to="/new-survey"
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              New Survey
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white border border-earth-200 rounded-lg p-4 sm:p-5">
              <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Total Surveys</div>
              <div className="text-2xl sm:text-3xl font-bold text-forest-800 mt-1">{stats.total}</div>
            </div>
            <div className="bg-white border border-earth-200 rounded-lg p-4 sm:p-5">
              <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Verified</div>
              <div className="text-2xl sm:text-3xl font-bold text-forest-800 mt-1">{stats.verified}</div>
            </div>
            <div className="bg-white border border-earth-200 rounded-lg p-4 sm:p-5">
              <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Animals</div>
              <div className="text-2xl sm:text-3xl font-bold text-forest-800 mt-1">{stats.totalAnimals}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            Could not load surveys: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-forest-500 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-forest-300 border-t-forest-600 rounded-full mx-auto mb-3" />
              <p>Loading surveys...</p>
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white border border-earth-200 rounded-xl p-12 text-center">
            <Calendar className="mx-auto mb-4 text-earth-300" size={48} />
            <h2 className="text-lg font-bold text-forest-600 mb-2">No Surveys Yet</h2>
            <p className="text-forest-500 mb-6">Begin your first aerial wildlife survey to track conservation data.</p>
            <Link
              to="/new-survey"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-3 rounded-lg"
            >
              <Plus size={18} />
              Create First Survey
            </Link>
          </div>
        ) : (
          <>
            {/* Filter */}
            <div className="bg-white border border-earth-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Filter size={16} className="text-forest-600" />
                <span className="text-sm font-semibold text-forest-700">Filter by Status</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "verified", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? "bg-forest-600 text-white"
                        : "bg-earth-100 text-forest-600 hover:bg-earth-200"
                    }`}
                  >
                    {status === "all" && `All (${surveys.length})`}
                    {status === "verified" && `Verified (${stats.verified})`}
                    {status === "draft" && `Pending (${surveys.length - stats.verified})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Surveys List */}
            <div className="space-y-3">
              {filteredSurveys.length === 0 ? (
                <div className="text-center py-12 bg-white border border-earth-200 rounded-lg">
                  <p className="text-forest-500 text-sm">No surveys match this filter</p>
                </div>
              ) : (
                filteredSurveys.map((survey) => {
                  const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
                  const count = survey.verified_total || survey.ai_total;
                  const isVerified = survey.status === "verified";
                  const topSpecies = survey.species_counts
                    .sort((a, b) => (b.verified_count || b.ai_count) - (a.verified_count || a.ai_count))
                    .slice(0, 2);

                  return (
                    <Link
                      key={survey.id}
                      to={`/surveys/${survey.id}`}
                      className="block bg-white border border-earth-200 rounded-lg p-5 hover:shadow-md hover:border-earth-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title and Status */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-forest-800 truncate">{survey.survey_name}</h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                isVerified
                                  ? "bg-forest-100 text-forest-700"
                                  : "bg-accent-100 text-accent-700"
                              }`}
                            >
                              {isVerified ? "✓ Verified" : "◆ Pending"}
                            </span>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-3 text-sm text-forest-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(surveyDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            {survey.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                {survey.location}
                              </div>
                            )}
                          </div>

                          {/* Species */}
                          {topSpecies.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              {topSpecies.map((sc) => (
                                <span key={sc.species} className="text-base" title={sc.species}>
                                  {SPECIES_EMOJI[sc.species]}
                                </span>
                              ))}
                              {survey.species_counts.length > 2 && (
                                <span className="text-xs text-forest-400">
                                  +{survey.species_counts.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stats and Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-forest-800">{count}</div>
                            <p className="text-xs text-forest-500">animals</p>
                          </div>
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-forest-50 text-forest-600 hover:bg-forest-100 transition-colors">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
