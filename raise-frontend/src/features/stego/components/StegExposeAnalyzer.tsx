"use client";

// src/features/stego/components/StegExposeAnalyzer.tsx
// Main feature component for StegExpose steganalysis

import React, { useState, useCallback, useRef } from "react";
import { analyzeImageStegExpose } from "@/lib/api/stegexpose";
import type {
  StegExposeResponse,
  SpeedMode,
  Verdict,
  DetectorScores,
} from "@/types/stegexpose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const verdictConfig: Record<
  Verdict,
  { color: string; bg: string; border: string; dot: string; label: string }
> = {
  Clean: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    dot: "bg-emerald-400",
    label: "No Hidden Data",
  },
  Suspicious: {
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    border: "border-amber-500/50",
    dot: "bg-amber-400",
    label: "Possibly Hidden Data",
  },
  "Likely Stego": {
    color: "text-rose-400",
    bg: "bg-rose-500/20",
    border: "border-rose-500/50",
    dot: "bg-rose-400",
    label: "Hidden Data Detected",
  },
};

const detectorLabels: Record<keyof DetectorScores, string> = {
  primary_sets: "Primary Sets",
  chi_square: "Chi Square",
  sample_pairs: "Sample Pairs",
  rs_analysis: "RS Analysis",
};

const detectorDescriptions: Record<keyof DetectorScores, string> = {
  primary_sets: "Dumitrescu",
  chi_square: "Westfeld",
  sample_pairs: "Dumitrescu",
  rs_analysis: "Fridrich",
};

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-black/20 rounded-full" />
        <span className="text-sm text-muted-foreground font-mono w-12 text-right">N/A</span>
      </div>
    );
  }

  const pct = Math.round(score * 100);
  const color =
    score < 0.3
      ? "bg-emerald-400"
      : score < 0.65
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-foreground font-mono w-12 text-right">
        {pct}%
      </span>
    </div>
  );
}

function FusionGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (pct / 100) * circumference;

  const strokeColor =
    score < 0.3 ? "#34d399" : score < 0.65 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(var(--foreground), 0.15)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black font-mono tracking-tighter"
          style={{ color: strokeColor }}
        >
          {pct}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
          fusion
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StegExposeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [speed, setSpeed] = useState<SpeedMode>("standard");
  const [threshold, setThreshold] = useState<number>(0.2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StegExposeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeImageStegExpose({ image: file, speed, threshold });
      setResult(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const verdict = result ? verdictConfig[result.verdict] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
          {/* ── Left column: Upload + Controls ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
                flex flex-col items-center justify-center text-center overflow-hidden
                ${dragOver
                  ? "border-primary bg-primary/10"
                  : file
                  ? "border-border bg-black/20"
                  : "border-border bg-black/20 hover:border-primary/50 hover:bg-black/30"
                }
              `}
              style={{ minHeight: "220px" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleInputChange}
                className="hidden"
              />

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover absolute inset-0 opacity-40"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2 p-6">
                    <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur border border-border flex items-center justify-center mb-1">
                      <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-foreground truncate max-w-[180px]">
                      {file?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {file ? (file.size / 1024).toFixed(1) : 0} KB · Click to change
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-8 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl border border-border bg-black/30 flex items-center justify-center mb-1">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Drop image here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls card */}
            <div className="rounded-2xl border border-border bg-black/20 p-5 flex flex-col gap-5">
              {/* Speed toggle */}
              <div>
                <label className="block text-sm text-muted-foreground uppercase tracking-widest mb-3">
                  Detection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["standard", "fast"] as SpeedMode[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`
                        rounded-xl py-2.5 px-3 text-base font-medium transition-all duration-150 border
                        ${speed === s
                          ? "bg-primary/20 border-primary text-primary-foreground"
                          : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                        }
                      `}
                    >
                      <div className="font-semibold capitalize">{s}</div>
                      <div className="text-xs mt-0.5 opacity-90">
                        {s === "standard" ? "All 4 detectors" : "Early exit"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-muted-foreground uppercase tracking-widest">
                    Threshold
                  </label>
                  <span className="text-sm font-mono text-primary bg-primary/20 px-2 py-0.5 rounded-md">
                    {threshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5 font-mono">
                  <span>0.0 sensitive</span>
                  <span>1.0 strict</span>
                </div>
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`
                w-full rounded-xl py-3.5 text-base font-bold tracking-wide transition-all duration-200 shadow-sm
                ${!file || loading
                  ? "bg-black/20 text-muted-foreground cursor-not-allowed border border-border"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 active:scale-[0.98]"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </span>
              ) : (
                "Run Analysis"
              )}
            </button>

            {result && (
              <button
                onClick={handleReset}
                className="w-full rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-black/20 transition-all"
              >
                Clear & Reset
              </button>
            )}
          </div>

          {/* ── Right column: Results ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Error state */}
            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-rose-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-rose-300 mb-1">Analysis Failed</p>
                    <p className="text-sm text-rose-200/80 leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div className="flex-1 rounded-2xl border border-border bg-black/20 flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl border border-border bg-black/30 flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-base text-foreground mb-1">No results yet</p>
                <p className="text-sm text-muted-foreground">Upload a PNG or BMP image and run the analysis</p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="rounded-2xl border border-border bg-black/20 p-6 min-h-[400px] flex flex-col gap-6 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-36 h-36 rounded-full bg-black/30" />
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-6 bg-black/30 rounded-lg w-2/3" />
                    <div className="h-4 bg-black/30 rounded-lg w-1/2" />
                    <div className="h-4 bg-black/30 rounded-lg w-3/4" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-4 bg-black/30 rounded w-1/3" />
                      <div className="h-2 bg-black/30 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && verdict && (
              <div className="rounded-2xl border border-border bg-black/20 overflow-hidden">
                {/* Verdict header */}
                <div className={`px-6 py-5 border-b border-border ${verdict.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${verdict.dot} animate-pulse`} />
                      <div>
                        <p className={`text-xl font-black tracking-tight ${verdict.color}`}>
                          {result.verdict}
                        </p>
                        <p className="text-sm text-foreground/80 mt-0.5">{verdict.label}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-mono border ${verdict.bg} ${verdict.border} ${verdict.color}`}>
                      {result.above_threshold ? "FLAGGED" : "CLEAR"}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-6">
                  {/* Gauge + meta */}
                  <div className="flex items-center gap-6">
                    <FusionGauge score={result.fusion_score} />
                    <div className="flex flex-col gap-3 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">File</p>
                        <p className="text-base text-foreground truncate font-mono">{result.filename}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Threshold</p>
                          <p className="text-base font-mono text-foreground/90">{result.threshold_used.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Mode</p>
                          <p className="text-base font-mono text-foreground/90 capitalize">{result.speed_mode}</p>
                        </div>
                      </div>
                      {result.estimated_hidden_bytes !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Est. Hidden Data</p>
                          <p className={`text-base font-mono font-semibold ${verdict.color}`}>
                            {result.estimated_hidden_bytes.toLocaleString()} bytes
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Detector scores */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                      Detector Breakdown
                    </p>
                    <div className="flex flex-col gap-4">
                      {(Object.keys(detectorLabels) as (keyof DetectorScores)[]).map((key) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base text-foreground font-medium">
                                {detectorLabels[key]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {detectorDescriptions[key]}
                              </span>
                            </div>
                          </div>
                          <ScoreBar score={result.detector_scores[key]} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  {result.note && (
                    <div className="rounded-xl border border-border bg-black/20 p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-foreground/80 leading-relaxed">{result.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info card — always visible */}
            <div className="rounded-2xl border border-border bg-black/20 p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">About StegExpose</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Default threshold", value: "0.2" },
                  { label: "Standard mode", value: "~1.2s / image" },
                  { label: "Fast mode", value: "~0.34s / image" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm text-foreground font-mono">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  );
}