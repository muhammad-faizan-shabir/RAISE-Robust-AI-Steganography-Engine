'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, Download, Trash2, History, CheckCircle, XCircle, 
  Clock, Filter, Loader2, Eye, RefreshCw, FileText, Unlock, Minimize2
} from 'lucide-react';
import { stegoApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { SidebarLayout } from '@/components/layout';
import { formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface JobItem {
  id: string;
  job_id: string;
  operation_type: 'embed' | 'extract';
  original_filename: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  created_at: string;
  payload_type?: string | null;
  method_used?: string | null;
  result?: {
    message?: string;
    output_path?: string;
    extracted_message?: string;
    content_type?: string;
    extracted_filename?: string;
    extracted_file_path?: string;
    extracted_mime_type?: string;
    [key: string]: any;
  };
  error?: string;
  progress?: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'embed' | 'extract'>('all');
  const [pollingJobIds, setPollingJobIds] = useState<Set<string>>(new Set());
  const [viewingMessage, setViewingMessage] = useState<{ jobId: string; message: string } | null>(null);
  const [processedMessage, setProcessedMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<'decrypt' | 'decompress' | 'decrypt+decompress' | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await stegoApi.getHistory({ 
        page, 
        page_size: 10,
        operation_type: filter === 'all' ? undefined : filter
      });
      setJobs(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsAuthLoading(false);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
    } else if (!isAuthLoading && isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, isAuthLoading, page, router, loadHistory]);

  const checkJobStatus = useCallback(async (jobId: string) => {
    if (pollingJobIds.has(jobId)) return; // Prevent duplicate polling

    setPollingJobIds(prev => new Set(prev).add(jobId));

    try {
      const status = await stegoApi.getJobStatus(jobId);
      
      // Extract progress percentage if it's an object
      let progressPercentage: number | undefined = undefined;
      if (status.progress) {
        if (typeof status.progress === 'number') {
          progressPercentage = status.progress;
        } else if (typeof status.progress === 'object' && 'percent' in status.progress) {
          progressPercentage = (status.progress as { percent: number }).percent;
        }
      }
      
      // Update the job in the list
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.job_id === jobId 
            ? { 
                ...job, 
                status: status.status,
                progress: progressPercentage,
                result: status.result,
                error: status.error
              }
            : job
        )
      );

      // Show notification on completion
      if (status.status === 'SUCCESS') {
        const job = jobs.find(j => j.job_id === jobId);
        if (job) {
          toast.success(
            `${job.operation_type === 'embed' ? 'Embed' : 'Extract'} job completed!`,
            { duration: 4000 }
          );
        }
      } else if (status.status === 'FAILURE') {
        toast.error(`Job failed: ${status.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to check job status:', error);
    } finally {
      setPollingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  }, [jobs, pollingJobIds]);

  // Auto-poll for pending/progress jobs
  useEffect(() => {
    const pendingJobs = jobs.filter(
      job => job.status === 'PENDING' || job.status === 'PROGRESS'
    );

    if (pendingJobs.length === 0) return;

    const interval = setInterval(() => {
      pendingJobs.forEach(job => {
        checkJobStatus(job.job_id);
      });
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [jobs, checkJobStatus]);

  const handleDownload = async (jobId: string, filename: string) => {
    try {
      toast.loading('Downloading...', { id: 'download' });
      const blob = await stegoApi.downloadResult(jobId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `stego-image-${jobId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download complete!', { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file', { id: 'download' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this operation?')) return;

    try {
      await stegoApi.deleteOperation(id);
      toast.success('Operation deleted');
      loadHistory();
    } catch (error) {
      toast.error('Failed to delete operation');
    }
  };

  const handleViewMessage = (jobId: string, message: string) => {
    setViewingMessage({ jobId, message });
    setProcessedMessage(null);
    setIsProcessing(null);
  };

  const handlePostProcess = async (mode: 'decrypt' | 'decompress' | 'decrypt+decompress') => {
    if (!viewingMessage || isProcessing) return;
    setIsProcessing(mode);
    try {
      const source = processedMessage ?? viewingMessage.message;
      let result = source;

      if (mode === 'decrypt' || mode === 'decrypt+decompress') {
        const { decrypted_text } = await stegoApi.decryptText(result);
        result = decrypted_text;
      }

      if (mode === 'decompress' || mode === 'decrypt+decompress') {
        const { decompressed_text } = await stegoApi.decompressText(result);
        result = decompressed_text;
      }

      setProcessedMessage(result);
      toast.success('Text processed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.message || 'Processing failed');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    filter === 'all' || job.operation_type === filter
  );

  if (isAuthLoading || isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Loading history...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* The Main Centered Container (Liquid Glass) */}
        <div className="relative w-full max-w-6xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 bg-white/[0.03] backdrop-blur-2xl ring-1 ring-white/5 flex flex-col max-h-[85vh]">
          
          {/* Header Section */}
          <div className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-2">
                Operation History
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-light">
                {jobs.length} total job{jobs.length !== 1 ? 's' : ''} recorded
              </p>
            </div>

            {/* Filter & Refresh */}
            <div className="flex items-center gap-3">
              <button
                onClick={loadHistory}
                className="p-2.5 rounded-xl border border-border bg-black/20 hover:bg-black/40 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-foreground" />
              </button>
              <div className="flex items-center gap-2 bg-black/20 border border-border rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/50">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as any);
                    setPage(1);
                  }}
                  className="bg-transparent text-foreground text-sm focus:outline-none cursor-pointer py-1 appearance-none pr-2"
                >
                  <option value="all" className="bg-[#1a1b1e]">All Operations</option>
                  <option value="embed" className="bg-[#1a1b1e]">Embed Only</option>
                  <option value="extract" className="bg-[#1a1b1e]">Extract Only</option>
                </select>
              </div>
            </div>
          </div>

        {/* Content Area (Scrollable) */}
        <div className="overflow-y-auto pr-2 pb-4 space-y-4 flex-1">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-black/20 p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="h-16 w-16 bg-black/30 border border-border rounded-2xl flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No operations yet</h3>
              <p className="text-muted-foreground mb-8">
                Start embedding or extracting messages to see your history
              </p>
              <div className="flex justify-center gap-4">
                <Link href={ROUTES.STEGO.EMBED}>
                  <button className="px-6 py-3 bg-primary rounded-xl text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm">
                    Embed Message
                  </button>
                </Link>
                <Link href={ROUTES.STEGO.EXTRACT}>
                  <button className="px-6 py-3 rounded-xl border border-border bg-black/20 text-foreground hover:bg-black/40 transition-all">
                    Extract Message
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-border bg-black/20 p-6 hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      job.operation_type === 'embed' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}>
                      {job.operation_type === 'embed' ? (
                        <Upload className="h-6 w-6" />
                    ) : (
                        <Download className="h-6 w-6" />
                    )}
                  </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg capitalize">
                          {job.operation_type === 'embed' ? 'Embed' : 'Extract'} Message
                    </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          job.status === 'SUCCESS' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : job.status === 'FAILURE'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : job.status === 'PROGRESS'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {job.status === 'SUCCESS' && <CheckCircle className="h-3 w-3" />}
                          {job.status === 'FAILURE' && <XCircle className="h-3 w-3" />}
                          {(job.status === 'PENDING' || job.status === 'PROGRESS') && <Loader2 className="h-3 w-3 animate-spin" />}
                          {job.status}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-1 truncate">
                        {job.original_filename}
                    </p>

                      {/* Method / payload badges */}
                      {(job.method_used || job.payload_type) && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {job.method_used && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              {job.method_used === 'lsb' ? 'LSB' : 'SteganoGAN'}
                            </span>
                          )}
                          {job.payload_type && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                              {job.payload_type}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(job.created_at)}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="font-mono text-muted-foreground/60">ID: {job.job_id.slice(0, 8)}</span>
                      </div>

                      {/* Progress Bar for in-progress jobs */}
                      {job.status === 'PROGRESS' && job.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Processing...</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                job.operation_type === 'embed'
                                  ? 'bg-rose-500'
                                  : 'bg-sky-500'
                              }`}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {job.status === 'FAILURE' && job.error && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400">{job.error}</p>
                        </div>
                      )}

                      {/* Extracted File Download */}
                      {job.status === 'SUCCESS' && job.operation_type === 'extract' && job.result?.content_type && job.result.content_type !== 'text' && (
                        <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-xs text-primary font-medium mb-1">Extracted File:</p>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground/80">{job.result.extracted_filename}</span>
                            <button
                              onClick={() => handleDownload(job.job_id, job.result!.extracted_filename || `extracted-${job.job_id}`)}
                              className="ml-auto text-xs text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Extracted Message Preview */}
                      {job.status === 'SUCCESS' && job.operation_type === 'extract' && (!job.result?.content_type || job.result?.content_type === 'text') && (job.result?.message || job.result?.extracted_message) && (
                        <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-xs text-primary font-medium mb-1">Extracted Message:</p>
                          <p className="text-sm text-foreground/80 line-clamp-2">
                            {job.result.extracted_message || job.result.message}
                          </p>
                          {((job.result.extracted_message || job.result.message) ?? '').length > 100 && (
                            <button
                              onClick={() => handleViewMessage(job.job_id, job.result!.extracted_message || job.result!.message!)}
                              className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View Full Message
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Download Button for successful embed jobs */}
                    {job.status === 'SUCCESS' && job.operation_type === 'embed' && (
                      <button
                        onClick={() => handleDownload(job.job_id, job.result?.output_path || `stego-${job.job_id}.png`)}
                        className="p-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                        title="Download Result"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}

                    {/* Download Button for successful extract jobs with file result */}
                    {job.status === 'SUCCESS' && job.operation_type === 'extract' && job.result?.content_type && job.result.content_type !== 'text' && (
                      <button
                        onClick={() => handleDownload(job.job_id, job.result!.extracted_filename || `extracted-${job.job_id}`)}
                        className="p-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                        title="Download Extracted File"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}

                    {/* View Message Button for successful extract jobs with text result */}
                    {job.status === 'SUCCESS' && job.operation_type === 'extract' && (!job.result?.content_type || job.result?.content_type === 'text') && (job.result?.message || job.result?.extracted_message) && (
                      <button
                        onClick={() => handleViewMessage(job.job_id, job.result!.extracted_message || job.result!.message!)}
                        className="p-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                        title="View Message"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}

                    {/* Refresh Status Button for pending/progress jobs */}
                    {(job.status === 'PENDING' || job.status === 'PROGRESS') && (
                      <button
                        onClick={() => checkJobStatus(job.job_id)}
                        disabled={pollingJobIds.has(job.job_id)}
                        className="p-2.5 rounded-xl bg-black/20 hover:bg-black/40 text-muted-foreground hover:text-foreground border border-border transition-colors disabled:opacity-50"
                        title="Check Status"
                      >
                        <RefreshCw className={`h-5 w-5 ${pollingJobIds.has(job.job_id) ? 'animate-spin' : ''}`} />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2.5 rounded-xl bg-black/20 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 border border-border transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                </div>
            ))}
          </div>
        )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-border shrink-0">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border bg-black/20 text-foreground hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-border bg-black/20 text-foreground hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
        </div>

      {/* Message Viewer Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden ring-1 ring-white/10 border border-border/50">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Extracted Message</h3>
                    <p className="text-sm text-muted-foreground">Job ID: {viewingMessage.jobId.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="p-2 rounded-lg hover:bg-black/20 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4">
              {/* Raw / processed message */}
              <div>
                {processedMessage !== null && (
                  <p className="text-xs text-muted-foreground mb-1">Original (raw):</p>
                )}
                <div className="bg-black/40 rounded-xl p-4 border border-border shadow-inner">
                  <pre className="text-foreground text-sm whitespace-pre-wrap break-words font-mono">
                    {viewingMessage.message}
                  </pre>
                </div>
              </div>

              {/* Processed result */}
              {processedMessage !== null && (
                <div>
                  <p className="text-xs text-primary mb-1 font-medium">Processed result:</p>
                  <div className="bg-black/40 rounded-xl p-4 border border-primary/30 shadow-inner">
                    <pre className="text-foreground text-sm whitespace-pre-wrap break-words font-mono">
                      {processedMessage}
                    </pre>
                  </div>
                </div>
              )}

              {/* Post-Processing Controls */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Unlock className="h-3 w-3" />
                  Post-Processing
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['decrypt', 'decompress', 'decrypt+decompress'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handlePostProcess(mode)}
                      disabled={isProcessing !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 border border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing === mode ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : mode === 'decrypt' ? (
                        <Unlock className="h-3 w-3" />
                      ) : (
                        <Minimize2 className="h-3 w-3" />
                      )}
                      {mode === 'decrypt' && 'Decrypt'}
                      {mode === 'decompress' && 'Decompress'}
                      {mode === 'decrypt+decompress' && 'Decrypt \u2192 Decompress'}
                    </button>
                  ))}
                  {processedMessage !== null && (
                    <button
                      onClick={() => setProcessedMessage(null)}
                      className="px-3 py-1.5 rounded-lg bg-black/20 border border-border text-muted-foreground hover:bg-black/40 transition-all text-xs"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-black/10">
              <button
                onClick={() => {
                  const text = processedMessage ?? viewingMessage.message;
                  navigator.clipboard.writeText(text);
                  toast.success('Message copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 transition-colors shadow-sm"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setViewingMessage(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-black/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </SidebarLayout>
  );
}
