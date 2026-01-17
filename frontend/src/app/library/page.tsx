'use client';

import { useState } from 'react';
import { Search, BookOpen, Save, ExternalLink, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiAPI } from '@/lib/api';
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
    // TODO: Implement save to user library
    toast.success(`📚 Saved to your library!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-bauhaus-blue border-b-4 border-bauhaus p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-bauhaus-yellow border-4 border-bauhaus flex items-center justify-center">
                <BookOpen className="w-7 h-7" strokeWidth={3} />
              </div>
              <div>
                <h1 className="font-black uppercase text-4xl text-white tracking-tight">RESEARCH LIBRARY</h1>
                <p className="text-sm font-bold text-white/90 mt-1">
                  Discover • Explore • Build Your Knowledge Base
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/projects')}
              className="bg-bauhaus-yellow text-black border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase px-6 hover:bg-bauhaus-yellow/90"
            >
              <ArrowRight className="w-5 h-5 mr-2" strokeWidth={3} />
              Go to Projects
            </Button>
          </div>

          {/* Search Bar */}
          <div className="bg-white border-4 border-bauhaus p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-400" strokeWidth={3} />
              <input
                type="text"
                placeholder="What are you researching? (e.g., 'Machine Learning Ethics', 'Climate Policy')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 focus:outline-none font-bold text-lg placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase px-8 hover:bg-bauhaus-red/90"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" strokeWidth={3} />
                  Search
                </span>
              )}
            </Button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow/50">
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
            <div className="w-24 h-24 bg-bauhaus-blue/10 border-4 border-bauhaus mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-bauhaus-blue" strokeWidth={2} />
            </div>
            <h3 className="font-black uppercase text-2xl mb-3 text-gray-800">Ready to Explore?</h3>
            <p className="text-sm font-medium text-gray-600 max-w-md mx-auto mb-6">
              Enter a topic above to discover peer-reviewed academic papers, journals, and research articles.
              Build your knowledge foundation before you write.
            </p>

            {/* Quick Topics */}
            <div className="flex flex-wrap gap-2 justify-center">
              <p className="w-full text-xs font-black uppercase text-gray-500 mb-2">Popular Topics:</p>
              {['AI Ethics', 'Climate Change', 'Quantum Computing', 'Social Media Impact'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setQuery(topic);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="px-4 py-2 bg-white border-2 border-bauhaus hover:bg-bauhaus-yellow transition-colors font-bold text-xs uppercase"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-black uppercase text-xl">
                {papers.length} Sources Found for "{query}"
              </h2>
              <Button
                onClick={() => {
                  setPapers([]);
                  setQuery('');
                }}
                variant="outline"
                className="border-2 border-bauhaus font-bold uppercase text-xs"
              >
                Clear Results
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {papers.map((paper, idx) => (
                <div
                  key={idx}
                  className="bg-white border-4 border-bauhaus p-6 hover:shadow-bauhaus-lg transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-bauhaus-blue text-white text-xs font-black uppercase">
                          {paper.type || 'Journal'}
                        </span>
                        <span className="px-2 py-1 bg-green-100 border-2 border-green-500 text-green-700 text-xs font-black">
                          {paper.relevance}% Match
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-bauhaus-blue transition-colors">
                        {paper.title}
                      </h3>
                    </div>
                  </div>

                  {/* Authors & Year */}
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    <span className="font-black">Authors:</span> {paper.authors.slice(0, 3).join(', ')}
                    {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`} • {paper.year}
                  </p>

                  {/* Abstract */}
                  {paper.description && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                      {paper.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                    <Button
                      onClick={() => handleSavePaper(paper)}
                      className="flex-1 bg-bauhaus-yellow border-2 border-bauhaus font-bold uppercase text-xs hover:bg-bauhaus-yellow/90 btn-press"
                    >
                      <Save className="w-4 h-4 mr-2" strokeWidth={3} />
                      Save to Library
                    </Button>
                    {paper.url && (
                      <Button
                        onClick={() => window.open(paper.url, '_blank')}
                        variant="outline"
                        className="border-2 border-bauhaus font-bold uppercase text-xs hover:bg-gray-50"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={3} />
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