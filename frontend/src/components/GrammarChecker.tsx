'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api';

interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'style' | 'punctuation';
  message: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
    line: number;
  };
}

interface GrammarCheckResult {
  issues: GrammarIssue[];
  score: number;
  correctedText?: string;
}

interface GrammarCheckerProps {
  content: string;
  onCorrection: (correctedText: string) => void;
}

export default function GrammarChecker({ content, onCorrection }: GrammarCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GrammarIssue | null>(null);
  const { token } = useAuth();

  const checkGrammar = async () => {
    if (!content.trim()) {
      setError('No content to check');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await aiAPI.checkGrammar('current-project', content);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to check grammar');
    } finally {
      setIsChecking(false);
    }
  };

  const applyCorrection = () => {
    if (result?.correctedText) {
      onCorrection(result.correctedText);
    }
  };

  const getIssueIcon = (type: GrammarIssue['type']) => {
    switch (type) {
      case 'grammar':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'spelling':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'style':
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'punctuation':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIssueColor = (type: GrammarIssue['type']) => {
    switch (type) {
      case 'grammar':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'spelling':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'style':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'punctuation':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Grammar Checker</h3>
            <p className="text-sm text-gray-600">Improve your writing quality</p>
          </div>
        </div>
        
        <button
          onClick={checkGrammar}
          disabled={isChecking || !content.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isChecking || !content.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isChecking ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Checking...</span>
            </div>
          ) : (
            'Check Grammar'
          )}
        </button>
      </div>

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
          {/* Score Overview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.score}/100
                </div>
                <div className={`text-sm font-medium ${getScoreColor(result.score)}`}>
                  {getScoreLabel(result.score)}
                </div>
              </div>
              
              {result.correctedText && (
                <button
                  onClick={applyCorrection}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Corrections
                </button>
              )}
            </div>
          </div>

          {/* Issues Summary */}
          {result.issues.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Issues Found ({result.issues.length})
                </h4>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {showDetails ? (
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 mr-1" />
                  )}
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>

              {/* Issues Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {['grammar', 'spelling', 'style', 'punctuation'].map((type) => {
                  const count = result.issues.filter(issue => issue.type === type).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={type} className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-600 capitalize">{type}</div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Issues */}
              {showDetails && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.issues.map((issue, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${getIssueColor(
                        issue.type
                      )}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="font-medium capitalize">
                            {issue.type} Issue
                          </div>
                          <div className="text-sm mt-1">
                            {issue.message}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            Suggestion: {issue.suggestion}
                          </div>
                          <div className="text-xs mt-1 text-gray-500">
                            Line {issue.position.line}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Issues */}
          {result.issues.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  No grammar issues found! Your writing looks great.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Grammar Checker Features:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Detects grammar and spelling errors</li>
            <li>• Identifies style and punctuation issues</li>
            <li>• Provides suggestions for improvement</li>
            <li>• Scores writing quality from 0-100</li>
            <li>• Offers corrected text for immediate fixes</li>
          </ul>
        </div>
      )}
    </div>
  );
}