export type Species = "elephant" | "giraffe" | "impala" | "springbok";

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  species: Species;
  confidence: number;
  bbox: BBox;
}

export interface AnalyzeResult {
  success: boolean;
  demo: boolean;
  total_animals: number;
  species_counts: Record<string, number>;
  detections: Detection[];
  average_confidence: number;
  processing_time: number;
  image_url: string;
  annotated_image_url: string;
  image_path: string;
  annotated_image_path: string;
  message?: string;
}

export interface SpeciesCount {
  species: string;
  ai_count: number;
  verified_count: number;
  average_confidence: number;
}

export interface Survey {
  id: number;
  survey_name: string;
  survey_date: string | null;
  location: string | null;
  image_path: string | null;
  annotated_image_path: string | null;
  ai_total: number;
  verified_total: number;
  notes: string | null;
  average_confidence: number;
  processing_time: number;
  status: string;
  created_at: string;
  updated_at: string;
  species_counts: SpeciesCount[];
}
