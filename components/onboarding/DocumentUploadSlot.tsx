'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  Check,
  X,
  FileText,
  Loader2,
} from 'lucide-react';
import { UploadedDoc } from './types';

interface DocumentUploadSlotProps {
  label: string;
  sublabel?: string;
  accept?: string;
  uploadedDoc: UploadedDoc | null;
  onDocChange: (doc: UploadedDoc | null) => void;
  mockFileName?: string;
  mockFileSize?: string;
}

export function DocumentUploadSlot({
  label,
  sublabel,
  accept = 'image/jpeg,image/png,application/pdf',
  uploadedDoc,
  onDocChange,
  mockFileName = 'documento.pdf',
  mockFileSize = '1.8 MB',
}: DocumentUploadSlotProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = (name: string, size: string, previewUrl?: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onDocChange({
        name,
        size,
        previewUrl,
        uploadedAt: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'valid',
      });
    }, 400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    let preview: string | undefined = undefined;

    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    simulateUpload(file.name, sizeInMb, preview);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    let preview: string | undefined = undefined;

    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    simulateUpload(file.name, sizeInMb, preview);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-zinc-900">
          {label}
        </label>
        {sublabel && (
          <span className="text-xs text-zinc-500 font-normal">
            {sublabel}
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {isUploading ? (
        <div className="border border-zinc-200 bg-zinc-50/70 rounded-xl p-4 flex items-center justify-center gap-3 text-zinc-600">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
          <span className="text-xs font-medium">Cargando archivo...</span>
        </div>
      ) : uploadedDoc ? (
        <div className="border border-zinc-200 bg-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {uploadedDoc.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadedDoc.previewUrl}
                alt="Vista previa"
                className="w-10 h-10 object-cover rounded-lg border border-zinc-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-zinc-900 truncate">
                  {uploadedDoc.name}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Cargado
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {uploadedDoc.size}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDocChange(null)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Quitar archivo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-300 hover:border-zinc-400 bg-white'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 mb-2">
            <Upload className="w-4 h-4" />
          </div>

          <p className="text-xs font-medium text-zinc-900">
            Haz clic para subir o arrastra tu archivo
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            PDF, JPG o PNG (máx. 25MB)
          </p>
        </div>
      )}
    </div>
  );
}
