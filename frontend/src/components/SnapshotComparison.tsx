'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsAPI } from '@/lib/api';
import { ProjectSnapshot } from '@/types';
import { ChevronLeft, ChevronRight, FileText, Clock, Eye } from 'lucide-react';

interface SnapshotComparisonProps {
  projectId: string;
  snapshots: ProjectSnapshot[];
}

export function SnapshotComparison({ projectId, snapshots }: SnapshotComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [compareIndex, setCompareIndex] = useState(1);

  const currentSnapshot = snapshots[currentIndex];
  const compareSnapshot = isComparing ? snapshots[compareIndex] : null;

  const nextSnapshot = () => {
    if (currentIndex < snapshots.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSnapshot = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleCompare = () => {
    setIsComparing(!isComparing);
    if (!isComparing && compareIndex >= snapshots.length) {
      setCompareIndex(0);
    }
  };

  const compareNext = () => {
    if (compareIndex < snapshots.length - 1) {
      setCompareIndex(compareIndex + 1);
    }
  };

  const comparePrev = () => {
    if (compareIndex > 0) {
      setCompareIndex(compareIndex - 1);
    }
  };

  const getDiffStats = () => {
    if (!isComparing || !currentSnapshot || !compareSnapshot) {
      return null;
    }

    const words1 = currentSnapshot.content.trim().split(/\s+/).length;
    const words2 = compareSnapshot.content.trim().split(/\s+/).length;
    const wordDiff = words2 - words1;

    return {
      wordCount1: words1,
      wordCount2: words2,
      wordDifference: wordDiff,
      timeDiff: new Date(compareSnapshot.timestamp).getTime() - new Date(currentSnapshot.timestamp).getTime()
    };
  };

  const diffStats = getDiffStats();

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No snapshots available</h3>
        <p className="text-sm">Save your project to create snapshots</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Version History & Comparison
          </CardTitle>
          <Button onClick={toggleCompare} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            {isComparing ? 'Hide Comparison' : 'Compare Versions'}
          </Button>
        </div>
      </CardHeader>

      {!isComparing ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={prevSnapshot} disabled={currentIndex === 0} variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="text-center flex-1">
              <Badge variant="outline">
                Version {currentIndex + 1} of {snapshots.length}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {new Date(currentSnapshot.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Stage: {currentSnapshot.stage}
              </div>
            </div>
            <Button onClick={nextSnapshot} disabled={currentIndex === snapshots.length - 1} variant="outline" size="sm">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Version {currentIndex + 1} Content:</h4>
              <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                {currentSnapshot.content || 'Empty content'}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                Word count: {currentSnapshot.content.trim().split(/\s+/).length} words
              </div>
            </div>
          </CardContent>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button onClick={prevSnapshot} disabled={currentIndex === 0} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="text-center flex-1">
                <Badge variant="secondary">
                  Base Version {currentIndex + 1}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(currentSnapshot.timestamp).toLocaleString()}
                </div>
              </div>
              <Button onClick={nextSnapshot} disabled={currentIndex === snapshots.length - 1} variant="outline" size="sm">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <CardContent>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <h4 className="font-medium mb-2">Base Version {currentIndex + 1}</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-80 overflow-y-auto">
                  {currentSnapshot.content || 'Empty content'}
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Stage: {currentSnapshot.stage} • 
                  {currentSnapshot.content.trim().split(/\s+/).length} words
                </div>
              </div>
            </CardContent>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Button onClick={comparePrev} disabled={compareIndex === 0} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="text-center flex-1">
                <Badge variant="secondary">
                  Compare Version {compareIndex + 1}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  {compareSnapshot && new Date(compareSnapshot.timestamp).toLocaleString()}
                </div>
              </div>
              <Button onClick={compareNext} disabled={compareIndex === snapshots.length - 1} variant="outline" size="sm">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <CardContent>
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <h4 className="font-medium mb-2">Compare Version {compareIndex + 1}</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-80 overflow-y-auto">
                  {compareSnapshot?.content || 'Empty content'}
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Stage: {compareSnapshot?.stage || 'N/A'} • 
                  {compareSnapshot?.content?.trim().split(/\s+/).length || 0} words
                </div>
              </div>
            </CardContent>
          </div>

          {diffStats && (
            <CardContent className="md:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg p-4">
                <h4 className="font-medium mb-3">Comparison Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {diffStats.wordCount1}
                    </div>
                    <div className="text-xs text-muted-foreground">Base Version Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {diffStats.wordCount2}
                    </div>
                    <div className="text-xs text-muted-foreground">Compare Version Words</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${diffStats.wordDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {diffStats.wordDifference > 0 ? '+' : ''}{diffStats.wordDifference}
                    </div>
                    <div className="text-xs text-muted-foreground">Word Difference</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor(diffStats.timeDiff / (1000 * 60))}
                    </div>
                    <div className="text-xs text-muted-foreground">Minutes Apart</div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <Clock className="w-4 h-4 inline mr-1" />
          Showing {currentIndex + 1} of {snapshots.length} snapshots
        </div>
        <Badge variant="outline">
          Total: {snapshots.length} versions
        </Badge>
      </div>
    </div>
  );
}
