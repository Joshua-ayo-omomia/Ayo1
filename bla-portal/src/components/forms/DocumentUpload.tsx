'use client';

import { useState, useCallback, useRef } from 'react';
import {
  CloudUpload,
  X,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Caption } from '@/components/ui';

export type DocumentType =
  | 'photo'
  | 'proof_of_age'
  | 'proof_of_residence'
  | 'medical_certificate';

export type AcceptedFormat = 'jpg' | 'png' | 'pdf';

interface DocumentRequirements {
  title: string;
  requirements: string[];
  rejectionReasons: string[];
  exampleText?: string;
}

const documentRequirements: Record<DocumentType, DocumentRequirements> = {
  photo: {
    title: 'Passport-sized Photograph',
    requirements: [
      'Recent photo (taken within the last 6 months)',
      'White or light gray background',
      'Face clearly visible, no sunglasses or hats',
      'Dimensions: 35mm x 45mm (passport size)',
      'High resolution, minimum 300 DPI',
    ],
    rejectionReasons: [
      'Blurry or low-quality image',
      'Face partially obscured',
      'Incorrect background color',
      'Photo is too old',
    ],
    exampleText: 'Similar to a passport photo',
  },
  proof_of_age: {
    title: 'Proof of Age',
    requirements: [
      'Must be a government-issued document',
      'Shows your full legal name',
      'Shows your date of birth',
      'Document must be valid (not expired)',
      'All text must be clearly legible',
    ],
    rejectionReasons: [
      'Document is expired',
      'Name doesn\'t match application',
      'Date of birth not visible',
      'Poor image quality',
    ],
    exampleText: 'Birth certificate, passport, or national ID',
  },
  proof_of_residence: {
    title: 'Proof of Residence',
    requirements: [
      'Shows your current residential address',
      'Dated within the last 3 months',
      'Shows your full name',
      'Must be an official document',
      'Address must be in Barbados',
    ],
    rejectionReasons: [
      'Document older than 3 months',
      'Address doesn\'t match application',
      'Name doesn\'t match application',
      'Unofficial or handwritten document',
    ],
    exampleText: 'Utility bill, bank statement, or government letter',
  },
  medical_certificate: {
    title: 'Medical Certificate',
    requirements: [
      'Issued by a registered physician',
      'Dated within the last 3 months',
      'States fitness to drive',
      'Includes doctor\'s name and registration number',
      'Must have official stamp or letterhead',
    ],
    rejectionReasons: [
      'Certificate older than 3 months',
      'Missing doctor\'s credentials',
      'Doesn\'t confirm fitness to drive',
      'No official stamp or signature',
    ],
    exampleText: 'Form from any registered medical practitioner',
  },
};

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface DocumentUploadProps {
  label: string;
  documentType: DocumentType;
  required?: boolean;
  acceptedFormats?: AcceptedFormat[];
  maxSize?: number;
  onUpload: (file: UploadedFile | null) => void;
  currentFile?: UploadedFile | null;
  error?: string;
  userId?: string;
}

export function DocumentUpload({
  label,
  documentType,
  required = false,
  acceptedFormats = ['jpg', 'png', 'pdf'],
  maxSize = 5,
  onUpload,
  currentFile,
  error,
  userId,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const [file, setFile] = useState<UploadedFile | null>(currentFile || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const requirements = documentRequirements[documentType];

  const acceptString = acceptedFormats
    .map((format) => {
      switch (format) {
        case 'jpg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'pdf':
          return 'application/pdf';
        default:
          return '';
      }
    })
    .join(',');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId || 'anonymous'}/${documentType}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setUploadError(null);

      // Validate file type
      const fileType = selectedFile.type;
      const isValidType = acceptedFormats.some((format) => {
        if (format === 'jpg') return fileType === 'image/jpeg';
        if (format === 'png') return fileType === 'image/png';
        if (format === 'pdf') return fileType === 'application/pdf';
        return false;
      });

      if (!isValidType) {
        setUploadError(
          `Invalid file type. Accepted formats: ${acceptedFormats.join(', ').toUpperCase()}`
        );
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setUploadError(`File size must be less than ${maxSize}MB`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      try {
        const url = await uploadToSupabase(selectedFile);

        clearInterval(progressInterval);
        setUploadProgress(100);

        const uploadedFile: UploadedFile = {
          url,
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
        };

        setFile(uploadedFile);
        onUpload(uploadedFile);
      } catch (err) {
        clearInterval(progressInterval);
        console.error('Upload error:', err);
        setUploadError('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [acceptedFormats, maxSize, documentType, userId, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setFile(null);
    setUploadError(null);
    onUpload(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onUpload]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const isImage = file?.type.startsWith('image/');
  const hasError = !!error || !!uploadError;

  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      </div>

      {/* Upload Area */}
      {file ? (
        // Uploaded State
        <div
          className={cn(
            'border rounded-[6px] p-4 bg-white transition-colors',
            hasError ? 'border-error' : 'border-border'
          )}
        >
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            {isImage ? (
              <div className="w-16 h-16 rounded overflow-hidden bg-surface border border-border flex-shrink-0">
                <img
                  src={file.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-text-muted" />
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-sm font-medium text-primary truncate">
                  {file.name}
                </p>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-text-muted hover:text-error hover:bg-error/5 rounded transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Empty / Dragging / Uploading State
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={cn(
            'relative h-[140px] border-2 border-dashed rounded-[6px] cursor-pointer transition-all',
            'flex flex-col items-center justify-center',
            isDragging
              ? 'border-accent bg-accent/5 border-solid'
              : hasError
              ? 'border-error bg-error/5'
              : 'border-[#d4d4d4] hover:border-accent hover:bg-[#fafbff]',
            isUploading && 'pointer-events-none'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptString}
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            // Uploading State
            <div className="w-full px-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-text-secondary">
                  Uploading...
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted text-center mt-2">
                {uploadProgress}%
              </p>
            </div>
          ) : (
            // Empty State
            <>
              <CloudUpload
                className={cn(
                  'w-10 h-10 mb-3',
                  isDragging ? 'text-accent' : 'text-text-muted'
                )}
              />
              <p className="text-sm text-text-secondary mb-1">
                <span className="text-accent font-medium">Drop file here</span>{' '}
                or click to upload
              </p>
              <p className="text-xs text-text-muted">
                {acceptedFormats.join(', ').toUpperCase()} up to {maxSize}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {(error || uploadError) && (
        <div className="flex items-start gap-2 mt-2">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error || uploadError}</p>
        </div>
      )}

      {/* Requirements Helper */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowRequirements(!showRequirements)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <Info className="w-4 h-4" />
          <span>Document requirements</span>
          {showRequirements ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showRequirements && (
          <div className="mt-3 p-4 bg-surface rounded-[6px] border border-border">
            <h4 className="text-sm font-medium text-primary mb-3">
              {requirements.title}
            </h4>

            {requirements.exampleText && (
              <p className="text-xs text-text-muted mb-3 italic">
                Example: {requirements.exampleText}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Requirements
                </p>
                <ul className="space-y-1.5">
                  {requirements.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Common rejection reasons
                </p>
                <ul className="space-y-1.5">
                  {requirements.rejectionReasons.map((reason, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
