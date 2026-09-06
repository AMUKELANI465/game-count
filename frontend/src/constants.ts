export const SPECIES = ["elephant", "giraffe", "impala", "springbok"] as const;

// Shared per-species colour used for bounding boxes, charts and legends
// across DetectionImage, Analysis and Analytics.
export const SPECIES_COLORS: Record<string, string> = {
  elephant: "#155d54",
  giraffe: "#b96922",
  impala: "#5aa2f2",
  springbok: "#686d78",
};
