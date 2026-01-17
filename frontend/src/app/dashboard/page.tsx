'use client';

import { useState } from 'react';
import { Search, BookOpen, Save, ExternalLink, Sparkles } from 'lucide-react';
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

export default function KnowledgeHub() {
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
      toast.success(`Found ${data.citations?.length || 0} academic papers`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSavePaper = async (paper: Paper) => {
    // TODO: Implement save to user library
    toast.success(`Saved: ${paper.title.substring(0, 30)}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-bauhaus-blue border-b-4 border-bauhaus p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-bauhaus-yellow border-4 border-bauhaus flex items-center justify-center">
              <BookOpen className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black uppercase text-3xl text-white tracking-tight">KNOWLEDGE HUB</h1>
              <p className="text-sm font-bold text-white/90">Explore Academic Literature • Powered by OpenAlex</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search academic papers (e.g., 'AI Ethics', 'Climate Change')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-4 border-4 border-bauhaus focus:outline-none focus:border-bauhaus-yellow font-bold text-lg"
            />
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
                  <Search className="w-5 h-5" strokeWidth={3} />
                  Search
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto p-6">
        {papers.length === 0 && !isSearching ? (
          <div className="text-center py-20">
            <Sparkles className="w-20 h-20 mx-auto mb-4 text-gray-300" strokeWidth={2} />
            <h3 className="font-black uppercase text-xl mb-2 text-gray-600">Start Your Research</h3>
            <p className="text-sm font-medium text-gray-500">
              Enter a topic above to discover relevant academic papers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.map((paper, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-bauhaus p-6 hover:shadow-bauhaus-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-bauhaus-blue text-white text-xs font-black uppercase mb-2">
                      {paper.type || 'Journal'}
                    </span>
                    <h3 className="font-bold text-lg leading-tight mb-2">{paper.title}</h3>
                  </div>
                  <span className="px-2 py-1 bg-green-100 border-2 border-green-500 text-green-700 text-xs font-black">
                    {paper.relevance}%
                  </span>
                </div>

                {/* Authors & Year */}
                <p className="text-sm font-medium text-gray-600 mb-3">
                  {paper.authors.join(', ')} • {paper.year}
                </p>

                {/* Abstract */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                  {paper.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSavePaper(paper)}
                    className="flex-1 bg-bauhaus-yellow border-2 border-bauhaus font-bold uppercase text-xs hover:bg-bauhaus-yellow/90"
                  >
                    <Save className="w-4 h-4 mr-1" strokeWidth={3} />
                    Save to Library
                  </Button>
                  {paper.url && (
                    <Button
                      onClick={() => window.open(paper.url, '_blank')}
                      variant="outline"
                      className="border-2 border-bauhaus font-bold uppercase text-xs"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={3} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => router.push('/projects')}
          className="bg-bauhaus-blue text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase px-6 py-6"
        >
          Go to Projects →
        </Button>
      </div>
    </div>
  );
}