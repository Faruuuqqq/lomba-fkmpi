'use client';

import { Modal } from './Modal';
import { CheckCircle2, AlertCircle, FileText, Check, X, Shield, Award, Download, AlertTriangle } from 'lucide-react';

interface CompetitionSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  wordCount: number;
  isPlagiarismChecked: boolean;
  plagiarismScore?: number;
}

export function CompetitionSubmissionModal({
  isOpen,
  onClose,
  content,
  wordCount,
  isPlagiarismChecked,
  plagiarismScore
}: CompetitionSubmissionModalProps) {
  const MIN_WORDS = 1000;
  const MAX_WORDS = 5000;
  const MAX_PLAGIARISM_SCORE = 20;

  const checkItems = [
    {
      id: 'word-count',
      label: 'Word Count Requirements',
      checked: wordCount >= MIN_WORDS && wordCount <= MAX_WORDS,
      description: `${MIN_WORDS} - ${MAX_WORDS} words`,
      icon: FileText,
    },
    {
      id: 'content-completed',
      label: 'Essay is complete',
      checked: content.length > 100,
      description: 'Write your full essay',
      icon: FileText,
    },
    {
      id: 'plagiarism-check',
      label: 'Plagiarism Check Completed',
      checked: isPlagiarismChecked && plagiarismScore !== undefined,
      description: plagiarismScore !== undefined
        ? `Similarity: ${plagiarismScore}%`
        : 'Run plagiarism check',
      icon: Shield,
    },
    {
      id: 'plagiarism-score',
      label: 'Originality Score',
      checked: plagiarismScore !== undefined && plagiarismScore <= MAX_PLAGIARISM_SCORE,
      description: plagiarismScore !== undefined
        ? `Similarity must be below ${MAX_PLAGIARISM_SCORE}%`
        : 'Check similarity',
      icon: Award,
    },
  ];

  const canSubmit = checkItems.every(item => item.checked);

  const getWordCountStatus = () => {
    if (wordCount < MIN_WORDS) {
      return {
        status: 'warning',
        message: `${MIN_WORDS - wordCount} more words needed`,
        color: 'text-yellow-600 dark:text-yellow-400',
      };
    } else if (wordCount > MAX_WORDS) {
      return {
        status: 'error',
        message: `${wordCount - MAX_WORDS} words over limit`,
        color: 'text-red-600 dark:text-red-400',
      };
    }
    return {
      status: 'success',
      message: 'Word count within limits',
      color: 'text-green-600 dark:text-green-400',
    };
  };

  const wordCountStatus = getWordCountStatus();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Competition Submission Checklist">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Word Count Progress */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              <span className="font-bold text-sm">Word Count</span>
            </div>
            <span className={`font-bold text-lg ${wordCountStatus.color}`}>
              {wordCount} / {MAX_WORDS}
            </span>
          </div>

          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                wordCount < MIN_WORDS
                  ? 'bg-yellow-500'
                  : wordCount > MAX_WORDS
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((wordCount / MAX_WORDS) * 100, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Min: {MIN_WORDS} words</span>
            <span className={`font-semibold ${wordCountStatus.color}`}>
              {wordCountStatus.message}
            </span>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Submission Requirements
          </h3>

          <div className="space-y-2">
            {checkItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg ${
                    item.checked
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.checked
                      ? 'bg-green-500'
                      : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}>
                    {item.checked ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings */}
        {!canSubmit && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100 mb-1">
                  Not Ready for Submission
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Complete all requirements above before submitting your essay.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Submit */}
        {canSubmit && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-green-900 dark:text-green-100 mb-1">
                  Ready for Submission!
                </h4>
                <p className="text-xs text-green-800 dark:text-green-200">
                  All requirements are met. You can now submit your essay.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Continue Editing
          </button>
          <button
            disabled={!canSubmit}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            onClick={() => {
              if (canSubmit) {
                // Export functionality here
                console.log('Exporting essay...');
              }
            }}
          >
            <Download className="w-4 h-4" />
            {canSubmit ? 'Export for Submission' : 'Complete Requirements'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
