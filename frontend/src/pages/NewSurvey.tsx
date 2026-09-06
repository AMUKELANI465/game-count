import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { UploadCloud, Loader2, ArrowRight, MapPin, Calendar, BookOpen, X } from "lucide-react";
import { api } from "../services/api";

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

  function clearFile() {
    setFile(null);
    setPreviewUrl(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a wildlife image first.");
      return;
    }
    setError("");
    setAnalyzing(true);
    try {
      const result = await api.analyze(file);
      navigate("/analysis", {
        state: {
          survey: {
            survey_name: surveyName.trim() || "Untitled analysis",
            survey_date: surveyDate,
            location,
            notes,
          },
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
    <div className="page-shell">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950">Upload a Wildlife Image</h1>
          <p className="text-earth-500 text-base mt-2">
            GameCount will detect and count elephant, giraffe, impala and springbok.
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload */}
          <div className="gc-card p-6 sm:p-8">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && !previewUrl && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all ${
                previewUrl ? "" : "cursor-pointer"
              } ${
                dragActive
                  ? "border-accent-500 bg-accent-50"
                  : "border-earth-300 hover:border-neutral-400 bg-earth-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                aria-label="Upload wildlife image"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={previewUrl} alt="Selected preview" className="max-h-72 rounded-xl border border-earth-200 shadow-sm" />
                  <div className="text-sm text-neutral-800 text-center">
                    <p className="font-semibold">{file?.name}</p>
                    <p className="text-earth-500">{(file!.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button type="button" onClick={clearFile} className="gc-button-secondary !py-2 !px-4 text-sm">
                    <X size={14} />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-earth-500">
                  <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl border border-earth-200">
                    <UploadCloud size={26} className="text-neutral-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">Drag an image here</p>
                    <p className="text-sm text-earth-500 mt-1">or tap to choose from your gallery or camera</p>
                  </div>
                  <p className="text-xs text-earth-400 pt-2">JPG, PNG or WEBP · up to 20MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Optional details */}
          <div className="gc-card p-6 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-earth-500 mb-5">Optional details</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="survey-name" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Label
                </label>
                <input
                  id="survey-name"
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder="e.g. North paddock, morning count"
                  className="gc-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="survey-date" className="block text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                    <Calendar size={15} />
                    Date
                  </label>
                  <input id="survey-date" type="date" value={surveyDate} onChange={(e) => setSurveyDate(e.target.value)} className="gc-input" />
                </div>

                <div>
                  <label htmlFor="survey-location" className="block text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                    <MapPin size={15} />
                    Location
                  </label>
                  <input
                    id="survey-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Northern block"
                    className="gc-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="survey-notes" className="block text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                  <BookOpen size={15} />
                  Notes
                </label>
                <textarea
                  id="survey-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional observations about conditions, visibility, behaviour..."
                  className="gc-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !file}
              className="gc-button-primary flex-1 !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Image
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <button onClick={() => navigate("/dashboard")} className="gc-button-secondary flex-1 !py-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
