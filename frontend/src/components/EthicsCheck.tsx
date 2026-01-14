'use client';

import { EthicsCheck as EthicsCheckType } from '@/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface EthicsCheckProps {
  data: EthicsCheckType;
}

export function EthicsCheck({ data }: EthicsCheckProps) {
  const hasIssues = data.issues.length > 0;

  return (
    <div className="space-y-4">
      {hasIssues ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Potential Ethical Issues Found</h3>
              <p className="text-sm text-yellow-700 mt-1">{data.summary}</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.issues.map((issue, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="text-sm font-medium text-gray-900 italic mb-2">
                  "{issue.sentence}"
                </p>
                <div className="flex items-start gap-2">
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                    {issue.type}
                  </span>
                  <p className="text-sm text-gray-700">{issue.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">No Significant Ethical Issues Found</h3>
              <p className="text-sm text-green-700 mt-1">{data.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
