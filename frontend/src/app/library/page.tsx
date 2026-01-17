'use client';

import { useState } from 'react';
import { Search, BookOpen, Save, ExternalLink, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiAPI, libraryAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Paper {
  id: string;
  type?: string;
  title: string;
  authors: string[];
  year: number;
  abstract?: string;
  description?: string;
  url?: string;
  relevance: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Enter a research topic');
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await aiAPI.getCitations(query, '');
      setPapers(data.citations || []);
      toast.success(`Retrieved ${data.citations?.length || 0} academic sources`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSavePaper = async (paper: Paper) => {
    setSavingId(paper.id);
    try {
      await libraryAPI.save({
        paperId: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        description: paper.description,
        url: paper.url,
        type: paper.type,
        relevance: paper.relevance
      });
      toast.success(`📚 Saved to your library!`);
    } catch (error) {
      toast.error('Failed to save paper');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-b border-indigo-500 p-8 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-black uppercase text-4xl text-white tracking-tight">RESEARCH LIBRARY</h1>
                <p className="text-sm font-semibold text-white/90 mt-1">
                  Discover • Explore • Build Your Knowledge Base
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/projects')}
              className="bg-white text-indigo-600 hover:bg-zinc-50 rounded-lg font-bold uppercase px-6 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Go to Projects
            </Button>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 flex gap-2 shadow-sm">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="What are you researching? (e.g., 'Machine Learning Ethics', 'Climate Policy')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 focus:outline-none font-semibold text-lg placeholder:text-zinc-400 bg-transparent"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold uppercase px-8 shadow-sm"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Search
                </span>
              )}
            </Button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
            <p className="text-xs font-bold text-white uppercase">
              💡 Powered by OpenAlex • 250M+ Academic Papers • Real-time Data
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto p-8">
        {papers.length === 0 && !isSearching ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-black uppercase text-2xl mb-3 text-zinc-800 dark:text-zinc-100">Ready to Explore?</h3>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
              Enter a topic above to discover peer-reviewed academic papers, journals, and research articles.
              Build your knowledge foundation before you write.
            </p>

            {/* Quick Topics */}
            <div className="flex flex-wrap gap-2 justify-center">
              <p className="w-full text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-2">Popular Topics:</p>
              {['AI Ethics', 'Climate Change', 'Quantum Computing', 'Social Media Impact'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setQuery(topic);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors font-bold text-xs uppercase rounded-lg"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-black uppercase text-xl text-zinc-800 dark:text-zinc-100">
                {papers.length} Sources Found for "{query}"
              </h2>
              <Button
                onClick={() => {
                  setPapers([]);
                  setQuery('');
                }}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 font-bold uppercase text-xs rounded-lg"
              >
                Clear Results
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {papers.map((paper, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 hover:shadow-lg transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-indigo-600 text-white text-xs font-bold uppercase rounded">
                          {paper.type || 'Journal'}
                        </span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-500 dark:border-green-700 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                          {paper.relevance}% Match
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {paper.title}
                      </h3>
                    </div>
                  </div>

                  {/* Authors & Year */}
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
                    <span className="font-black">Authors:</span> {paper.authors.slice(0, 3).join(', ')}
                    {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`} • {paper.year}
                  </p>

                  {/* Abstract */}
                  {paper.description && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 line-clamp-3">
                      {paper.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <Button
                      onClick={() => handleSavePaper(paper)}
                      disabled={savingId === paper.id}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-xs rounded-lg shadow-sm"
                    >
                      {savingId === paper.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save to Library
                    </Button>
                    {paper.url && (
                      <Button
                        onClick={() => window.open(paper.url, '_blank')}
                        variant="outline"
                        className="border-zinc-300 dark:border-zinc-700 font-bold uppercase text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}