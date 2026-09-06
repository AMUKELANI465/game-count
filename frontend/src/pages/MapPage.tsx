import { useEffect, useState } from "react";
import { Map, AlertCircle, MapPin } from "lucide-react";
import { api } from "../services/api";
import type { Survey } from "../types";

export default function MapPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listSurveys()
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false));
  }, []);

  // GameCount does not currently capture GPS coordinates per analysis - only
  // a free-text location label. We deliberately do not plot markers here,
  // since inventing coordinates would misrepresent where an image was taken.
  const withLocation = surveys.filter((s) => s.location && s.location.trim().length > 0);

  return (
    <div className="page-shell">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 flex items-center gap-2">
            <Map size={30} />
            Map
          </h1>
          <p className="text-earth-500 mt-2">Mapping is a secondary feature - the core product is image counting.</p>
        </div>

        <div className="gc-card p-8 sm:p-12 text-center mb-6">
          <AlertCircle size={40} className="mx-auto mb-4 text-earth-300" />
          <h2 className="text-lg font-bold text-neutral-950 mb-2">Location mapping isn't available yet</h2>
          <p className="text-earth-500 text-sm max-w-md mx-auto">
            GameCount doesn't currently capture GPS coordinates for an analysis - only an optional text label. We
            won't plot approximate or invented positions on a map, since that would misrepresent where an image
            was actually taken. Once analyses carry real coordinates (e.g. from photo EXIF data or manual entry),
            they'll appear here.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-earth-300 border-t-neutral-950 rounded-full" />
          </div>
        ) : withLocation.length > 0 ? (
          <div className="gc-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-earth-500 mb-4">Recorded Location Labels</h2>
            <div className="space-y-2">
              {withLocation.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-earth-50 border border-earth-200">
                  <div className="flex items-center gap-2 text-sm text-neutral-800">
                    <MapPin size={14} className="text-earth-400" />
                    {s.location}
                  </div>
                  <span className="text-xs text-earth-500">{s.survey_name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
