'use client';

import { Modal } from './Modal';
import { FileText, Sparkles, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGamification } from '@/contexts/GamificationContext';

interface OutlineSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

interface OutlineGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  onInsertOutline: (outline: string) => void;
}

export function OutlineGenerator({
  isOpen,
  onClose,
  topic,
  onInsertOutline
}: OutlineGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<OutlineSection[] | null>(null);
  const { addTokens, setShowDailyChallenge, stats } = useGamification();

  const generateOutline = async () => {
    if (!topic || topic.length < 10) {
      toast.error('Please write at least 10 characters about your topic first');
      return;
    }

    if (stats.tokens < 20) {
      toast.error('Not enough tokens! Need 20 tokens.');
      setShowDailyChallenge(true);
      return;
    }

    setIsLoading(true);
    setGeneratedOutline(null);

    try {
      addTokens(-20);

      // Simulate AI generation - In production, this would call the backend
      setTimeout(() => {
        const outline: OutlineSection[] = [
          {
            id: '1',
            title: 'Introduction',
            content: 'Hook the reader with an engaging opening, provide context, and present the thesis statement',
            level: 1,
          },
          {
            id: '1.1',
            title: 'Background Information',
            content: 'Provide necessary background on the topic to help readers understand the context',
            level: 2,
          },
          {
            id: '1.2',
            title: 'Thesis Statement',
            content: 'Clearly state the main argument or position that will be defended throughout the essay',
            level: 2,
          },
          {
            id: '2',
            title: 'Body Paragraph 1: First Main Argument',
            content: 'Present the strongest argument supporting the thesis with evidence and analysis',
            level: 1,
          },
          {
            id: '2.1',
            title: 'Topic Sentence',
            content: 'State the main point of this paragraph',
            level: 2,
          },
          {
            id: '2.2',
            title: 'Evidence and Examples',
            content: 'Support the topic sentence with relevant evidence and specific examples',
            level: 2,
          },
          {
            id: '2.3',
            title: 'Analysis',
            content: 'Explain how the evidence supports the argument and connect to the thesis',
            level: 2,
          },
          {
            id: '3',
            title: 'Body Paragraph 2: Second Main Argument',
            content: 'Present the second strongest argument supporting the thesis',
            level: 1,
          },
          {
            id: '3.1',
            title: 'Topic Sentence',
            content: 'State the main point of this paragraph',
            level: 2,
          },
          {
            id: '3.2',
            title: 'Evidence and Examples',
            content: 'Support with evidence and analysis',
            level: 2,
          },
          {
            id: '3.3',
            title: 'Counterargument',
            content: 'Address potential counterarguments and refute them',
            level: 2,
          },
          {
            id: '4',
            title: 'Body Paragraph 3: Third Main Argument',
            content: 'Present the third argument supporting the thesis',
            level: 1,
          },
          {
            id: '5',
            title: 'Conclusion',
            content: 'Restate the thesis, summarize main points, and provide a final thought or call to action',
            level: 1,
          },
          {
            id: '5.1',
            title: 'Restate Thesis',
            content: 'Rephrase the thesis statement in a new way',
            level: 2,
          },
          {
            id: '5.2',
            title: 'Summary of Main Points',
            content: 'Briefly recap the main arguments presented in the essay',
            level: 2,
          },
          {
            id: '5.3',
            title: 'Final Thought',
            content: 'End with a strong closing statement that leaves a lasting impression',
            level: 2,
          },
        ];

        setGeneratedOutline(outline);
        setIsLoading(false);
        toast.success('✓ Outline generated successfully');
      }, 2000);
    } catch (error) {
      console.error('Outline generation error:', error);
      addTokens(20); // Refund
      toast.error('Failed to generate outline. Please try again.');
      setIsLoading(false);
    }
  };

  const insertToEditor = () => {
    if (!generatedOutline) return;

    let outlineText = '\n\n';
    generatedOutline.forEach((section) => {
      const prefix = '#'.repeat(section.level) + ' ';
      outlineText += `${prefix}${section.title}\n\n${section.content}\n\n`;
    });

    onInsertOutline(outlineText);
    toast.success('✓ Outline inserted to editor');
    onClose();
  };

  const copyToClipboard = () => {
    if (!generatedOutline) return;

    let outlineText = '';
    generatedOutline.forEach((section) => {
      const prefix = '#'.repeat(section.level) + ' ';
      outlineText += `${prefix}${section.title}\n${section.content}\n\n`;
    });

    navigator.clipboard.writeText(outlineText);
    toast.success('✓ Outline copied to clipboard');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Outline Generator">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Instructions */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-100 mb-1">
                Generate a Structured Outline
              </h4>
              <p className="text-xs text-indigo-800 dark:text-indigo-200">
                AI will analyze your topic and create a comprehensive essay outline with sections, subsections, and key points to cover.
              </p>
            </div>
          </div>
        </div>

        {/* Topic Preview */}
        {topic && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Topic:
                </p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-3">
                  {topic.substring(0, 200)}
                  {topic.length > 200 && '...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!generatedOutline && (
          <button
            onClick={generateOutline}
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg font-bold flex items-center justify-center gap-3 transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Outline (20 tokens)
              </>
            )}
          </button>
        )}

        {/* Generated Outline */}
        {generatedOutline && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-bold text-sm text-green-900 dark:text-green-100">
                    Outline Generated!
                  </h4>
                  <p className="text-xs text-green-800 dark:text-green-200">
                    {generatedOutline.length} sections created
                  </p>
                </div>
              </div>
            </div>

            {/* Outline Content */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {generatedOutline.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 border-l-4 rounded-r-lg ${
                    section.level === 1
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-400 ml-4'
                  }`}
                >
                  <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    {section.id}. {section.title}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={insertToEditor}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Insert to Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
