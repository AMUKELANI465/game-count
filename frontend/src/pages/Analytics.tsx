import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { api, SPECIES_EMOJI } from "../services/api";
import type { Survey } from "../types";
import { SPECIES } from "../constants";

const SPECIES_COLORS: Record<string, string> = {
  elephant: "#2F5233",
  giraffe: "#C97B2C",
  impala: "#8C6239",
  springbok: "#4C7A5A",
};

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
    name: `Survey ${String(i + 1).padStart(2, "0")}`,
    "AI estimate": s.ai_total,
    "Ranger verified": s.verified_total,
  }));

  const populationTrendData = [...surveys].reverse().map((s) => ({
    name: new Date(s.survey_date || s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    animals: s.verified_total,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-forest-500">Loading analytics...</div>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-2">Conservation Analytics</h1>
          <p className="text-forest-500 mb-12">
            Intelligence from verified wildlife surveys across your monitoring period
          </p>
          <div className="bg-white border border-earth-200 rounded-xl p-12 text-center">
            <BarChart3 className="mx-auto mb-4 text-earth-300" size={48} />
            <p className="text-forest-600 font-medium mb-2">No Survey Data Yet</p>
            <p className="text-forest-500 text-sm">
              Complete and verify surveys to see analytics and population insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-2">Conservation Analytics</h1>
          <p className="text-forest-500">
            Intelligence from {surveys.length} verified survey{surveys.length !== 1 ? "s" : ""} · {totalAnimals} animals recorded
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Total Surveys</div>
            <div className="text-3xl font-bold text-forest-800 mt-2">{surveys.length}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Verified Count</div>
            <div className="text-3xl font-bold text-forest-800 mt-2">{totalAnimals}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Species Monitored</div>
            <div className="text-3xl font-bold text-forest-800 mt-2">{pieData.length}</div>
          </div>
          <div className="bg-white border border-earth-200 rounded-lg p-5">
            <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Avg Survey Count</div>
            <div className="text-3xl font-bold text-forest-800 mt-2">
              {surveys.length > 0 ? Math.round(totalAnimals / surveys.length) : 0}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Species Distribution */}
          <div className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
              <PieChartIcon size={20} />
              Species Population Distribution
            </h2>
            <p className="text-xs text-forest-500 mb-4">Verified animal counts by species</p>
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
              <div className="h-72 flex items-center justify-center text-forest-500">
                <p>No species data available</p>
              </div>
            )}
          </div>

          {/* AI vs Ranger Comparison */}
          <div className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              AI vs. Ranger Verified
            </h2>
            <p className="text-xs text-forest-500 mb-4">Comparison of AI estimates and ranger-verified counts</p>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2d2b8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8c6239" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#8c6239" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AI estimate" fill="#C97B2C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ranger verified" fill="#2F5233" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Population Trend */}
        {populationTrendData.length > 1 && (
          <div className="bg-white border border-earth-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-forest-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              Recording Trend
            </h2>
            <p className="text-xs text-forest-500 mb-4">
              Verified animal counts across survey period · Not a population trend analysis
            </p>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={populationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2d2b8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8c6239" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#8c6239" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="animals"
                    stroke="#2F5233"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#c97b2c" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-lg text-xs text-forest-600">
              <strong>Note:</strong> Recorded survey results should not be interpreted as a guaranteed population trend. These observations reflect specific survey occasions and ranger verification.
            </div>
          </div>
        )}

        {/* Species Summary Table */}
        <div className="bg-white border border-earth-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-forest-800 mb-6">Species Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left px-4 py-3 font-semibold text-forest-700 uppercase text-xs tracking-wide">Species</th>
                  <th className="text-right px-4 py-3 font-semibold text-forest-700 uppercase text-xs tracking-wide">Total Count</th>
                  <th className="text-right px-4 py-3 font-semibold text-forest-700 uppercase text-xs tracking-wide">Percentage</th>
                  <th className="text-right px-4 py-3 font-semibold text-forest-700 uppercase text-xs tracking-wide">Surveys</th>
                </tr>
              </thead>
              <tbody>
                {SPECIES.map((species) => {
                  const count = speciesTotals[species] || 0;
                  const surveysWithSpecies = surveys.filter((s) =>
                    s.species_counts.some((sc) => sc.species === species && (sc.verified_count || 0) > 0)
                  ).length;

                  return (
                    <tr key={species} className="border-b border-earth-100 hover:bg-earth-50">
                      <td className="px-4 py-3 font-medium capitalize flex items-center gap-2">
                        <span className="text-xl">
                          {SPECIES.includes(species as (typeof SPECIES)[number]) ? SPECIES_EMOJI[species] : ""}
                        </span>
                        {species}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-forest-800">{count}</td>
                      <td className="px-4 py-3 text-right text-forest-600">
                        {totalAnimals > 0 ? Math.round((count / totalAnimals) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-right text-forest-600">{surveysWithSpecies}</td>
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
