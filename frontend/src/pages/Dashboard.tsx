import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { PawPrint, ClipboardList, Layers, CalendarClock, Plus, MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { api, SPECIES_EMOJI } from "../services/api";
import type { Survey } from "../types";
import StatCard from "../components/StatCard";
import { SPECIES } from "../constants";

export default function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listSurveys()
      .then(setSurveys)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalAnimals = surveys.reduce((sum, s) => sum + (s.verified_total || s.ai_total || 0), 0);
  const surveysCompleted = surveys.filter((s) => s.status === "verified").length;
  const latestSurvey = surveys[0]?.survey_date || surveys[0]?.created_at?.slice(0, 10) || "—";

  const speciesTotals: Record<string, number> = Object.fromEntries(SPECIES.map((s) => [s, 0]));
  surveys.forEach((s) =>
    s.species_counts.forEach((sc) => {
      speciesTotals[sc.species] = (speciesTotals[sc.species] || 0) + (sc.verified_count ?? sc.ai_count);
    })
  );

  const chartData = [...surveys]
    .reverse()
    .map((s, i) => ({
      name: `Survey ${String(i + 1).padStart(3, "0")}`,
      count: s.verified_total || s.ai_total,
    }));

  const recentSurveys = surveys.slice(0, 5);

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">Wildlife Overview</h1>
              <p className="text-earth-500 mt-2 text-base">Conservation monitoring system for Welgevonden Game Reserve</p>
            </div>
            <Link
              to="/new-survey"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              New Survey
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            Could not load surveys: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-forest-500">
              <div className="animate-spin h-8 w-8 border-2 border-forest-300 border-t-forest-600 rounded-full mb-3 mx-auto" />
              Loading survey data...
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-white border border-earth-200 rounded-xl p-12 text-center">
            <PawPrint className="mx-auto mb-4 text-earth-300" size={40} />
            <p className="text-forest-600 font-medium mb-2">No surveys yet</p>
            <p className="text-forest-500 text-sm mb-6">Start your first aerial wildlife survey to begin monitoring conservation data.</p>
            <Link to="/new-survey" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-4 py-2 rounded-lg">
              <Plus size={16} />
              Create First Survey
            </Link>
          </div>
        ) : (
          <>
            {/* KPI Section */}
            <section className="mb-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Animals Counted" value={totalAnimals} icon={<PawPrint size={28} />} />
                <StatCard label="Verified Surveys" value={surveysCompleted} icon={<ClipboardList size={28} />} />
                <StatCard label="Species Monitored" value={SPECIES.length} icon={<Layers size={28} />} />
                <StatCard label="Latest Survey" value={latestSurvey} icon={<CalendarClock size={28} />} />
              </div>
            </section>

            {/* Species Monitoring Section */}
            <section className="mb-10">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Species Populations
                </h2>
                <p className="text-sm text-earth-500 mt-1">Recorded animal counts by species across all surveys</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SPECIES.map((species) => (
                  <div
                    key={species}
                    className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-earth-300 transition-all duration-200"
                  >
                    <div className="text-4xl mb-3">{SPECIES_EMOJI[species]}</div>
                    <div className="text-xs uppercase tracking-widest text-forest-500 font-semibold mb-2">{species}</div>
                    <div className="text-3xl font-bold text-forest-800">{speciesTotals[species]}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Census Chart Section */}
            <section className="mb-10">
              <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-forest-800 mb-1">Census Observations</h2>
                  <p className="text-sm text-forest-500">Animal counts recorded per survey across monitoring period</p>
                </div>

                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2d2b8" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8c6239" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#8c6239" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(31, 53, 31, 0.95)",
                          border: "1px solid #8c6239",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#2F5233" strokeWidth={2} dot={{ r: 3, fill: "#c97b2c" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 p-4 bg-earth-50 border border-earth-200 rounded-lg">
                  <p className="text-xs text-forest-600 leading-relaxed">
                    <span className="font-semibold">Note:</span> Recorded survey results should not be interpreted as a guaranteed population trend. These counts reflect AI-assisted detections verified by rangers and represent observations from specific survey flights.
                  </p>
                </div>
              </div>
            </section>

            {/* Recent Surveys Section */}
            <section className="mb-10">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
                  <ClipboardList size={20} />
                  Recent Surveys
                </h2>
                <p className="text-sm text-earth-500 mt-1">Latest census operations and their results</p>
              </div>

              <div className="space-y-3">
                {recentSurveys.length > 0 ? (
                  recentSurveys.map((survey) => {
                    const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
                    const count = survey.verified_total || survey.ai_total;
                    const isVerified = survey.status === "verified";

                    return (
                      <Link
                        key={survey.id}
                        to={`/surveys/${survey.id}`}
                        className="block bg-white border border-earth-200 rounded-lg p-4 hover:shadow-md hover:border-earth-300 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-forest-800 truncate">{survey.survey_name}</h3>
                              {isVerified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forest-100 text-forest-700">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-earth-500 flex items-center gap-1">
                              <CalendarClock size={12} />
                              {new Date(surveyDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                              {survey.location && (
                                <>
                                  <span>•</span>
                                  <MapPin size={12} />
                                  {survey.location}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-forest-800">{count}</div>
                              <p className="text-xs text-earth-500">animals</p>
                            </div>
                            <ChevronRight size={18} className="text-forest-400" />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-forest-500 text-sm">No surveys available</div>
                )}
              </div>
            </section>

            {/* Map Preview Section */}
            <section>
              <Link
                to="/map"
                className="block bg-gradient-to-br from-forest-700 to-forest-900 rounded-xl p-8 sm:p-10 text-white hover:shadow-lg transition-shadow duration-200 border border-forest-600"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={24} className="text-accent-400" />
                  <h2 className="text-lg sm:text-xl font-bold">Reserve Map & Operations</h2>
                </div>
                <p className="text-forest-100 text-sm mb-6">View all survey locations, flight paths, and monitoring areas across the reserve</p>
                <div className="inline-flex items-center gap-2 text-accent-400 font-semibold hover:text-accent-300 transition-colors">
                  Open Map
                  <ChevronRight size={18} />
                </div>
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
