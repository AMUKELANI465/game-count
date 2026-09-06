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
    <div className="page-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950">History</h1>
              <p className="text-earth-500 mt-2">Every image you've analyzed and its status</p>
            </div>
            <Link to="/new-survey" className="gc-button-primary">
              <Plus size={18} />
              Analyze Image
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="gc-card p-4 sm:p-5">
              <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Total</div>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">{stats.total}</div>
            </div>
            <div className="gc-card p-4 sm:p-5">
              <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Verified</div>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">{stats.verified}</div>
            </div>
            <div className="gc-card p-4 sm:p-5">
              <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Animals</div>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">{stats.totalAnimals}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            Could not load history: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-earth-500 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-earth-300 border-t-neutral-950 rounded-full mx-auto mb-3" />
              <p>Loading...</p>
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="gc-card p-12 text-center">
            <Calendar className="mx-auto mb-4 text-earth-300" size={48} />
            <h2 className="text-lg font-bold text-neutral-950 mb-2">No analyses yet</h2>
            <p className="text-earth-500 mb-6">Upload your first wildlife image to start counting.</p>
            <Link to="/new-survey" className="gc-button-primary mx-auto">
              <Plus size={18} />
              Analyze Image
            </Link>
          </div>
        ) : (
          <>
            {/* Filter */}
            <div className="gc-card p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Filter size={16} className="text-earth-500" />
                <span className="text-sm font-semibold text-neutral-800">Filter</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "verified", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === status ? "bg-neutral-950 text-white" : "bg-earth-100 text-neutral-700 hover:bg-earth-200"
                    }`}
                  >
                    {status === "all" && `All (${surveys.length})`}
                    {status === "verified" && `Verified (${stats.verified})`}
                    {status === "draft" && `Pending (${surveys.length - stats.verified})`}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredSurveys.length === 0 ? (
                <div className="text-center py-12 gc-card">
                  <p className="text-earth-500 text-sm">No analyses match this filter</p>
                </div>
              ) : (
                filteredSurveys.map((survey) => {
                  const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
                  const count = survey.verified_total || survey.ai_total;
                  const isVerified = survey.status === "verified";
                  const topSpecies = survey.species_counts
                    .slice()
                    .sort((a, b) => (b.verified_count || b.ai_count) - (a.verified_count || a.ai_count))
                    .slice(0, 2);

                  return (
                    <Link key={survey.id} to={`/surveys/${survey.id}`} className="block gc-card p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-neutral-950 truncate">{survey.survey_name}</h3>
                            <span className={`status-pill whitespace-nowrap ${isVerified ? "bg-earth-100 text-neutral-800" : "bg-accent-100 text-accent-700"}`}>
                              {isVerified ? "Verified" : "Pending"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-earth-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(surveyDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </div>
                            {survey.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                {survey.location}
                              </div>
                            )}
                          </div>
                          {topSpecies.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              {topSpecies.map((sc) => (
                                <span key={sc.species} className="text-base" title={sc.species}>
                                  {SPECIES_EMOJI[sc.species]}
                                </span>
                              ))}
                              {survey.species_counts.length > 2 && (
                                <span className="text-xs text-earth-400">+{survey.species_counts.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-neutral-950">{count}</div>
                            <p className="text-xs text-earth-500">animals</p>
                          </div>
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-earth-50 text-earth-500">
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
