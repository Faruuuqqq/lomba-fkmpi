'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface PlagiarismSource {
  url: string;
  title: string;
  similarity: number;
  matchedText: string;
}

interface PlagiarismResult {
  similarityScore: number;
  sources: PlagiarismSource[];
  isOriginal: boolean;
}

interface PlagiarismCheckerProps {
  content: string;
  projectId: string;
}

export default function PlagiarismChecker({ content, projectId }: PlagiarismCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(0);
  const { token } = useAuth();

  const checkPlagiarism = async () => {
    if (!content.trim()) {
      setError('No content to check');
      return;
    }

    setIsChecking(true);
    setError(null);
    setCheckingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setCheckingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/ai/advanced/plagiarism-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: content })
      });

      if (!response.ok) {
        throw new Error('Failed to check plagiarism');
      }

      clearInterval(progressInterval);
      setCheckingProgress(100);

      const data: PlagiarismResult = await response.json();
      setResult(data);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
    } finally {
      setIsChecking(false);
      setTimeout(() => setCheckingProgress(0), 1000);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score < 15) return 'text-green-600 bg-green-50';
    if (score < 30) return 'text-yellow-600 bg-yellow-50';
    if (score < 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSimilarityLabel = (score: number) => {
    if (score < 15) return 'Original Content';
    if (score < 30) return 'Low Similarity';
    if (score < 50) return 'Moderate Similarity';
    return 'High Similarity';
  };

  const getSourceIcon = (url: string) => {
    if (url.includes('wikipedia')) return '📚';
    if (url.includes('journal') || url.includes('academic')) return '🎓';
    if (url.includes('news')) return '📰';
    return '🌐';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plagiarism Checker</h3>
            <p className="text-sm text-gray-600">Ensure academic integrity</p>
          </div>
        </div>
        
        <button
          onClick={checkPlagiarism}
          disabled={isChecking || !content.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isChecking || !content.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isChecking ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Checking...</span>
            </div>
          ) : (
            'Check Originality'
          )}
        </button>
      </div>

      {/* Progress */}
      {isChecking && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Analyzing content...</span>
            <span className="text-sm text-gray-900 font-medium">{checkingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${checkingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Similarity Score */}
          <div className={`p-4 rounded-lg border ${getSimilarityColor(result.similarityScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{result.similarityScore}%</div>
                <div className="font-medium mt-1">{getSimilarityLabel(result.similarityScore)}</div>
              </div>
              
              <div className="text-right">
                {result.isOriginal ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-6 w-6 mr-1" />
                    <span className="font-medium">Original</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-1" />
                    <span className="font-medium">Review Needed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sources Found */}
          {result.sources.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Potential Sources ({result.sources.length})
                </h4>
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {showSources ? 'Hide' : 'Show'} Sources
                </button>
              </div>

              {showSources && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.sources.map((source, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{getSourceIcon(source.url)}</span>
                            <h5 className="font-medium text-gray-900 truncate">
                              {source.title}
                            </h5>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {source.url}
                          </div>
                          
                          <div className="bg-gray-100 border border-gray-200 rounded p-2 mb-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Matched Text:
                            </div>
                            <div className="text-sm text-gray-900 italic">
                              "{source.matchedText}"
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-red-600 mr-2">
                                {source.similarity}%
                              </div>
                              <span className="text-sm text-gray-600">Similarity</span>
                            </div>
                            
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLinkIcon className="h-4 w-4 mr-1" />
                              Visit Source
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Sources */}
          {result.sources.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  No potential sources found. Your content appears to be original.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Plagiarism Checker Features:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Scans billions of web pages and academic sources</li>
            <li>• Calculates similarity percentage (0-100%)</li>
            <li>• Identifies potential sources and matched content</li>
            <li>• Provides direct links to source materials</li>
            <li>• Helps maintain academic integrity</li>
          </ul>
          
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> This tool helps identify potential similarities. 
                Always review results in context and follow proper citation practices.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}