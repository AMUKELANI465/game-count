import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { api } from "../services/api";
import type { Survey } from "../types";
import { SPECIES, SPECIES_COLORS } from "../constants";

export default function Analytics() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false));
  }, []);

  const totalAnimals = surveys.reduce((sum, s) => sum + (s.verified_total || 0), 0);
  const speciesTotals: Record<string, number> = Object.fromEntries(SPECIES.map((s) => [s, 0]));
  surveys.forEach((s) =>
    s.species_counts.forEach((sc) => {
      speciesTotals[sc.species] = (speciesTotals[sc.species] || 0) + sc.verified_count;
    })
  );

  const pieData = SPECIES.map((s) => ({ name: s, value: speciesTotals[s] })).filter((d) => d.value > 0);

  const comparisonData = [...surveys].reverse().map((s, i) => ({
    name: `#${String(i + 1).padStart(2, "0")}`,
    "AI detected": s.ai_total,
    Verified: s.verified_total,
  }));

  const activityData = [...surveys].reverse().map((s) => ({
    name: new Date(s.survey_date || s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    animals: s.verified_total,
  }));

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-earth-500">Loading analytics...</div>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="page-shell">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 mb-2">Analytics</h1>
          <p className="text-earth-500 mb-10">Built from your saved analyses - there's nothing here yet</p>
          <div className="gc-card p-12 text-center">
            <BarChart3 className="mx-auto mb-4 text-earth-300" size={48} />
            <p className="text-neutral-950 font-semibold mb-2">No analyses yet</p>
            <p className="text-earth-500 text-sm">Upload and save a wildlife image to see analytics here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 mb-2">Analytics</h1>
          <p className="text-earth-500">
            {surveys.length} analysis{surveys.length !== 1 ? "es" : ""} · {totalAnimals} animals recorded
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Images Analyzed</div>
            <div className="text-3xl font-bold text-neutral-950 mt-2">{surveys.length}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Total Counted</div>
            <div className="text-3xl font-bold text-neutral-950 mt-2">{totalAnimals}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Species Detected</div>
            <div className="text-3xl font-bold text-neutral-950 mt-2">{pieData.length}</div>
          </div>
          <div className="gc-card p-5">
            <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Avg Per Image</div>
            <div className="text-3xl font-bold text-neutral-950 mt-2">{surveys.length > 0 ? Math.round(totalAnimals / surveys.length) : 0}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="gc-card p-6">
            <h2 className="text-lg font-bold text-neutral-950 mb-1 flex items-center gap-2">
              <PieChartIcon size={18} />
              Species Distribution
            </h2>
            <p className="text-xs text-earth-500 mb-4">Verified animal counts by species</p>
            {pieData.length > 0 ? (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={SPECIES_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-earth-500">
                <p>No species data available</p>
              </div>
            )}
          </div>

          <div className="gc-card p-6">
            <h2 className="text-lg font-bold text-neutral-950 mb-1 flex items-center gap-2">
              <BarChart3 size={18} />
              AI vs. Verified
            </h2>
            <p className="text-xs text-earth-500 mb-4">Comparison of AI-detected and human-verified counts</p>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dedfe2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#969aa3" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#969aa3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AI detected" fill="#5aa2f2" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Verified" fill="#111113" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity */}
        {activityData.length > 1 && (
          <div className="gc-card p-6 mb-6">
            <h2 className="text-lg font-bold text-neutral-950 mb-1 flex items-center gap-2">
              <TrendingUp size={18} />
              Counting Activity
            </h2>
            <p className="text-xs text-earth-500 mb-4">Verified animal counts over time · not a population trend analysis</p>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dedfe2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#969aa3" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#969aa3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="animals" stroke="#111113" strokeWidth={2} dot={{ r: 4, fill: "#2078d4" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-earth-50 border border-earth-200 rounded-lg text-xs text-earth-500">
              <strong className="text-neutral-800">Note:</strong> These counts reflect specific analyzed images, not a
              guaranteed population trend.
            </div>
          </div>
        )}

        {/* Table */}
        <div className="gc-card p-6">
          <h2 className="text-lg font-bold text-neutral-950 mb-6">Species Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left px-4 py-3 font-semibold text-earth-500 uppercase text-xs tracking-wide">Species</th>
                  <th className="text-right px-4 py-3 font-semibold text-earth-500 uppercase text-xs tracking-wide">Total</th>
                  <th className="text-right px-4 py-3 font-semibold text-earth-500 uppercase text-xs tracking-wide">Share</th>
                  <th className="text-right px-4 py-3 font-semibold text-earth-500 uppercase text-xs tracking-wide">Images</th>
                </tr>
              </thead>
              <tbody>
                {SPECIES.map((species) => {
                  const count = speciesTotals[species] || 0;
                  const imagesWithSpecies = surveys.filter((s) => s.species_counts.some((sc) => sc.species === species && (sc.verified_count || 0) > 0)).length;

                  return (
                    <tr key={species} className="border-b border-earth-100 hover:bg-earth-50">
                      <td className="px-4 py-3 font-medium capitalize text-neutral-800">{species}</td>
                      <td className="px-4 py-3 text-right font-bold text-neutral-950">{count}</td>
                      <td className="px-4 py-3 text-right text-earth-500">{totalAnimals > 0 ? Math.round((count / totalAnimals) * 100) : 0}%</td>
                      <td className="px-4 py-3 text-right text-earth-500">{imagesWithSpecies}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
