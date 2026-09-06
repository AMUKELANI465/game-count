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
  const avgPerImage = surveys.length ? Math.round(totalAnimals / surveys.length) : 0;

  const speciesTotals: Record<string, number> = Object.fromEntries(SPECIES.map((s) => [s, 0]));
  surveys.forEach((s) =>
    s.species_counts.forEach((sc) => {
      speciesTotals[sc.species] = (speciesTotals[sc.species] || 0) + (sc.verified_count ?? sc.ai_count);
    })
  );

  const chartData = [...surveys]
    .reverse()
    .map((s, i) => ({
      name: `#${String(i + 1).padStart(3, "0")}`,
      count: s.verified_total || s.ai_total,
    }));

  const recentSurveys = surveys.slice(0, 5);

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="kicker mb-2">
                <span>GameCount</span>
              </div>
              <h1 className="text-3xl sm:text-4xl text-neutral-950 tracking-tight">Dashboard</h1>
              <p className="text-earth-500 mt-2 text-base">Your wildlife counting activity, at a glance</p>
            </div>
            <Link to="/new-survey" className="gc-button-primary">
              <Plus size={18} />
              Analyze Image
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            Could not load analyses: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-earth-500 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-earth-300 border-t-neutral-950 rounded-full mb-3 mx-auto" />
              Loading...
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="gc-card p-12 text-center">
            <PawPrint className="mx-auto mb-4 text-earth-300" size={40} />
            <p className="text-neutral-950 font-semibold mb-2">No analyses yet</p>
            <p className="text-earth-500 text-sm mb-6">Upload your first wildlife image to start counting.</p>
            <Link to="/new-survey" className="gc-button-primary">
              <Plus size={16} />
              Analyze Image
            </Link>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <section className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Animals Counted" value={totalAnimals} icon={<PawPrint size={24} />} />
                <StatCard label="Images Analyzed" value={surveys.length} icon={<ClipboardList size={24} />} />
                <StatCard label="Species Detected" value={SPECIES.length} icon={<Layers size={24} />} />
                <StatCard label="Avg Per Image" value={avgPerImage} icon={<CalendarClock size={24} />} />
              </div>
            </section>

            {/* Species breakdown */}
            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Species Breakdown
                </h2>
                <p className="text-sm text-earth-500 mt-1">Recorded animal counts by species across all analyses</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {SPECIES.map((species) => (
                  <div key={species} className="gc-card p-5">
                    <div className="text-3xl mb-2">{SPECIES_EMOJI[species]}</div>
                    <div className="text-xs uppercase tracking-widest text-earth-500 font-semibold mb-1">{species}</div>
                    <div className="text-2xl font-bold text-neutral-950">{speciesTotals[species]}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity chart */}
            <section className="mb-8">
              <div className="gc-card p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-neutral-950 mb-1">Counting Activity</h2>
                  <p className="text-sm text-earth-500">Animals counted per analysis, most recent last</p>
                </div>

                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dedfe2" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#969aa3" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#969aa3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 17, 19, 0.95)",
                          border: "1px solid #111113",
                          borderRadius: "10px",
                          color: "#ffffff",
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#111113" strokeWidth={2} dot={{ r: 3, fill: "#2078d4" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 p-4 bg-earth-50 border border-earth-200 rounded-lg">
                  <p className="text-xs text-earth-500 leading-relaxed">
                    <span className="font-semibold text-neutral-800">Note:</span> These counts reflect AI-detected
                    animals from specific images, not a guaranteed population trend.
                  </p>
                </div>
              </div>
            </section>

            {/* Recent analyses */}
            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                  <ClipboardList size={18} />
                  Recent Analyses
                </h2>
              </div>

              <div className="space-y-3">
                {recentSurveys.map((survey) => {
                  const surveyDate = survey.survey_date || survey.created_at.slice(0, 10);
                  const count = survey.verified_total || survey.ai_total;
                  const isVerified = survey.status === "verified";

                  return (
                    <Link key={survey.id} to={`/surveys/${survey.id}`} className="block gc-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-neutral-950 truncate">{survey.survey_name}</h3>
                            {isVerified && (
                              <span className="status-pill bg-earth-100 text-neutral-800">Verified</span>
                            )}
                          </div>
                          <p className="text-xs text-earth-500 flex items-center gap-1">
                            <CalendarClock size={12} />
                            {new Date(surveyDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
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
                            <div className="text-lg font-bold text-neutral-950">{count}</div>
                            <p className="text-xs text-earth-500">animals</p>
                          </div>
                          <ChevronRight size={18} className="text-earth-400" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Map preview */}
            <section>
              <Link to="/map" className="block gc-card p-6 sm:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-neutral-800" />
                  <h2 className="text-base sm:text-lg font-bold text-neutral-950">Map</h2>
                </div>
                <p className="text-earth-500 text-sm mb-4">See where your analyses came from, when location data is available</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  Open Map
                  <ChevronRight size={16} />
                </div>
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
