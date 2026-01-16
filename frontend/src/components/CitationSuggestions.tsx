'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CitationSuggestion {
  type: 'book' | 'journal' | 'website' | 'academic';
  title: string;
  authors: string[];
  year: number;
  relevance: number;
  description: string;
  url?: string;
}

interface CitationSuggestionsProps {
  topic?: string;
  content: string;
  onCitationSelect?: (citation: CitationSuggestion) => void;
}

export default function CitationSuggestions({ 
  topic = '', 
  content, 
  onCitationSelect 
}: CitationSuggestionsProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<CitationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(topic);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { token } = useAuth();

  useEffect(() => {
    if (topic || content.length > 100) {
      searchCitations();
    }
  }, []);

  const searchCitations = async () => {
    if (!searchTerm.trim() && content.length < 50) {
      setError('Please provide a topic or more content to search');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        topic: searchTerm || '',
        content: content.slice(0, 100),
      });

      const response = await fetch(`/api/ai/advanced/citation-suggestions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch citation suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'book': return '📖';
      case 'journal': return '📖';
      case 'website': return '🌐';
      case 'academic': return '📖';
      default: return '📖';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'journal': return 'bg-green-50 border-green-200 text-green-800';
      case 'website': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'academic': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600';
    if (relevance >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredSuggestions = selectedType === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === selectedType);

  const uniqueTypes = Array.from(new Set(suggestions.map(s => s.type)));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl font-bold text-green-800">📖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Citation Suggestions</h3>
            <p className="text-sm text-gray-600">Find relevant academic sources</p>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCitations()}
              placeholder="Enter topic or keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={searchCitations}
              disabled={isSearching}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Searching...</span>
                </div>
              ) : 'Search'}
            </button>
          </div>
        </div>

        {/* Type Filter */}
        {uniqueTypes.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                  selectedType === 'all' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({suggestions.length})
              </button>
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                    selectedType === type 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type} ({suggestions.filter(s => s.type === type).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <h4 className="font-bold text-red-700 mb-1">Error</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredSuggestions.length > 0 && !error && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(suggestion.type)}`}>
                      {getTypeEmoji(suggestion.type)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{suggestion.authors.join(', ')}</span>
                      <span>({suggestion.year})</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {suggestion.description}
                    </p>

                    {suggestion.url && (
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Link className="h-4 w-4 mr-1" />
                        View Source
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <span className={`text-sm font-medium rounded-full px-2 py-1 ${getRelevanceColor(suggestion.relevance)}`}>
                      {suggestion.relevance}%
                    </span>

                    <button
                      onClick={() => onCitationSelect?.(suggestion)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Use Citation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isSearching && filteredSuggestions.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-4xl mb-2">📖</span>
              <h4 className="font-medium text-yellow-800 mb-1">No citations found</h4>
              <p className="text-sm text-yellow-600">
                {suggestions.length === 0 
                  ? 'No citations match filter'
                  : 'Try adjusting the filter'}
              </p>
            </div>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Citation Suggestions Features:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Search academic databases for relevant sources</li>
                    <li>• Find books, journals, websites, and academic papers</li>
                    <li>• Calculate relevance scores for your topic</li>
                    <li>• Filter by source type</li>
                    <li>• Direct links to original sources</li>
                    <li>• Proper citation format support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}