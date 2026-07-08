'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  TreePine,
  Shapes,
  Building2,
  Palette,
  User,
  Clock,
  ListOrdered,
  Timer,
} from 'lucide-react';
import { stegoApi } from '@/lib/api';
import type { GeneratePreset, GenerateProgressInfo } from '@/lib/api/stego';
import toast from 'react-hot-toast';

type GenerationState = 'idle' | 'submitting' | 'polling' | 'success' | 'failure';

interface PresetMeta {
  value: GeneratePreset;
  label: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}

const PRESETS: PresetMeta[] = [
  {
    value: 'nature',
    label: 'Nature',
    description: 'Natural landscapes with smooth gradients and textures',
    Icon: TreePine,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    value: 'abstract',
    label: 'Abstract',
    description: 'Geometric patterns with uniform color distribution',
    Icon: Shapes,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    value: 'architecture',
    label: 'Architecture',
    description: 'Buildings and interiors with clean lines',
    Icon: Building2,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    value: 'art',
    label: 'Art',
    description: 'Artistic paintings that mask embedding changes',
    Icon: Palette,
    color: 'text-[#bfb48f]',
    bg: 'bg-[#bfb48f]/10',
  },
  {
    value: 'portrait',
    label: 'Portrait',
    description: 'Professional portraits with complex regions',
    Icon: User,
    color: 'text-[#904e55]',
    bg: 'bg-[#904e55]/10',
  },
];

export default function GenerateForm() {
  const [selectedPreset, setSelectedPreset] = useState<GeneratePreset>('nature');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progressInfo, setProgressInfo] = useState<GenerateProgressInfo | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      stopPolling();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = (id: string) => {
    intervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await stegoApi.getGenerateJobStatus(id);

        if (statusResponse.status === 'PROGRESS' && statusResponse.progress) {
          setProgressInfo(statusResponse.progress);
          setProgressPercent(statusResponse.progress.progress);
        } else if (statusResponse.status === 'PENDING') {
          setProgressPercent((prev) => Math.min(prev + 2, 15));
        }

        if (statusResponse.status === 'SUCCESS') {
          stopPolling();
          setProgressPercent(100);
          try {
            const blob = await stegoApi.downloadResult(id);
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setImageUrl(url);
            setGenerationState('success');
            toast.success('Cover image generated successfully!');
          } catch {
            setErrorMessage('Image generated but failed to download. Please try again.');
            setGenerationState('failure');
          }
        } else if (statusResponse.status === 'FAILURE') {
          stopPolling();
          const msg =
            typeof statusResponse.error === 'string'
              ? statusResponse.error
              : 'Generation failed. AI Horde may be unavailable or the queue timed out.';
          setErrorMessage(msg);
          setGenerationState('failure');
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerationState('submitting');
    setProgressPercent(0);
    setProgressInfo(null);
    setErrorMessage(null);

    try {
      const response = await stegoApi.generateImage(selectedPreset);
      setJobId(response.job_id);
      setGenerationState('polling');
      startPolling(response.job_id);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to submit generation job. Please try again.';
      setErrorMessage(msg);
      setGenerationState('failure');
      toast.error(msg);
    }
  };

  const handleReset = () => {
    stopPolling();
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setJobId(null);
    setProgressInfo(null);
    setProgressPercent(0);
    setImageUrl(null);
    setErrorMessage(null);
    setGenerationState('idle');
  };

  const handleDownload = () => {
    if (!imageUrl || !jobId) return;
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = `cover_${jobId}.png`;
    anchor.click();
  };

  const isActive = generationState === 'submitting' || generationState === 'polling';
  const selectedPresetMeta = PRESETS.find((p) => p.value === selectedPreset)!;

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      {(generationState === 'idle' || generationState === 'failure') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select a Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((preset, index) => {
                const isSelected = selectedPreset === preset.value;
                const isLastOdd = index === PRESETS.length - 1 && PRESETS.length % 2 !== 0;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSelectedPreset(preset.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                        : 'border-border bg-black/20 hover:border-primary/50 hover:bg-black/30'
                    } ${isLastOdd ? 'sm:col-span-2' : ''}`}
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${preset.bg}`}
                    >
                      <preset.Icon className={`h-5 w-5 ${preset.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                        {isSelected && (
                          <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Failure error */}
          {generationState === 'failure' && errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Generation Failed</p>
                <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isActive}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {generationState === 'failure' ? (
              <>
                <RefreshCw className="h-5 w-5" />
                Try Again
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Generate Cover Image
              </>
            )}
          </button>
        </form>
      )}

      {/* Active / Polling State */}
      {(generationState === 'submitting' || generationState === 'polling') && (
        <div className="space-y-6">
          {/* Selected preset summary */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-border">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedPresetMeta.bg}`}>
              <selectedPresetMeta.Icon className={`h-5 w-5 ${selectedPresetMeta.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedPresetMeta.label} preset</p>
              <p className="text-xs text-muted-foreground">Generating a 512×512 PNG cover image</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                {generationState === 'submitting'
                  ? 'Submitting job…'
                  : progressInfo?.status || 'Queued — waiting for AI Horde…'}
              </span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(progressPercent, 3)}%` }}
              />
            </div>
          </div>

          {/* Progress details */}
          {progressInfo && (
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/20 border border-border">
                <ListOrdered className="h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-foreground">{progressInfo.queue_position}</p>
                <p className="text-[10px] text-muted-foreground text-center">Queue position</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/20 border border-border">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-foreground">{progressInfo.wait_time}s</p>
                <p className="text-[10px] text-muted-foreground text-center">Est. remaining</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/20 border border-border">
                <Timer className="h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-foreground">{progressInfo.elapsed}s</p>
                <p className="text-[10px] text-muted-foreground text-center">Elapsed</p>
              </div>
            </div>
          )}

          <p className="text-center text-muted-foreground text-xs">
            Generation typically takes 30 seconds to 5 minutes depending on the AI Horde queue.
          </p>
        </div>
      )}

      {/* Success State */}
      {generationState === 'success' && imageUrl && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Image Generated Successfully</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                Your 512×512 PNG cover image is ready to download.
              </p>
            </div>
          </div>

          {/* Image Preview */}
          <div className="rounded-xl overflow-hidden border border-border bg-black/20 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Generated ${selectedPreset} cover`}
              className="w-full max-w-[512px] mx-auto block"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Download className="h-5 w-5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border bg-black/20 hover:bg-black/30 text-foreground font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
