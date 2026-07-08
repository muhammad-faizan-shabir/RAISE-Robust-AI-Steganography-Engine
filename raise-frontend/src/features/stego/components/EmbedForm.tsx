'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle, Lock, Minimize2, FileText, Image as ImageIcon, File, ShieldCheck } from 'lucide-react';
import { stegoApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

type ContentType = 'text' | 'image' | 'pdf';
type ProcessingMode = 'none' | 'encrypt' | 'compress' | 'compress+encrypt';

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'text',  label: 'Text',  icon: <FileText className="h-4 w-4" />,   desc: 'Hide a secret text message' },
  { value: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" />,  desc: 'Hide an image (PNG or JPEG)' },
  { value: 'pdf',   label: 'PDF',   icon: <File className="h-4 w-4" />,       desc: 'Hide a PDF document' },
];

const SECRET_FILE_ACCEPT: Record<ContentType, string> = {
  text:  '',
  image: 'image/png,image/jpeg,image/jpg',
  pdf:   'application/pdf',
};

export default function EmbedForm() {
  const router = useRouter();

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // What to embed
  const [contentType, setContentType] = useState<ContentType>('text');
  const [message, setMessage] = useState('');
  const [secretFile, setSecretFile] = useState<File | null>(null);

  // Processing options (text only)
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('none');

  // Model
  const [architecture, setArchitecture] = useState<'dense' | 'basic'>('dense');

  // Access control
  const [recipientEmail, setRecipientEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/image\/(png|jpeg|jpg)/)) {
      toast.error('Cover image must be PNG or JPEG');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Cover image must be under 10 MB');
      return;
    }
    setCoverFile(f);
  };

  const handleSecretFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Secret file must be under 10 MB');
      return;
    }
    setSecretFile(f);
  };

  const handleContentTypeChange = (ct: ContentType) => {
    setContentType(ct);
    setSecretFile(null);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverFile) { toast.error('Please select a cover image'); return; }

    if (contentType === 'text' && !message.trim()) {
      toast.error('Please enter a message to embed');
      return;
    }
    if ((contentType === 'image' || contentType === 'pdf') && !secretFile) {
      toast.error(`Please select a ${contentType === 'image' ? 'PNG/JPEG image' : 'PDF file'} to embed`);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setCurrentStep('');

    try {
      let processedMessage = message.trim();

      if (contentType === 'text') {
        if (processingMode === 'compress' || processingMode === 'compress+encrypt') {
          setCurrentStep('Compressing...');
          const { compressed_text } = await stegoApi.compressText(processedMessage);
          processedMessage = compressed_text;
        }
        if (processingMode === 'encrypt' || processingMode === 'compress+encrypt') {
          setCurrentStep('Encrypting...');
          const { encrypted_text } = await stegoApi.encryptText(processedMessage);
          processedMessage = encrypted_text;
        }
      }

      setCurrentStep('Uploading...');
      const response = await stegoApi.embed(
        coverFile,
        {
          message: contentType === 'text' ? processedMessage : undefined,
          content_type: contentType,
          architecture,
          method: 'auto',
          recipient_email: recipientEmail.trim() || undefined,
        },
        (progress) => setUploadProgress(progress),
        contentType !== 'text' ? secretFile ?? undefined : undefined,
      );

      toast.success(
        <div>
          <p className="font-semibold">Job submitted successfully!</p>
          <p className="text-sm">Job ID: {response.job_id}</p>
          <p className="text-xs mt-1">Check history to download the result</p>
        </div>,
        { duration: 5000 }
      );

      setTimeout(() => { router.push(ROUTES.DASHBOARD); }, 2000);
    } catch (error: any) {
      console.error('Embed error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to submit embed job');
      setIsSubmitting(false);
      setCurrentStep('');
    }
  };

  const canSubmit = coverFile && (contentType === 'text' ? message.trim().length > 0 : !!secretFile);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Cover Image Upload */}
      <div className="w-full">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleCoverChange}
          className="hidden"
          id="cover-upload"
          disabled={isSubmitting}
        />
        <label
          htmlFor="cover-upload"
          className={`flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            coverFile
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-black/20 hover:bg-black/30'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className={`h-10 w-10 mb-4 transition-colors ${coverFile ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-base font-medium text-foreground mb-1">
            {coverFile ? coverFile.name : 'Click or drag to upload cover image'}
          </p>
          <p className="text-sm text-muted-foreground">PNG or JPEG, max 10 MB</p>
        </label>
      </div>

      {/* Content Type Selector */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-3">What to embed</label>
        <div className="grid grid-cols-3 gap-3">
          {CONTENT_TYPE_OPTIONS.map(({ value, label, icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleContentTypeChange(value)}
              disabled={isSubmitting}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-sm font-medium ${
                contentType === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-black/20 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {icon}
              <span>{label}</span>
              <span className="text-xs font-normal text-center leading-tight opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text message input */}
      {contentType === 'text' && (
        <div className="w-full">
          <label className="block text-sm font-medium text-foreground mb-2">Secret Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your secret message here..."
            rows={6}
            disabled={isSubmitting}
            className="w-full px-4 py-4 rounded-2xl bg-black/20 hover:bg-black/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-black/30 transition-all resize-none disabled:opacity-50"
            required
          />
          <p className="text-muted-foreground text-xs mt-1">{message.length} characters</p>
        </div>
      )}

      {/* Secret file upload (image or PDF) */}
      {(contentType === 'image' || contentType === 'pdf') && (
        <div className="w-full">
          <label className="block text-sm font-medium text-foreground mb-2">
            Secret {contentType === 'image' ? 'Image' : 'PDF'} File *
          </label>
          <input
            type="file"
            accept={SECRET_FILE_ACCEPT[contentType]}
            onChange={handleSecretFileChange}
            className="hidden"
            id="secret-file-upload"
            disabled={isSubmitting}
          />
          <label
            htmlFor="secret-file-upload"
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
              secretFile
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-black/20 hover:bg-black/30'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {contentType === 'image'
              ? <ImageIcon className={`h-8 w-8 mb-2 ${secretFile ? 'text-primary' : 'text-muted-foreground'}`} />
              : <File className={`h-8 w-8 mb-2 ${secretFile ? 'text-primary' : 'text-muted-foreground'}`} />
            }
            <p className="text-sm font-medium text-foreground">
              {secretFile ? secretFile.name : `Click to select ${contentType === 'image' ? 'PNG or JPEG' : 'PDF'}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Max 10 MB</p>
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {/* Message Processing (text only) — spans row above method+arch */}
        {contentType === 'text' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Message Pre-Processing
            </label>
            <select
              value={processingMode}
              onChange={(e) => setProcessingMode(e.target.value as ProcessingMode)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 appearance-none"
            >
              <option value="none">None</option>
              <option value="encrypt">Encrypt (AES-256-GCM)</option>
              <option value="compress">Compress (zlib)</option>
              <option value="compress+encrypt">Compress + Encrypt</option>
            </select>
            {processingMode !== 'none' && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Minimize2 className="h-3 w-3 flex-shrink-0" />
                <span>
                  {processingMode === 'encrypt' && 'AES-256-GCM encryption added'}
                  {processingMode === 'compress' && 'zlib compression added'}
                  {processingMode === 'compress+encrypt' && 'Compression & encryption added'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* AI Architecture */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">AI Architecture</label>
          <select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value as 'dense' | 'basic')}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 appearance-none"
          >
            <option value="dense">Dense (Recommended)</option>
            <option value="basic">Basic</option>
          </select>
          <p className="text-muted-foreground text-xs mt-1">Dense provides better hiding capacity</p>
        </div>
      </div>

      {/* Recipient Access Control */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Intended Recipient (optional)
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="recipient@example.com"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl bg-black/20 hover:bg-black/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
        />
        <p className="text-muted-foreground text-xs mt-1">
          {recipientEmail.trim()
            ? 'Only you and this recipient will be able to extract data from the image.'
            : 'Leave blank to allow only yourself to extract the data.'}
        </p>
      </div>

      {/* Progress */}
      {isSubmitting && (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {currentStep || 'Processing...'}
            </span>
            {uploadProgress > 0 && <span>{uploadProgress}%</span>}
          </div>
          {uploadProgress > 0 && (
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Embed {contentType === 'text' ? 'Message' : contentType === 'image' ? 'Image' : 'PDF'}
            </>
          )}
        </button>
        {isSubmitting && currentStep === 'Uploading...' && (
          <p className="text-center text-muted-foreground text-sm mt-4">
            Your job is being processed in the background. You'll be redirected to the dashboard.
          </p>
        )}
      </div>
    </form>
  );
}
