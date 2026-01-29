'use client';

import { Modal } from './Modal';
import { CheckCircle2, AlertCircle, BookOpen, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CitationIssue {
  id: string;
  text: string;
  issue: string;
  format: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
  line?: number;
  suggestion?: string;
}

interface CitationCheckResult {
  totalCitations: number;
  format: string;
  issues: CitationIssue[];
  score: number;
}

export function CitationFormatChecker({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}) {
  const [selectedFormat, setSelectedFormat] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CitationCheckResult | null>(null);

  const checkCitationFormat = async () => {
    if (!content) {
      toast.error('No content to check');
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Simulate API call - In production, this would call the backend
    setTimeout(() => {
      const issues: CitationIssue[] = [];

      // Simple regex patterns for common citation formats
      const apaPattern = /\([^)]+\s+\d{4}\)/g;
      const mlaPattern = /\([^)]+\s+\d+\)/g;
      const chicagoPattern = /\d+\.\s+[^.]+/g;

      const citations = content.match(apaPattern) || [];

      if (selectedFormat === 'APA') {
        // Check for APA format issues
        content.split('\n').forEach((line, idx) => {
          if (line.includes('(') && !apaPattern.test(line)) {
            issues.push({
              id: `line-${idx}`,
              text: line.trim().substring(0, 50),
              issue: 'Invalid APA citation format',
              format: 'APA',
              line: idx + 1,
              suggestion: 'Use format: (Author, Year) or (Author, Year, p. Page)',
            });
          }
        });

        // Check for missing years
        const missingYear = content.match(/\([^)]+(?!20\d{2})\)/g);
        if (missingYear) {
          issues.push({
            id: 'missing-year',
            text: missingYear[0],
            issue: 'Missing publication year',
            format: 'APA',
            suggestion: 'Add publication year in parentheses',
          });
        }
      }

      setResult({
        totalCitations: citations.length,
        format: selectedFormat,
        issues,
        score: Math.max(0, 100 - issues.length * 10),
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Citation Format Checker">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Format Selector */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {(['APA', 'MLA', 'Chicago'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                selectedFormat === format
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {format}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                Citation Guide
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                {selectedFormat === 'APA' && '(Author, Year) or (Author, Year, p. Page)'}
                {selectedFormat === 'MLA' && '(Author Page)' || '(Author, Year)'}
                {selectedFormat === 'Chicago' && 'Footnote: 1. Author, Title, Publication info'}
              </p>
            </div>
          </div>
        </div>

        {/* Run Check Button */}
        <button
          onClick={checkCitationFormat}
          disabled={isLoading || !content}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking Citations...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Check {selectedFormat} Format
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score Card */}
            <div className={`p-4 border rounded-lg ${
              result.score >= 80
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : result.score >= 50
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {result.score >= 80 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-bold text-sm">
                    {result.score >= 80 ? 'Great!' : 'Needs Improvement'}
                  </span>
                </div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {result.score}%
                </span>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {result.totalCitations} citations found • {selectedFormat} format
              </div>
            </div>

            {/* Issues List */}
            {result.issues.length > 0 ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Issues Found ({result.issues.length})
                </h4>
                <div className="space-y-2">
                  {result.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-red-900 dark:text-red-100 uppercase">
                              {issue.format}
                            </span>
                            {issue.line && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Line {issue.line}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                            {issue.issue}
                          </p>
                          {issue.text && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-mono bg-zinc-100 dark:bg-zinc-800 p-1 rounded">
                              {issue.text}
                            </p>
                          )}
                          {issue.suggestion && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                              💡 {issue.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-green-900 dark:text-green-100 mb-1">
                      No Issues Found
                    </h4>
                    <p className="text-xs text-green-800 dark:text-green-200">
                      All citations are properly formatted in {selectedFormat} style!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
