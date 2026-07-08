'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle, Info } from 'lucide-react';
import { stegoApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function ExtractForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [architecture, setArchitecture] = useState<'dense' | 'basic'>('dense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.match(/image\/(png|jpeg|jpg)/)) {
        toast.error('Please select a PNG or JPEG image');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select an image file');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const response = await stegoApi.extract(
        file,
        { architecture, method: 'auto' },
        (progress) => setUploadProgress(progress)
      );

      toast.success(
        <div>
          <p className="font-semibold">Job submitted successfully!</p>
          <p className="text-sm">Job ID: {response.job_id}</p>
          <p className="text-xs mt-1">Check history to view the extracted message</p>
        </div>,
        { duration: 5000 }
      );

      setTimeout(() => { router.push(ROUTES.DASHBOARD); }, 2000);
    } catch (error: any) {
      console.error('Extract error:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit extract job');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dropzone */}
      <div className="w-full">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isSubmitting}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            file
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-black/20 hover:bg-black/30'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className={`h-10 w-10 mb-4 transition-colors ${file ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-base font-medium text-foreground mb-1">
            {file ? file.name : 'Click or drag to upload stego-image'}
          </p>
          <p className="text-sm text-muted-foreground">PNG or JPEG, up to 10MB</p>
        </label>
      </div>

      {/* Form Controls */}
      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            AI Architecture
          </label>
          <select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value as 'dense' | 'basic')}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 appearance-none"
          >
            <option value="dense">Dense (Recommended)</option>
            <option value="basic">Basic</option>
          </select>
          <p className="text-muted-foreground text-xs mt-1">
            Select the architecture used when the image was originally embedded
          </p>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-3 border-l-2 border-primary pl-4 py-1">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tip:</span>{' '}
            SteganoGAN uses a neural network to decode hidden data. Select the same architecture that was used during embedding.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !file}
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
              Extract Message
            </>
          )}
        </button>
        {isSubmitting && (
          <p className="text-center text-muted-foreground text-sm mt-4">
            Your job is being processed in the background. You'll be redirected to the dashboard.
          </p>
        )}
      </div>
    </form>
  );
}
