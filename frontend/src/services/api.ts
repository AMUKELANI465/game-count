import type { AnalyzeResult, Survey } from "../types";

// Leave this unset locally so Vite's proxy handles /api, /uploads and /results.
// Set VITE_API_URL to the deployed backend origin for production builds.
const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function assetUrl(path: string | null | undefined): string {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path ?? "";
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore - fall back to statusText
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => fetch(`${BASE_URL}/api/health`).then((r) => handle<{ status: string; demo_mode: boolean; species_supported: string[] }>(r)),

  analyze: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE_URL}/api/analyze`, { method: "POST", body: formData }).then((r) =>
      handle<AnalyzeResult>(r)
    );
  },

  createSurvey: (payload: Record<string, unknown>) =>
    fetch(`${BASE_URL}/api/surveys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<Survey>(r)),

  listSurveys: () => fetch(`${BASE_URL}/api/surveys`).then((r) => handle<Survey[]>(r)),

  getSurvey: (id: number) => fetch(`${BASE_URL}/api/surveys/${id}`).then((r) => handle<Survey>(r)),

  updateSurvey: (id: number, payload: Record<string, unknown>) =>
    fetch(`${BASE_URL}/api/surveys/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<Survey>(r)),

  deleteSurvey: (id: number) =>
    fetch(`${BASE_URL}/api/surveys/${id}`, { method: "DELETE" }).then((r) => handle<{ success: boolean }>(r)),
};

export const SPECIES_EMOJI: Record<string, string> = {
  elephant: "🐘",
  giraffe: "🦒",
  impala: "🦌",
  springbok: "🐐",
};
