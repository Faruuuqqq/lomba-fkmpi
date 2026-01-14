'use client';

import React, { useState, useEffect } from 'react';
import { DocumentIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';
import { useAuth } from '@/contexts/AuthContext';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  project?: {
    id: string;
    title: string;
  };
}

interface MediaManagerProps {
  projectId?: string;
  allowUpload?: boolean;
}

export default function MediaManager({ projectId, allowUpload = true }: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const url = projectId 
        ? `/api/media/project/${projectId}`
        : '/api/media/user';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prev => prev.filter(file => file.id !== fileId));
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message);
    }
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

  const previewFile = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const getFilePreviewUrl = (file: MediaFile) => {
    if (file.mimeType.startsWith('image/')) {
      return `/api/media/${file.id}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getFileIcon(file.mimeType)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </h4>
                  {file.project && (
                    <p className="text-xs text-gray-500">
                      Project: {file.project.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Preview for Images */}
            {file.mimeType.startsWith('image/') && (
              <div className="mb-3">
                <img
                  src={getFilePreviewUrl(file)}
                  alt={file.originalName}
                  className="w-full h-32 object-cover rounded-md cursor-pointer"
                  onClick={() => previewFile(file)}
                />
              </div>
            )}

            {/* File Info */}
            <div className="space-y-1 text-xs text-gray-500">
              <p>Size: {formatFileSize(file.size)}</p>
              <p>Type: {file.mimeType}</p>
              <p>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div className="mt-3 flex justify-end space-x-2">
              <button
                onClick={() => previewFile(file)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Preview"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteFile(file.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="col-span-full text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No files found</h3>
            <p className="text-sm text-gray-500">
              {allowUpload ? 'Upload some files to get started' : 'No files associated with this project'}
            </p>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setSelectedFile(null)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">{getFileIcon(selectedFile.mimeType)}</span>
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {selectedFile.originalName}
                  </h3>
                </div>

                {/* Image Preview */}
                {selectedFile.mimeType.startsWith('image/') && (
                  <div className="mb-4">
                    <img
                      src={getFilePreviewUrl(selectedFile)}
                      alt={selectedFile.originalName}
                      className="w-full h-64 object-contain rounded-md"
                    />
                  </div>
                )}

                {/* File Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{selectedFile.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uploaded:</span>
                    <span className="font-medium">
                      {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedFile.project && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project:</span>
                      <span className="font-medium">{selectedFile.project.title}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}