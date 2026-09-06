import type { Survey } from "../types";

export const SUPPORTED_SPECIES = ["elephant", "giraffe", "impala", "springbok"] as const;

export const SPECIES_COLORS: Record<string, string> = {
  elephant: "#155d54",
  giraffe: "#2078d4",
  impala: "#686d78",
  springbok: "#b96922",
};

export const SPECIES_LABELS: Record<string, string> = {
  elephant: "Elephant",
  giraffe: "Giraffe",
  impala: "Impala",
  springbok: "Springbok",
};

export function displayDate(value: string | null | undefined, withTime = false) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function recordCount(survey: Survey) {
  return survey.verified_total || survey.ai_total || 0;
}

export function summarizeSurveys(surveys: Survey[]) {
  const speciesTotals: Record<string, number> = {};
  let totalAnimals = 0;

  for (const survey of surveys) {
    totalAnimals += recordCount(survey);
    for (const item of survey.species_counts) {
      speciesTotals[item.species] =
        (speciesTotals[item.species] || 0) + (item.verified_count ?? item.ai_count ?? 0);
    }
  }

  return {
    totalAnimals,
    imagesAnalyzed: surveys.length,
    speciesDetected: Object.values(speciesTotals).filter((count) => count > 0).length,
    latestAnalysis: surveys[0],
    averageAnimals: surveys.length ? Math.round(totalAnimals / surveys.length) : 0,
    speciesTotals,
  };
}

export function topSpeciesText(survey: Survey) {
  const names = [...survey.species_counts]
    .filter((item) => (item.verified_count || item.ai_count) > 0)
    .sort((a, b) => recordSpeciesCount(b) - recordSpeciesCount(a))
    .slice(0, 3)
    .map((item) => SPECIES_LABELS[item.species] || item.species);

  return names.length ? names.join(", ") : "No species detected";
}

function recordSpeciesCount(item: { verified_count: number; ai_count: number }) {
  return item.verified_count || item.ai_count || 0;
}
