'use client';

import React, { useState, useRef } from 'react';
import { CloudUploadIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/outline';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  projectId?: string;
  onUploadComplete?: (file: any) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({ 
  projectId, 
  onUploadComplete, 
  maxFiles = 5,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ]
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed`);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`File ${file.name} exceeds 10MB limit`);
        return;
      }
    }

    setUploading(true);
    setError(null);

    try {
      // Upload files one by one
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (projectId) {
          formData.append('projectId', projectId);
        }

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        
        setUploadedFiles(prev => [...prev, result]);
        setUploadProgress((uploadedFiles.length + 1) / files.length * 100);
        
        if (onUploadComplete) {
          onUploadComplete(result);
        }
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.startsWith('text/')) {
      return '📃';
    }
    return '📎';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <CloudUploadIcon className="h-12 w-12 text-gray-400 mb-3" />
          <span className="text-lg font-medium text-gray-700 mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
          </span>
          <span className="text-sm text-gray-500">
            Maximum {maxFiles} files, up to 10MB each
          </span>
          <span className="text-xs text-gray-400 mt-1">
            Supported: Images, PDF, Word, Text files
          </span>
        </label>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round(uploadProgress)}% complete
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {!uploading && uploadedFiles.length > 0 && !error && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm text-green-700">
                {uploadedFiles.length} file(s) uploaded successfully!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.mimeType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}