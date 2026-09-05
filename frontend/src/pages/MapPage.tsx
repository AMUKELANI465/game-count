import { useEffect, useState } from "react";
import { Map, Satellite, AlertCircle, BarChart3 } from "lucide-react";
import GoogleMap from "../components/GoogleMap";
import { api } from "../services/api";
import type { Survey } from "../types";

// Welgevonden Game Reserve, Limpopo, South Africa
const RESERVE_CENTER = { lat: -24.2, lng: 27.85 };

export default function MapPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain" | "hybrid">("satellite");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all");

  useEffect(() => {
    api
      .listSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter surveys by status
  const filteredSurveys = surveys.filter((s) => {
    if (filterStatus === "verified") return s.status === "verified";
    if (filterStatus === "pending") return s.status !== "verified";
    return true;
  });

  // Convert surveys to map markers with offset positions (since we don't have real GPS)
  const markers = filteredSurveys.map((survey, index) => ({
    id: survey.id,
    lat: RESERVE_CENTER.lat + index * 0.015,
    lng: RESERVE_CENTER.lng + index * 0.015,
    title: survey.survey_name,
    content: `
      <div style="font-size: 12px; line-height: 1.4;">
        <div><strong>${survey.survey_name}</strong></div>
        <div style="color: #3f6f45; margin-top: 4px;">
          ${survey.survey_date || survey.created_at.slice(0, 10)}
        </div>
        ${survey.location ? `<div style="color: #8c6239;">${survey.location}</div>` : ""}
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2d2b8; color: #2f5233; font-weight: bold;">
          ${survey.verified_total || survey.ai_total} animals
        </div>
      </div>
    `,
    status: (survey.status === "verified" ? "verified" : "pending") as "verified" | "pending",
  }));

  const verifiedCount = surveys.filter((s) => s.status === "verified").length;
  const totalAnimals = surveys.reduce((sum, s) => sum + (s.verified_total || s.ai_total || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-earth-50">
      {/* Header */}
      <div className="bg-white border-b border-earth-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 flex items-center gap-2">
                <Map size={32} className="text-forest-600" />
                Survey Map
              </h1>
              <p className="text-forest-500 mt-2">Explore survey locations and wildlife monitoring activity across the reserve</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-4">
              <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Total Surveys</div>
              <div className="text-2xl font-bold text-forest-800 mt-1">{surveys.length}</div>
            </div>
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-4">
              <div className="text-xs uppercase text-forest-500 font-semibold tracking-wider">Verified</div>
              <div className="text-2xl font-bold text-forest-800 mt-1">{verifiedCount}</div>
            </div>
            <div className="bg-earth-50 border border-earth-200 rounded-lg p-4">
              <div className="text-xs uppercase text-earth-500 font-semibold tracking-wider">Animals Recorded</div>
              <div className="text-2xl font-bold text-forest-800 mt-1">{totalAnimals}</div>
            </div>
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
              <div className="text-xs uppercase text-accent-600 font-semibold tracking-wider">Map Type</div>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setMapType("satellite")}
                  className={`px-2 py-1 text-xs rounded font-semibold transition-colors ${
                    mapType === "satellite"
                      ? "bg-accent-500 text-white"
                      : "bg-white border border-accent-300 text-accent-600 hover:bg-accent-50"
                  }`}
                >
                  <Satellite size={14} className="inline mr-1" />
                  Satellite
                </button>
                <button
                  onClick={() => setMapType("roadmap")}
                  className={`px-2 py-1 text-xs rounded font-semibold transition-colors ${
                    mapType === "roadmap"
                      ? "bg-accent-500 text-white"
                      : "bg-white border border-accent-300 text-accent-600 hover:bg-accent-50"
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Map Container */}
        <div className="flex-1 relative min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-earth-50">
              <div className="text-forest-500 text-center">
                <div className="animate-spin h-8 w-8 border-2 border-forest-300 border-t-forest-600 rounded-full mx-auto mb-3" />
                <p>Loading survey data...</p>
              </div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-earth-50">
              <div className="text-center text-forest-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-earth-300" />
                <p className="font-medium mb-2">No Surveys Yet</p>
                <p className="text-sm">Create and verify surveys to see them on the map</p>
              </div>
            </div>
          ) : (
            <GoogleMap
              center={RESERVE_CENTER}
              zoom={11}
              markers={markers}
              mapType={mapType}
              onMarkerClick={(marker) => {
                const survey = surveys.find((s) => s.id === marker.id);
                if (survey) setSelectedSurvey(survey);
              }}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full sm:w-80 md:w-96 bg-white border-l border-earth-200 flex flex-col overflow-hidden">
          {/* Filter */}
          <div className="border-b border-earth-200 p-4">
            <label className="text-xs uppercase text-forest-500 font-semibold tracking-wider block mb-3">
              Filter by Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex-1 px-3 py-2 text-xs rounded font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-forest-600 text-white"
                    : "bg-earth-100 text-forest-600 hover:bg-earth-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("verified")}
                className={`flex-1 px-3 py-2 text-xs rounded font-medium transition-colors ${
                  filterStatus === "verified"
                    ? "bg-forest-600 text-white"
                    : "bg-earth-100 text-forest-600 hover:bg-earth-200"
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`flex-1 px-3 py-2 text-xs rounded font-medium transition-colors ${
                  filterStatus === "pending"
                    ? "bg-forest-600 text-white"
                    : "bg-earth-100 text-forest-600 hover:bg-earth-200"
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Survey List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredSurveys.length === 0 ? (
                <div className="text-center py-8 text-forest-500 text-sm">
                  <BarChart3 size={24} className="mx-auto mb-2 text-earth-300" />
                  No surveys match this filter
                </div>
              ) : (
                filteredSurveys.map((survey) => (
                  <button
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      selectedSurvey?.id === survey.id
                        ? "bg-forest-100 border-forest-300"
                        : "bg-earth-50 border-earth-200 hover:border-earth-300 hover:bg-earth-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-forest-800 text-sm truncate">{survey.survey_name}</h3>
                        <p className="text-xs text-forest-500 mt-1">
                          {survey.survey_date || survey.created_at.slice(0, 10)}
                        </p>
                      </div>
                      <div className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        survey.status === "verified"
                          ? "bg-forest-100 text-forest-700"
                          : "bg-accent-100 text-accent-700"
                      }`}>
                        {survey.status === "verified" ? "✓" : "◆"}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected Survey Info */}
          {selectedSurvey && (
            <div className="border-t border-earth-200 p-4 bg-forest-50">
              <h3 className="font-bold text-forest-800 mb-3">{selectedSurvey.survey_name}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-forest-500 font-semibold">Date:</span>
                  <span className="text-forest-700 ml-2">{selectedSurvey.survey_date || selectedSurvey.created_at.slice(0, 10)}</span>
                </div>
                {selectedSurvey.location && (
                  <div>
                    <span className="text-forest-500 font-semibold">Location:</span>
                    <span className="text-forest-700 ml-2">{selectedSurvey.location}</span>
                  </div>
                )}
                <div>
                  <span className="text-forest-500 font-semibold">Animals:</span>
                  <span className="text-forest-700 ml-2 font-bold">{selectedSurvey.verified_total || selectedSurvey.ai_total}</span>
                </div>
                <div>
                  <span className="text-forest-500 font-semibold">Status:</span>
                  <span className={`ml-2 font-semibold ${
                    selectedSurvey.status === "verified" ? "text-forest-700" : "text-accent-600"
                  }`}>
                    {selectedSurvey.status === "verified" ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-white border-t border-earth-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto text-xs text-forest-500">
          <p>
            <strong>Note:</strong> Survey markers show general reserve locations. Exact coordinates are not currently captured. Satellite imagery from Google Maps provides current reserve conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
