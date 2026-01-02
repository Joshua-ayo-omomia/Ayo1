'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Caption } from './Typography';

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string;
  onChange: (url: string | null) => void;
  error?: string;
}

export function FileUpload({
  label,
  description,
  accept = 'image/*,.pdf',
  maxSizeMB = 5,
  value,
  onChange,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      setFileName(file.name);

      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // In production, upload to Supabase Storage
      // For now, we'll simulate with a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onChange(url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setFileName(null);
    onChange(null);
  }, [onChange]);

  const isImage = preview?.startsWith('data:image');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text mb-2">
        {label}
      </label>

      {value || preview ? (
        <div className="relative border border-border rounded-[6px] p-4 bg-surface">
          <div className="flex items-center gap-4">
            {isImage ? (
              <div className="w-16 h-16 rounded overflow-hidden bg-white border border-border flex-shrink-0">
                <img
                  src={preview || value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded bg-white border border-border flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-text-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {fileName || 'Uploaded file'}
              </p>
              <p className="text-xs text-text-muted">
                Click remove to change file
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-text-muted hover:text-error transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-[6px] p-8 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-text-muted',
            error && 'border-error'
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className="flex flex-col items-center">
            {uploading ? (
              <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-text-muted" />
              </div>
            )}

            <p className="text-sm text-text-secondary mb-1">
              {uploading ? (
                'Uploading...'
              ) : (
                <>
                  <span className="text-accent font-medium">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-text-muted">
              {accept.includes('image') ? 'PNG, JPG' : 'PDF'} up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {description && !error && (
        <Caption className="mt-2">{description}</Caption>
      )}

      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
