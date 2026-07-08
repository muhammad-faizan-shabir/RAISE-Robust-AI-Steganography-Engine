// src/types/stegexpose.ts
// Type definitions for the StegExpose steganalysis API

export interface DetectorScores {
  primary_sets: number | null;
  chi_square: number | null;
  sample_pairs: number | null;
  rs_analysis: number | null;
}

export type SpeedMode = "standard" | "fast";

export type Verdict = "Clean" | "Suspicious" | "Likely Stego";

export interface StegExposeResponse {
  filename: string;
  fusion_score: number;
  threshold_used: number;
  above_threshold: boolean;
  verdict: Verdict;
  estimated_hidden_bytes: number | null;
  detector_scores: DetectorScores;
  speed_mode: SpeedMode;
  note: string | null;
}

export interface StegExposeRequest {
  image: File;
  speed: SpeedMode;
  threshold: number;
}

export interface StegExposeError {
  detail: string;
}
