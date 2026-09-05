import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { UploadCloud, Loader2, ArrowRight, MapPin, Calendar, BookOpen } from "lucide-react";
import { api } from "../services/api";

const STEPS = [
  { number: "01", label: "Survey Information", description: "Enter survey details" },
  { number: "02", label: "Upload Imagery", description: "Aerial wildlife image" },
  { number: "03", label: "AI Analysis", description: "Automatic detection" },
  { number: "04", label: "Ranger Verification", description: "Review & approve" },
];

export default function NewSurvey() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [surveyName, setSurveyName] = useState("");
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const acceptTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  function handleFile(f: File) {
    setError("");
    if (!acceptTypes.includes(f.type)) {
      setError("Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 20MB.");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!surveyName.trim()) {
      setError("Please give this survey a name.");
      return;
    }
    if (!file) {
      setError("Please upload an aerial image first.");
      return;
    }
    setError("");
    setAnalyzing(true);
    try {
      const result = await api.analyze(file);
      // Pass survey metadata + AI result forward via router state.
      navigate("/analysis", {
        state: {
          survey: { survey_name: surveyName, survey_date: surveyDate, location, notes },
          result,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-earth-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 mb-2">Create Wildlife Survey</h1>
          <p className="text-forest-500 text-lg">
            Enter survey details and upload aerial imagery for AI-assisted wildlife detection
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="relative">
              <div className={`bg-white border rounded-lg p-4 text-center ${
                idx === 0 ? "border-forest-300 bg-forest-50" : "border-earth-200"
              }`}>
                <div className={`text-2xl font-bold mb-1 ${
                  idx === 0 ? "text-forest-700" : "text-forest-400"
                }`}>{step.number}</div>
                <div className="text-xs font-semibold text-forest-700 uppercase tracking-wide">{step.label}</div>
                <div className="text-[10px] text-forest-500 mt-1">{step.description}</div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="hidden sm:block absolute -right-1.5 top-1/2 -translate-y-1/2 text-earth-300">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="space-y-6">
          {/* Step 1: Survey Information */}
          <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-forest-100 text-forest-700 rounded-full font-bold text-sm">
                1
              </div>
              <h2 className="text-lg font-bold text-forest-800">Survey Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="survey-name" className="block text-sm font-semibold text-forest-700 mb-2">
                  Survey Name *
                </label>
                <input
                  id="survey-name"
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder="e.g. Aerial Survey #005 - Northern Section"
                  className="w-full border border-earth-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                />
                <p className="text-xs text-forest-500 mt-1">Give this survey a descriptive name for your records</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="survey-date" className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Survey Date
                  </label>
                  <input
                    id="survey-date"
                    type="date"
                    value={surveyDate}
                    onChange={(e) => setSurveyDate(e.target.value)}
                    className="w-full border border-earth-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="survey-location" className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Survey Location
                  </label>
                  <input
                    id="survey-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Northern Section / Eastern Waterhole"
                    className="w-full border border-earth-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="survey-notes" className="block text-sm font-semibold text-forest-700 mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Ranger Notes
                </label>
                <textarea
                  id="survey-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional observations about weather, visibility, flight conditions, animal behavior..."
                  className="w-full border border-earth-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Upload Imagery */}
          <div className="bg-white border border-earth-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-forest-100 text-forest-700 rounded-full font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-bold text-forest-800">Upload Aerial Wildlife Imagery</h2>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-10 sm:p-16 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-accent-500 bg-accent-400/10"
                  : "border-earth-300 hover:border-forest-400 bg-earth-50 hover:bg-earth-100"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                aria-label="Upload aerial wildlife image"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={previewUrl} alt="Selected aerial preview" className="max-h-72 rounded-lg border border-earth-300 shadow-sm" />
                  <div className="text-sm text-forest-600">
                    <p className="font-semibold">{file?.name}</p>
                    <p className="text-forest-500">{(file!.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-forest-500">
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg border border-earth-200">
                    <UploadCloud size={28} className="text-forest-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-700">Drag aerial image here</p>
                    <p className="text-sm text-forest-500 mt-1">or click to select</p>
                  </div>
                  <p className="text-xs text-forest-400 pt-2">JPG, PNG or WEBP · up to 20MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Step 3 & 4: Analysis and Verification Info */}
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-6 sm:p-8">
            <h3 className="font-bold text-forest-800 mb-3">What Happens Next</h3>
            <div className="space-y-2 text-sm text-forest-700">
              <p>
                <strong className="text-forest-800">Step 3:</strong> Our AI system will analyze the aerial image to detect and count wildlife, identifying species and providing confidence scores for each detection.
              </p>
              <p>
                <strong className="text-forest-800">Step 4:</strong> You'll review the AI results as a ranger and verify the final animal count before saving to your conservation records. <em className="text-forest-600">AI assists. Rangers decide.</em>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !file || !surveyName.trim()}
              className="flex-1 bg-forest-600 hover:bg-forest-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analysing...
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  Analyse with AI
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-white border border-earth-300 hover:border-forest-400 text-forest-700 font-bold py-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
